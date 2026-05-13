import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Keyboard, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { processNaturalLanguageFood } from '../utils/aiAssistant';
import { useFoodDatabase } from '../hooks/useFoodDatabase';
import { useCustomFoods } from '../hooks/useCustomFoods';
import { suggestMeal } from '../utils/mealPlanner';
import * as Haptics from 'expo-haptics';

// Parses "150g Chicken Breast (240kcal, 38g P, 0g C, 9g F)" into structured parts
const parseIngredient = (raw) => {
  const macroMatch = raw.match(/\(([^)]+)\)/);
  const macroStr = macroMatch ? macroMatch[1] : null;
  const namePart = raw.replace(/\([^)]+\)/, '').replace(/\*.*?\*/g, '').trim();

  let kcal = null, p = null, c = null, f = null;
  if (macroStr) {
    const kcalM = macroStr.match(/(\d+)\s*kcal/);
    const pM    = macroStr.match(/(\d+)g\s*P/);
    const cM    = macroStr.match(/(\d+)g\s*C/);
    const fM    = macroStr.match(/(\d+)g\s*F/);
    if (kcalM) kcal = kcalM[1];
    if (pM)    p    = pM[1];
    if (cM)    c    = cM[1];
    if (fM)    f    = fM[1];
  }
  return { name: namePart, kcal, p, c, f, hasMacros: !!macroStr };
};

