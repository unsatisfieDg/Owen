import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const COMPLETION_KEY = '@macroGenius_completion';
const LAST_COMPLETION_KEY = '@macroGenius_lastCompletion';

export const useCompletionTracking = (user) => {
  const [completionData, setCompletionData] = useState({
    history: [], // Array of completion dates (YYYY-MM-DD)
    streak: 0,
    bestStreak: 0,
    totalComplete: 0,
  });
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);

  // Load completion data
  useEffect(() => {
    if (user) {
      loadCompletionData();
    }
  }, [user]);

  const loadCompletionData = async () => {
    try {
      const data = await AsyncStorage.getItem(`${COMPLETION_KEY}_${user}`);
      if (data) {
        const parsed = JSON.parse(data);
        setCompletionData(parsed);
        checkIfCompletedToday(parsed.history);
      }
    } catch (error) {
      console.error('Error loading completion data:', error);
    }
  };

  const checkIfCompletedToday = (history) => {
    const today = new Date().toISOString().split('T')[0];
    setHasCompletedToday(history.includes(today));
  };

  const calculateStreak = (history) => {
    if (history.length === 0) return 0;

    const sortedDates = [...history].sort().reverse();
    const today = new Date();
    let streak = 0;

    for (let i = 0; i < sortedDates.length; i++) {
      const date = new Date(sortedDates[i]);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      const dateStr = date.toISOString().split('T')[0];
      const expectedStr = expectedDate.toISOString().split('T')[0];

      if (dateStr === expectedStr) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const getCompletionStats = useCallback(() => {
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    const weeklyComplete = completionData.history.filter(dateStr => {
      const date = new Date(dateStr);
      return date >= oneWeekAgo;
    }).length;

    const monthlyComplete = completionData.history.filter(dateStr => {
      const date = new Date(dateStr);
      return date >= oneMonthAgo;
    }).length;

    return {
      weeklyComplete,
      monthlyComplete,
      totalComplete: completionData.totalComplete,
    };
  }, [completionData]);

  const markDayComplete = async () => {
    if (hasCompletedToday) {
      return; // Already completed today
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const newHistory = [...completionData.history, today];
      const newStreak = calculateStreak(newHistory);
      const newBestStreak = Math.max(newStreak, completionData.bestStreak);

      const newData = {
        history: newHistory,
        streak: newStreak,
        bestStreak: newBestStreak,
        totalComplete: completionData.totalComplete + 1,
      };

      await AsyncStorage.setItem(`${COMPLETION_KEY}_${user}`, JSON.stringify(newData));
      setCompletionData(newData);
      setHasCompletedToday(true);

      // Trigger haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Show completion modal
      setShowCompletionModal(true);

      return newData;
    } catch (error) {
      console.error('Error marking day complete:', error);
    }
  };

  const resetDailyLog = async () => {
    try {
      await AsyncStorage.setItem(`${LAST_COMPLETION_KEY}_${user}`, new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Error resetting daily log:', error);
      return false;
    }
  };

  const shouldResetDailyLog = async () => {
    try {
      const lastCompletion = await AsyncStorage.getItem(`${LAST_COMPLETION_KEY}_${user}`);
      if (!lastCompletion) return false;

      const lastDate = new Date(lastCompletion).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];

      return lastDate !== today;
    } catch (error) {
      console.error('Error checking daily reset:', error);
      return false;
    }
  };

  return {
    completionData,
    showCompletionModal,
    setShowCompletionModal,
    hasCompletedToday,
    markDayComplete,
    getCompletionStats,
    resetDailyLog,
    shouldResetDailyLog,
  };
};

