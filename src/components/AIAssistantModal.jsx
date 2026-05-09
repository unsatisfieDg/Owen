import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Keyboard, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { processNaturalLanguageFood } from '../utils/aiAssistant';
import { useFoodDatabase } from '../hooks/useFoodDatabase';
import { useCustomFoods } from '../hooks/useCustomFoods';

const AIAssistantModal = ({ visible, onClose, onAddFood, user }) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: "Hi! I'm Owen, your AI Assistant. Tell me what you ate (e.g., 'I had 150g of chicken breast' or '2 eggs for breakfast') and I'll find it for you." }
  ]);
  const [pendingFoodOptions, setPendingFoodOptions] = useState(null);

  const { isReady: isDbReady, searchFoods: searchSQLite } = useFoodDatabase();
  const { customFoods } = useCustomFoods(user?.id);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsProcessing(true);
    setPendingFoodOptions(null);
    Keyboard.dismiss();

    try {
      const response = await processNaturalLanguageFood(userMessage, customFoods, isDbReady ? searchSQLite : null);

      setChatHistory(prev => [...prev, {
        role: 'assistant',
        text: `[${response.source}] ${response.message}`
      }]);

      if (response.success) {
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

          <ScrollView style={styles.chatArea} contentContainerStyle={{ padding: 16 }}>
            {chatHistory.map((msg, index) => (
              <View key={index} style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                <Text style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.assistantText]}>{msg.text}</Text>
              </View>
            ))}

            {isProcessing && (
              <View style={[styles.messageBubble, styles.assistantBubble, styles.loadingBubble]}>
                <ActivityIndicator size="small" color="#8b5cf6" />
                <Text style={styles.processingText}>Processing offline & cloud...</Text>
              </View>
            )}

            {pendingFoodOptions && (
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
  sendButtonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});

export default AIAssistantModal;
