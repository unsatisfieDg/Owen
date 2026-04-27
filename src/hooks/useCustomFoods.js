import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useCustomFoods = (userId) => {
  const [customFoods, setCustomFoods] = useState([]);

  useEffect(() => {
    const loadCustomFoods = async () => {
      if (!userId) return;
      try {
        const key = `macroGenie_customFoods_${userId}`;
        const saved = await AsyncStorage.getItem(key);
        if (saved) {
          setCustomFoods(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading custom foods:', error);
      }
    };
    loadCustomFoods();
  }, [userId]);

  const addCustomFood = async (food) => {
    if (!userId) return;
    try {
      const newFoods = [...customFoods, food];
      setCustomFoods(newFoods);
      const key = `macroGenie_customFoods_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(newFoods));
      return true;
    } catch (error) {
      console.error('Error saving custom food:', error);
      return false;
    }
  };

  const removeCustomFood = async (foodId) => {
    if (!userId) return;
    try {
      const newFoods = customFoods.filter(f => f.id !== foodId);
      setCustomFoods(newFoods);
      const key = `macroGenie_customFoods_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(newFoods));
      return true;
    } catch (error) {
      console.error('Error removing custom food:', error);
      return false;
    }
  };

  return {
    customFoods,
    addCustomFood,
    removeCustomFood
  };
};
