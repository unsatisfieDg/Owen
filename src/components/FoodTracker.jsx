import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
  Keyboard,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { searchFoodDatabase } from '../utils/foodDatabase';
import { useCustomFoods } from '../hooks/useCustomFoods';
import { useFoodDatabase } from '../hooks/useFoodDatabase';
import AIAssistantModal from './AIAssistantModal';

// Conditionally import BarCodeScanner (not available in Expo Go)
let BarCodeScanner = null;
try {
  BarCodeScanner = require('expo-barcode-scanner').BarCodeScanner;
} catch (e) {
  console.log('BarCodeScanner not available in this environment');
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FoodTracker = ({ dailyLog, setDailyLog, nutrition, darkMode, onInputFocus, onInputBlur, user }) => {
  const [foodSearch, setFoodSearch] = useState('');
  const [foodAmount, setFoodAmount] = useState('100');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [liveResults, setLiveResults] = useState([]);
  const searchInputRef = useRef(null);
  const containerRef = useRef(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  // Barcode scanner states
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isLoadingBarcode, setIsLoadingBarcode] = useState(false);

  // AI Assistant state
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // Custom Foods
  const { customFoods, addCustomFood } = useCustomFoods(user?.id);
  const [showCustomFoodModal, setShowCustomFoodModal] = useState(false);
  const [customFoodForm, setCustomFoodForm] = useState({
    name: '', serving: '100', calories: '', protein: '', carbs: '', fats: ''
  });

  // SQLite Offline Database
  const { isReady: isDbReady, searchFoods: searchSQLite } = useFoodDatabase();

  // Manage parent scroll based on input focus
  useEffect(() => {
    if (isInputFocused) {
      onInputFocus?.();
    } else {
      onInputBlur?.();
    }
  }, [isInputFocused, onInputFocus, onInputBlur]);

  // Request camera permission for barcode scanner
  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      if (BarCodeScanner) {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      } else {
        setHasPermission(false);
      }
    };
    getBarCodeScannerPermissions();
  }, []);

  // Live search from local database as user types
  const handleInputChange = async (text) => {
    setFoodSearch(text);
    
    // Ensure parent scroll stays locked while typing
    if (!isInputFocused) {
      setIsInputFocused(true);
    }
    
    if (text.trim().length >= 2) {
      // Search SQLite offline database first (massive 10k+ item DB)
      const sqliteResults = isDbReady ? await searchSQLite(text) : [];
      // Also search legacy local array as a fallback
      const legacyResults = searchFoodDatabase(text);
      const customResults = customFoods.filter(f => f.name.toLowerCase().includes(text.toLowerCase()));
      // Merge: custom first, then SQLite, then legacy (deduplicated)
      const merged = [
        ...customResults,
        ...sqliteResults,
        ...legacyResults.filter(l => !sqliteResults.some(s => s.name.toLowerCase() === l.name.toLowerCase()))
      ].slice(0, 8);
      setLiveResults(merged);
    } else {
      setLiveResults([]);
    }
  };

  // Search using API when user clicks search
  const handleSearch = async () => {
    if (!foodSearch.trim()) {
      Alert.alert('Enter Food', 'Please enter a food name to search.');
      return;
    }
    
    setIsSearching(true);
    setShowResults(true);
    
    try {
      // Offline Search: SQLite + Legacy + Custom
      const sqliteResults = isDbReady ? await searchSQLite(foodSearch) : [];
      const localResults = searchFoodDatabase(foodSearch);
      const customResults = customFoods.filter(f => f.name.toLowerCase().includes(foodSearch.toLowerCase()));

      // Merge: custom > SQLite > legacy (deduplicated by name)
      const seen = new Set();
      const combined = [
        ...customResults,
        ...sqliteResults,
        ...localResults
      ].filter(item => {
        const key = item.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 20);
      
      setSearchResults(combined);
      
      if (combined.length === 0) {
        Alert.alert('No Results', 'No food found. Try a different name!');
      }
    } catch (error) {
      console.error('Food search error:', error);
      Alert.alert('Error', 'Failed to search foods.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectFood = (food) => {
    setSelectedFood(food);
  };

  const handleAddFood = () => {
    if (!selectedFood || !foodAmount) {
      Alert.alert('Missing Info', 'Please select a food and enter an amount.');
      return;
    }

    const amount = parseFloat(foodAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    const multiplier = amount / 100;
    const food = {
      id: Date.now(),
      name: selectedFood.name,
      serving: amount,
      calories: Math.round(selectedFood.calories * multiplier),
      protein: Math.round(selectedFood.protein * multiplier),
      carbs: Math.round(selectedFood.carbs * multiplier),
      fats: Math.round(selectedFood.fats * multiplier),
      timestamp: new Date().toISOString()
    };

    setDailyLog(prev => ({
      calories: prev.calories + food.calories,
      protein: prev.protein + food.protein,
      carbs: prev.carbs + food.carbs,
      fats: prev.fats + food.fats,
      foods: [...prev.foods, food]
    }));

    // Reset
    setSelectedFood(null);
    setFoodAmount('100');
    setFoodSearch('');
    setSearchResults([]);
    setLiveResults([]);
    setShowResults(false);
    
    Alert.alert('Success!', `${food.name} added to your log! 🎉`);
  };

  // Fetch product data from OpenFoodFacts API
  const fetchBarcodeData = async (barcode) => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const product = data.product;
        const nutriments = product.nutriments || {};
        
        // Try to get per serving data first, fallback to per 100g
        const servingSize = product.serving_quantity || product.product_quantity || 100;
        
        // Extract nutrition per serving (or per 100g if serving not available)
        const calories = Math.round(
          nutriments['energy-kcal_serving'] || 
          nutriments['energy-kcal_100g'] || 
          nutriments['energy-kcal'] || 
          0
        );
        const protein = Math.round(
          nutriments.proteins_serving || 
          nutriments.proteins_100g || 
          nutriments.proteins || 
          0
        );
        const carbs = Math.round(
          nutriments.carbohydrates_serving || 
          nutriments.carbohydrates_100g || 
          nutriments.carbohydrates || 
          0
        );
        const fats = Math.round(
          nutriments.fat_serving || 
          nutriments.fat_100g || 
          nutriments.fat || 
          0
        );
        
        return {
          name: product.product_name || 'Unknown Product',
          serving: servingSize,
          calories: calories,
          protein: protein,
          carbs: carbs,
          fats: fats,
        };
      }
      return null;
    } catch (error) {
      console.error('Barcode fetch error:', error);
      return null;
    }
  };

  // Handle barcode scan
  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setIsLoadingBarcode(true);
    
    try {
      const productData = await fetchBarcodeData(data);
      
      if (productData) {
        // Automatically add food to daily log
        const food = {
          id: Date.now(),
          name: productData.name,
          serving: productData.serving,
          calories: productData.calories,
          protein: productData.protein,
          carbs: productData.carbs,
          fats: productData.fats,
          timestamp: new Date().toISOString()
        };

        setDailyLog(prev => ({
          calories: prev.calories + food.calories,
          protein: prev.protein + food.protein,
          carbs: prev.carbs + food.carbs,
          fats: prev.fats + food.fats,
          foods: [...prev.foods, food]
        }));

        setShowScanner(false);
        
        // Show success alert with nutrition info (only calories, carbs, protein)
        Alert.alert(
          '✅ Added to Log!',
          `${productData.name}\n\n` +
          `Serving: ${productData.serving}g\n` +
          `Calories: ${productData.calories}\n` +
          `Protein: ${productData.protein}g\n` +
          `Carbs: ${productData.carbs}g`,
          [{ text: 'Great! 🎉' }]
        );
      } else {
        setShowScanner(false);
        Alert.alert('Not Found', 'Product not found in database. Try searching manually.');
      }
    } catch (error) {
      setShowScanner(false);
      Alert.alert('Error', 'Failed to fetch product data. Please try again.');
    } finally {
      setIsLoadingBarcode(false);
      setScanned(false);
    }
  };

  const handleOpenScanner = () => {
    if (hasPermission === null) {
      Alert.alert('Permission Required', 'Requesting camera permission...');
      return;
    }
    if (hasPermission === false) {
      Alert.alert('No Camera Access', 'Please enable camera permissions in your device settings to scan barcodes.');
      return;
    }
    setShowScanner(true);
    setScanned(false);
  };

  const handleRemoveFood = (foodId) => {
    const food = dailyLog.foods.find(f => f.id === foodId);
    if (!food) return;

    Alert.alert(
      'Remove Food',
      `Remove ${food.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setDailyLog(prev => ({
              calories: prev.calories - food.calories,
              protein: prev.protein - food.protein,
              carbs: prev.carbs - food.carbs,
              fats: prev.fats - food.fats,
              foods: prev.foods.filter(f => f.id !== foodId)
            }));
          }
        }
      ]
    );
  };


  return (
    <View 
      ref={containerRef}
      style={[styles.container, darkMode && styles.containerDark]}
      onLayout={() => {}}
      collapsable={false}
      removeClippedSubviews={false}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => false}
    >
      <View style={styles.header}>
        <Icon name="food-apple" size={24} color="#10b981" />
        <Text style={[styles.title, darkMode && styles.titleDark]}>Food Tracker</Text>
      </View>

      {/* Search Area - wrapped for absolute positioning */}
      <View style={styles.searchArea}>
        {/* Search Bar */}
        <View style={styles.searchContainer} collapsable={false} onStartShouldSetResponder={() => true}>
        <View style={styles.searchInputContainer}>
          <Icon name="magnify" size={20} color="#9ca3af" />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search food (e.g., chicken, banana)..."
            value={foodSearch}
            onChangeText={handleInputChange}
            onFocus={() => {
              setIsInputFocused(true);
              // Prevent scroll on focus
              searchInputRef.current?.setNativeProps({ caretHidden: false });
            }}
            onBlur={() => {
              setIsInputFocused(false);
              setTimeout(() => setLiveResults([]), 200);
            }}
            onSubmitEditing={() => {
              Keyboard.dismiss();
              handleSearch();
            }}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            scrollEnabled={false}
            textContentType="none"
          />
          {foodSearch.length > 0 && (
            <TouchableOpacity onPress={() => {
              setFoodSearch('');
              setLiveResults([]);
              setSearchResults([]);
            }}>
              <Icon name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={() => {
            Keyboard.dismiss();
            handleSearch();
          }}
          disabled={isSearching}
        >
          <LinearGradient
            colors={isSearching ? ['#d1d5db', '#9ca3af'] : ['#10b981', '#059669']}
            style={styles.searchButtonGradient}
          >
            {isSearching ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Icon name="plus" size={24} color="#fff" />
            )}
          </LinearGradient>
        </TouchableOpacity>
        
        {/* Barcode Scanner Button - Only show if available */}
        {BarCodeScanner && (
          <TouchableOpacity 
            style={styles.barcodeButton} 
            onPress={handleOpenScanner}
          >
            <LinearGradient
              colors={['#6366f1', '#4f46e5']}
              style={styles.searchButtonGradient}
            >
              <Icon name="barcode-scan" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* AI Assistant Button */}
        <TouchableOpacity 
          style={styles.barcodeButton} 
          onPress={() => setShowAIAssistant(true)}
        >
          <LinearGradient
            colors={['#8b5cf6', '#6d28d9']}
            style={styles.searchButtonGradient}
          >
            <Icon name="robot" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

        {/* Live Search Results */}
        {liveResults.length > 0 && !showResults && (
          <View style={styles.liveResults}>
            {liveResults.map((food, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.liveResultItem}
                onPress={() => {
                  Keyboard.dismiss();
                  setSelectedFood(food);
                  setFoodSearch(food.name);
                  setLiveResults([]);
                }}
              >
                <Icon name="food" size={16} color="#6b7280" />
                <Text style={styles.liveResultText}>{food.name}</Text>
                <Text style={styles.liveResultMacro}>{food.calories} cal</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Search Results Modal */}
      <Modal visible={showResults} animationType="slide" transparent={true}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Results</Text>
              <TouchableOpacity onPress={() => setShowResults(false)}>
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loadingText}>Searching foods...</Text>
              </View>
            ) : (
              <>
                <ScrollView 
                  style={styles.resultsScroll}
                  keyboardShouldPersistTaps="handled"
                >
                  {searchResults.map((food, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.resultItem,
                        selectedFood?.name === food.name && styles.resultItemSelected
                      ]}
                      onPress={() => handleSelectFood(food)}
                    >
                      <View style={styles.resultInfo}>
                        <Text style={styles.foodName}>{food.name}</Text>
                        <Text style={styles.foodMacros}>
                          {food.calories}cal • P:{food.protein}g • C:{food.carbs}g • F:{food.fats}g
                        </Text>
                      </View>
                      {selectedFood?.name === food.name && (
                        <Icon name="check-circle" size={24} color="#10b981" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {selectedFood && (
                  <View style={styles.addSection}>
                    <View style={styles.amountContainer}>
                      <Text style={styles.amountLabel}>Amount (g):</Text>
                      <TextInput
                        style={styles.servingInput}
                        placeholder="100"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        value={foodAmount}
                        onChangeText={setFoodAmount}
                      />
                    </View>
                    <TouchableOpacity style={styles.addButton} onPress={handleAddFood}>
                      <LinearGradient
                        colors={['#10b981', '#059669']}
                        style={styles.addButtonGradient}
                      >
                        <Icon name="plus" size={20} color="#fff" />
                        <Text style={styles.addButtonText}>Add Food</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Create Custom Food Button inside Search Results */}
                <View style={styles.createCustomFoodContainer}>
                  <Text style={styles.createCustomFoodText}>Can't find what you're looking for?</Text>
                  <TouchableOpacity 
                    style={styles.createCustomFoodBtn} 
                    onPress={() => {
                      setShowResults(false);
                      setShowCustomFoodModal(true);
                      setCustomFoodForm({...customFoodForm, name: foodSearch});
                    }}
                  >
                    <Text style={styles.createCustomFoodBtnText}>Create Custom Food</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Food Log */}
      <View style={styles.foodLogHeader}>
        <Text style={styles.foodLogTitle}>Today's Log</Text>
        <Text style={styles.foodLogCount}>{dailyLog.foods.length} items</Text>
      </View>

      <ScrollView style={styles.foodLog}>
        {dailyLog.foods.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="food-off" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No foods logged yet</Text>
            <Text style={styles.emptySubtext}>Search and add food above to start tracking</Text>
          </View>
        ) : (
          dailyLog.foods.map((food) => (
            <View key={food.id} style={styles.foodItem}>
              <View style={styles.foodInfo}>
                <Text style={styles.foodItemName}>{food.name}</Text>
                <Text style={styles.foodItemDetails}>
                  {food.serving}g • {food.calories}cal • P:{food.protein}g • C:{food.carbs}g
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFood(food.id)}
              >
                <Icon name="close-circle" size={24} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Barcode Scanner Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}
      >
        <View style={styles.scannerContainer}>
          {hasPermission && BarCodeScanner && (
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={StyleSheet.absoluteFillObject}
            />
          )}
          
          {isLoadingBarcode && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Fetching product data...</Text>
            </View>
          )}

          <View style={styles.scannerOverlay}>
            <Text style={styles.scannerTitle}>Scan Food Barcode</Text>
            <Text style={styles.scannerSubtitle}>Position barcode within the frame</Text>
            
            <View style={styles.scannerFrame}>
              <View style={[styles.corner, styles.cornerTopLeft]} />
              <View style={[styles.corner, styles.cornerTopRight]} />
              <View style={[styles.corner, styles.cornerBottomLeft]} />
              <View style={[styles.corner, styles.cornerBottomRight]} />
            </View>

            <TouchableOpacity
              style={styles.closeScannerButton}
              onPress={() => setShowScanner(false)}
            >
              <Icon name="close-circle" size={48} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Food Modal */}
      <Modal visible={showCustomFoodModal} animationType="slide" transparent={true}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Custom Food</Text>
              <TouchableOpacity onPress={() => setShowCustomFoodModal(false)}>
                <Icon name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.resultsScroll} keyboardShouldPersistTaps="handled">
              <View style={styles.customFoodFormContainer}>
                <Text style={styles.amountLabel}>Food Name</Text>
                <TextInput
                  style={[styles.servingInput, { marginBottom: 12 }]}
                  placeholder="e.g. Grandma's Cookies"
                  value={customFoodForm.name}
                  onChangeText={(text) => setCustomFoodForm({...customFoodForm, name: text})}
                />
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.amountLabel}>Serving Size (g/ml)</Text>
                    <TextInput
                      style={styles.servingInput}
                      keyboardType="numeric"
                      placeholder="100"
                      value={customFoodForm.serving}
                      onChangeText={(text) => setCustomFoodForm({...customFoodForm, serving: text})}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.amountLabel}>Calories (kcal)</Text>
                    <TextInput
                      style={styles.servingInput}
                      keyboardType="numeric"
                      placeholder="0"
                      value={customFoodForm.calories}
                      onChangeText={(text) => setCustomFoodForm({...customFoodForm, calories: text})}
                    />
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.amountLabel}>Protein (g)</Text>
                    <TextInput
                      style={styles.servingInput}
                      keyboardType="numeric"
                      placeholder="0"
                      value={customFoodForm.protein}
                      onChangeText={(text) => setCustomFoodForm({...customFoodForm, protein: text})}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.amountLabel}>Carbs (g)</Text>
                    <TextInput
                      style={styles.servingInput}
                      keyboardType="numeric"
                      placeholder="0"
                      value={customFoodForm.carbs}
                      onChangeText={(text) => setCustomFoodForm({...customFoodForm, carbs: text})}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.amountLabel}>Fats (g)</Text>
                    <TextInput
                      style={styles.servingInput}
                      keyboardType="numeric"
                      placeholder="0"
                      value={customFoodForm.fats}
                      onChangeText={(text) => setCustomFoodForm({...customFoodForm, fats: text})}
                    />
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.addButton} 
                  onPress={async () => {
                    if (!customFoodForm.name || !customFoodForm.calories) {
                      Alert.alert('Missing Info', 'Please provide at least a name and calories.');
                      return;
                    }
                    const newFood = {
                      id: Date.now().toString(),
                      name: customFoodForm.name,
                      category: 'custom',
                      serving: parseFloat(customFoodForm.serving) || 100,
                      calories: parseFloat(customFoodForm.calories) || 0,
                      protein: parseFloat(customFoodForm.protein) || 0,
                      carbs: parseFloat(customFoodForm.carbs) || 0,
                      fats: parseFloat(customFoodForm.fats) || 0
                    };
                    await addCustomFood(newFood);
                    setShowCustomFoodModal(false);
                    setFoodSearch(newFood.name);
                    setSelectedFood(newFood);
                    setSearchResults([newFood]);
                    setShowResults(true);
                  }}
                >
                  <LinearGradient colors={['#10b981', '#059669']} style={styles.addButtonGradient}>
                    <Icon name="content-save" size={20} color="#fff" />
                    <Text style={styles.addButtonText}>Save Custom Food</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* AI Assistant Modal */}
      <AIAssistantModal 
        visible={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        onAddFood={(food) => {
          setDailyLog(prev => ({
            calories: prev.calories + food.calories,
            protein: prev.protein + food.protein,
            carbs: prev.carbs + food.carbs,
            fats: prev.fats + food.fats,
            foods: [...prev.foods, food]
          }));
          setShowAIAssistant(false);
        }}
        user={user}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  titleDark: {
    color: '#fff',
  },
  searchArea: {
    position: 'relative',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: '#1f2937',
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveResults: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  liveResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  liveResultText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  liveResultMacro: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  resultsScroll: {
    maxHeight: 300,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 8,
  },
  resultItemSelected: {
    backgroundColor: '#d1fae5',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  resultInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  foodMacros: {
    fontSize: 12,
    color: '#6b7280',
  },
  addSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  addSectionFixed: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  amountContainer: {
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  servingInput: {
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  addButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createCustomFoodContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  createCustomFoodText: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 8,
  },
  createCustomFoodBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  createCustomFoodBtnText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  customFoodFormContainer: {
    paddingBottom: 20,
  },
  foodLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  foodLogTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  foodLogCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  foodLog: {
    maxHeight: 300,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#d1d5db',
    marginTop: 4,
    textAlign: 'center',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 8,
  },
  foodInfo: {
    flex: 1,
  },
  foodItemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  foodItemDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  removeButton: {
    padding: 4,
  },
  // Barcode Scanner Styles
  barcodeButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    marginLeft: 8,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  scannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scannerSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#10b981',
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  closeScannerButton: {
    padding: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
});

export default FoodTracker;
