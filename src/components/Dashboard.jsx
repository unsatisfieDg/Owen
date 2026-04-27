import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Header from './Header';
import NutritionInfo from './NutritionInfo';
import NutritionCards from './NutritionCards';
import MacroPieChart from './MacroPieChart';
import FoodTracker from './FoodTracker';
import Footer from './Footer';
import CompletionModal from './CompletionModal';
import { useCompletionTracking } from '../hooks/useCompletionTracking';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Dashboard = ({
  userData,
  nutrition,
  dailyLog,
  setDailyLog,
  weeklyData,
  darkMode,
  setDarkMode,
  user,
  onLogout,
  calculateNutrition,
  navigation,
}) => {
  const [scrollEnabled, setScrollEnabled] = React.useState(true);
  const scrollViewRef = React.useRef(null);
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const lockedScrollPosition = React.useRef(0);
  const isScrollLocked = React.useRef(false);

  // Completion tracking
  const {
    showCompletionModal,
    setShowCompletionModal,
    hasCompletedToday,
    markDayComplete,
    getCompletionStats,
    completionData,
    resetDailyLog: resetLog,
    shouldResetDailyLog,
  } = useCompletionTracking(user?.id);

  const [completionChecked, setCompletionChecked] = useState(false);

  // Check if macros are complete (Calories, Protein, Carbs only)
  const checkMacrosComplete = useCallback(() => {
    if (!nutrition || !nutrition.tdee || !dailyLog || hasCompletedToday || completionChecked) {
      return false;
    }

    const caloriesComplete = dailyLog.calories >= nutrition.tdee * 0.95;
    const proteinComplete = dailyLog.protein >= nutrition.protein * 0.95;
    const carbsComplete = dailyLog.carbs >= nutrition.carbs * 0.95;

    return caloriesComplete && proteinComplete && carbsComplete;
  }, [nutrition, dailyLog, hasCompletedToday, completionChecked]);

  // Check for completion when daily log changes
  useEffect(() => {
    if (checkMacrosComplete() && !hasCompletedToday && !completionChecked) {
      setCompletionChecked(true);
      markDayComplete();
    }
  }, [dailyLog, checkMacrosComplete, hasCompletedToday, completionChecked, markDayComplete]);

  const handleCloseCompletionModal = async () => {
    setShowCompletionModal(false);
    // Reset daily log after celebration
    await resetLog();
    setDailyLog({
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      foods: [],
    });
    // Reset completion check flag for next time
    setCompletionChecked(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleInputFocus = useCallback(() => {
    // Save and lock the current scroll position
    lockedScrollPosition.current = scrollPosition;
    isScrollLocked.current = true;
    setScrollEnabled(false);
  }, [scrollPosition]);

  const handleInputBlur = useCallback(() => {
    // Unlock scroll
    isScrollLocked.current = false;
    setScrollEnabled(true);
  }, []);

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.containerDark]} edges={['top', 'left', 'right']}>
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={user}
        onLogout={onLogout}
        userName={userData.name}
        greeting={getGreeting()}
        onProfileClick={() => navigation.navigate('Profile')}
      />

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEnabled={scrollEnabled}
        scrollEventThrottle={16}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        onScroll={(e) => {
          const currentY = e.nativeEvent.contentOffset.y;
          
          if (isScrollLocked.current) {
            // Force scroll back immediately if locked
            e.preventDefault?.();
            requestAnimationFrame(() => {
              scrollViewRef.current?.scrollTo({ 
                y: lockedScrollPosition.current, 
                animated: false 
              });
            });
          } else {
            // Normal scrolling - save position
            setScrollPosition(currentY);
          }
        }}
        onScrollBeginDrag={() => {
          if (isScrollLocked.current) {
            return false;
          }
        }}
        onMomentumScrollBegin={() => {
          if (isScrollLocked.current) {
            scrollViewRef.current?.scrollTo({ 
              y: lockedScrollPosition.current, 
              animated: false 
            });
          }
        }}
      >
        {/* Main Content Card */}
        <View 
          style={[styles.mainCard, darkMode && styles.mainCardDark]}
          collapsable={false}
          removeClippedSubviews={false}
        >
          {/* Nutrition Info */}
          <NutritionInfo nutrition={nutrition} userData={userData} darkMode={darkMode} />

          {/* Completion Badge */}
          {hasCompletedToday && (
            <View style={[styles.completionBadge, darkMode && styles.completionBadgeDark]}>
              <Icon name="trophy" size={24} color="#fbbf24" />
              <Text style={[styles.completionText, darkMode && styles.completionTextDark]}>
                🎉 Daily Goal Complete!
              </Text>
              {completionData.streak > 0 && (
                <View style={styles.streakBadge}>
                  <Icon name="fire" size={16} color="#f59e0b" />
                  <Text style={styles.streakBadgeText}>{completionData.streak}</Text>
                </View>
              )}
            </View>
          )}

          {/* Progress Cards */}
          <NutritionCards nutrition={nutrition} dailyLog={dailyLog} darkMode={darkMode} />

          {/* Macro Pie Chart */}
          <MacroPieChart dailyLog={dailyLog} darkMode={darkMode} />
        </View>

        {/* Food Tracker */}
        <FoodTracker 
          dailyLog={dailyLog}
          setDailyLog={setDailyLog}
          nutrition={nutrition}
          darkMode={darkMode}
          onInputFocus={handleInputFocus}
          onInputBlur={handleInputBlur}
          user={user}
        />

        {/* Footer */}
        <Footer darkMode={darkMode} />
      </ScrollView>

      {/* Completion Modal */}
      <CompletionModal
        visible={showCompletionModal}
        onClose={handleCloseCompletionModal}
        streak={completionData.streak}
        stats={getCompletionStats()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#0f0f0f',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SCREEN_WIDTH < 375 ? 12 : 16, // Smaller padding for smaller screens
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  mainCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  mainCardDark: {
    backgroundColor: '#1a1a1a',
  },
  completionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 16,
    gap: 12,
  },
  completionBadgeDark: {
    backgroundColor: '#059669',
  },
  completionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  completionTextDark: {
    color: '#fff',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  streakBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default Dashboard;