const AIAssistantModal = ({ visible, onClose, onAddFood, user, nutrition, dailyLog, chatHistory, setChatHistory }) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingFoodOptions, setPendingFoodOptions] = useState(null);
  const [suggestedRecipe, setSuggestedRecipe] = useState(null);
  const scrollViewRef = useRef(null);

  // Calculate remaining macros
  const remCalories = Math.max(0, (nutrition?.tdee || 0) - (dailyLog?.calories || 0));
  const remProtein = Math.max(0, (nutrition?.protein || 0) - (dailyLog?.protein || 0));
  const remCarbs = Math.max(0, (nutrition?.carbs || 0) - (dailyLog?.carbs || 0));
  const remFats = Math.max(0, (nutrition?.fats || 0) - (dailyLog?.fats || 0));

  const { isReady: isDbReady, searchFoods: searchSQLite } = useFoodDatabase();
  const { customFoods } = useCustomFoods(user?.id);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsProcessing(true);
    setPendingFoodOptions(null);
    setSuggestedRecipe(null);
    Keyboard.dismiss();

    // Check for meal planning keywords
    if (userMessage.toLowerCase().includes('meal') || userMessage.toLowerCase().includes('suggest') || userMessage.toLowerCase().includes('recipe')) {
      let keyword = '';
      if (userMessage.toLowerCase().includes('filipino') || userMessage.toLowerCase().includes('pinoy')) keyword = 'Filipino';
      if (userMessage.toLowerCase().includes('budget') || userMessage.toLowerCase().includes('student')) keyword = 'Budget';
      
      const suggestion = suggestMeal(nutrition, dailyLog, keyword);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        text: keyword 
          ? `Searching for a healthy ${keyword} meal... I found: **${suggestion.name}**!` 
          : `Based on your remaining macros, I suggest: **${suggestion.name}**. It fits perfectly!` 
      }]);
      setSuggestedRecipe(suggestion);
      setIsProcessing(false);
      return;
    }

    try {
      const response = await processNaturalLanguageFood(userMessage, customFoods, isDbReady ? searchSQLite : null);

      setChatHistory(prev => [...prev, {
        role: 'assistant',
        text: `[${response.source}] ${response.message}`
      }]);

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPendingFoodOptions({
          foods: response.foods,
          serving: response.extractedServing
        });
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', text: "Sorry, I ran into an error processing that. Please try again." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectFood = (food) => {
    const serving = pendingFoodOptions.serving;
    const multiplier = serving / 100;

    const foodToAdd = {
      id: Date.now(),
      name: food.name,
      serving: serving,
      calories: Math.round(food.calories * multiplier),
      protein: Math.round(food.protein * multiplier),
      carbs: Math.round(food.carbs * multiplier),
      fats: Math.round(food.fats * multiplier),
      timestamp: new Date().toISOString()
    };

    onAddFood(foodToAdd);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setChatHistory(prev => [...prev, { role: 'assistant', text: `Added ${serving}g of ${food.name} to your log!` }]);
    setPendingFoodOptions(null);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Image 
                source={require('../../assets/owen_icon_white.png')} 
                style={{ width: 34, height: 34 }} 
                resizeMode="contain" 
                fadeDuration={0}
              />
              <Text style={[styles.title, { color: '#fff' }]}>Ask Owen</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            ref={scrollViewRef}
            style={styles.chatArea} 
            contentContainerStyle={{ padding: 16 }}
            keyboardShouldPersistTaps="handled"
            onScrollBeginDrag={Keyboard.dismiss}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {chatHistory?.map((msg, index) => (
              <View key={index} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                <Text style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.assistantText]}>{msg.text}</Text>
              </View>
            ))}

            {isProcessing && (
              <View style={[styles.messageBubble, styles.assistantBubble, styles.loadingBubble]}>
                <ActivityIndicator size="small" color="#0d9488" />
                <Text style={styles.processingText}>Processing offline & cloud...</Text>
              </View>
            )}

            {pendingFoodOptions?.foods && (
              <View style={styles.optionsContainer}>
                {pendingFoodOptions.foods.map((food, idx) => (
                  <TouchableOpacity key={idx} style={styles.foodOptionCard} onPress={() => handleSelectFood(food)}>
                    <Text style={styles.foodOptionName}>{food.name}</Text>
                    <Text style={styles.foodOptionMacros}>{food.calories}cal • P:{food.protein}g • C:{food.carbs}g</Text>
                    <Icon name="plus-circle" size={24} color="#10b981" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {suggestedRecipe && (
              <View style={styles.recipeCard}>
                <View style={styles.recipeHeader}>
                  <Icon name="silverware-fork-knife" size={24} color="#0d9488" />
                  <Text style={styles.recipeTitle}>{suggestedRecipe.name}</Text>
                </View>
                <Text style={styles.recipeMacros}>
                  {suggestedRecipe.calories} kcal | P: {suggestedRecipe.protein}g | C: {suggestedRecipe.carbs}g | F: {suggestedRecipe.fats}g
                </Text>
                <Text style={styles.recipeSub}>Ingredients:</Text>
                {suggestedRecipe.ingredients?.map((ing, i) => (
                  <Text key={i} style={styles.ingredientText}>• {ing}</Text>
                ))}
                <Text style={[styles.recipeSub, { marginTop: 10 }]}>How to cook:</Text>
                <Text style={styles.instructionsText}>{suggestedRecipe.instructions}</Text>
                <TouchableOpacity 
                  style={styles.addRecipeBtn}
                  onPress={() => {
                    const foodToAdd = {
                      id: Date.now(),
                      name: suggestedRecipe.name,
                      serving: 1,
                      calories: suggestedRecipe.calories,
                      protein: suggestedRecipe.protein,
                      carbs: suggestedRecipe.carbs,
                      fats: suggestedRecipe.fats,
                      timestamp: new Date().toISOString()
                    };
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    onAddFood(foodToAdd);
                    setChatHistory(prev => [...prev, { role: 'assistant', text: `✅ Logged ${suggestedRecipe.name} to your daily log!` }]);
                    setSuggestedRecipe(null);
                  }}
                >
                  <Text style={styles.addRecipeBtnText}>Add Meal to Log</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.quickButtonsContainer}
            contentContainerStyle={styles.quickButtonsContent}
          >
             <TouchableOpacity style={styles.quickBtn} onPress={() => setInputText('Give me a meal suggestion')}>
                <Text style={styles.quickBtnText}>🍱 Suggest Meal</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.quickBtn} onPress={() => setInputText('Suggest a Filipino recipe')}>
                <Text style={styles.quickBtnText}>🇵🇭 Pinoy Recipe</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.quickBtn} onPress={() => setInputText('Budget student meal')}>
                <Text style={styles.quickBtnText}>🎓 Budget Meal</Text>
             </TouchableOpacity>
          </ScrollView>

          <View style={styles.inputArea}>
            <TextInput
              style={styles.textInput}
              placeholder="Tell Owen what you ate... 🍎"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!inputText.trim() || isProcessing}>
              <LinearGradient colors={['#10b981', '#0d9488']} style={styles.sendButtonGradient}>
                <Icon name="send" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '82%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 22, backgroundColor: '#134e4a' },
  titleContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 20, fontWeight: '900', color: '#134e4a', letterSpacing: 0.5 },
  closeBtn: { padding: 6, backgroundColor: '#f3f4f6', borderRadius: 20 },
  chatArea: { flex: 1, backgroundColor: '#f0fdfa' },
  messageBubble: { maxWidth: '85%', padding: 14, borderRadius: 22, marginBottom: 14 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#0d9488', borderBottomRightRadius: 4 },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccfbf1', borderBottomLeftRadius: 4, elevation: 1, shadowColor: '#14b8a6', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  loadingBubble: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  messageText: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#fff', fontWeight: '500' },
  assistantText: { color: '#134e4a' },
  processingText: { color: '#0d9488', fontSize: 14, fontStyle: 'italic', fontWeight: '500' },
  optionsContainer: { marginTop: 10, gap: 10 },
  foodOptionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#ccfbf1', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  foodOptionName: { flex: 1, fontSize: 15, fontWeight: '700', color: '#134e4a' },
  foodOptionMacros: { fontSize: 13, color: '#0d9488', marginRight: 12, fontWeight: '500' },
  inputArea: { flexDirection: 'row', padding: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6', backgroundColor: '#fff', gap: 12, paddingBottom: Platform.OS === 'ios' ? 34 : 20 },
  textInput: { flex: 1, backgroundColor: '#f0fdfa', borderRadius: 28, paddingHorizontal: 20, fontSize: 16, height: 52, borderWidth: 1, borderColor: '#ccfbf1', color: '#134e4a' },
  sendButton: { width: 52, height: 52, borderRadius: 26, overflow: 'hidden', elevation: 3, shadowColor: '#0d9488', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 5 },
  sendButtonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  recipeCard: { backgroundColor: '#fff', padding: 18, borderRadius: 24, marginTop: 10, borderWidth: 2, borderColor: '#0d9488' },
  recipeHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  recipeTitle: { fontSize: 17, fontWeight: '800', color: '#134e4a', flex: 1 },
  macroBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  macroBadge: { flex: 1, borderRadius: 10, paddingVertical: 6, alignItems: 'center' },
  macroBadgeVal: { fontSize: 15, fontWeight: '800' },
  macroBadgeLabel: { fontSize: 10, color: '#6b7280', fontWeight: '600', marginTop: 1 },
  gapRow: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdfa', padding: 8, borderRadius: 10, marginBottom: 12 },
  gapText: { fontSize: 12, color: '#0d9488', fontWeight: '600', flex: 1 },
  recipeMacros: { fontSize: 14, color: '#0d9488', fontWeight: '700', marginBottom: 12 },
  recipeSub: { fontSize: 13, fontWeight: '700', color: '#134e4a', marginBottom: 6 },
  ingredientRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  ingredientText: { fontSize: 13, color: '#4b5563', flex: 1, lineHeight: 19 },
  ingredientCard: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  ingredientNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  ingredientName: { fontSize: 13, fontWeight: '600', color: '#134e4a', flex: 1, lineHeight: 18 },
  ingredientMacroRow: { flexDirection: 'row', gap: 6, marginLeft: 2 },
  ingMacroBadge: { flex: 1, borderRadius: 8, paddingVertical: 4, alignItems: 'center' },
  ingMacroVal: { fontSize: 12, fontWeight: '800' },
  ingMacroLabel: { fontSize: 9, color: '#6b7280', fontWeight: '600' },
  instructionsText: { fontSize: 13, color: '#6b7280', fontStyle: 'italic', lineHeight: 19 },
  addRecipeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0d9488', padding: 13, borderRadius: 14, marginTop: 16 },
  addRecipeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  quickButtonsContainer: { backgroundColor: '#f0fdfa', maxHeight: 60 },
  quickButtonsContent: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center' },
  quickBtn: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ccfbf1' },
  quickBtnText: { fontSize: 13, color: '#0d9488', fontWeight: '600' }
});

export default AIAssistantModal;
