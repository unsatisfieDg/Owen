import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { processNaturalLanguageFood } from '../utils/aiAssistant';
import { useFoodDatabase } from '../hooks/useFoodDatabase';
import { useCustomFoods } from '../hooks/useCustomFoods';

const AIAssistantModal = ({ visible, onClose, onAddFood, user }) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: "Hi! I'm your MacroGenius AI Assistant. Tell me what you ate (e.g., 'I had 150g of chicken breast' or '2 eggs for breakfast') and I'll find it for you." }
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
              <Icon name="robot-outline" size={24} color="#8b5cf6" />
              <Text style={styles.title}>Hybrid AI Assistant</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={24} color="#6b7280" />
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
              placeholder="e.g. I had 200g of rice..."
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!inputText.trim() || isProcessing}>
              <LinearGradient colors={['#8b5cf6', '#6d28d9']} style={styles.sendButtonGradient}>
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
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  titleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  closeBtn: { padding: 4 },
  chatArea: { flex: 1, backgroundColor: '#f9fafb' },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#8b5cf6', borderBottomRightRadius: 4 },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', borderBottomLeftRadius: 4 },
  loadingBubble: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  messageText: { fontSize: 15 },
  userText: { color: '#fff' },
  assistantText: { color: '#1f2937' },
  processingText: { color: '#6b7280', fontSize: 14, fontStyle: 'italic' },
  optionsContainer: { marginTop: 8, gap: 8 },
  foodOptionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  foodOptionName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1f2937' },
  foodOptionMacros: { fontSize: 12, color: '#6b7280', marginRight: 12 },
  inputArea: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#fff', gap: 12 },
  textInput: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 24, paddingHorizontal: 16, fontSize: 15, height: 48 },
  sendButton: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden' },
  sendButtonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});

export default AIAssistantModal;
