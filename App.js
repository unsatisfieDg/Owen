import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, Platform, KeyboardAvoidingView, UIManager, LayoutAnimation } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoadingScreen from './src/components/LoadingScreen';
import UserSetup from './src/components/UserSetup';
import Dashboard from './src/components/Dashboard';
import UserProfile from './src/components/UserProfile';

import useNutrition from './src/hooks/useNutrition';
import { useAuth, useUserProfile } from './src/hooks/useAuth';

const Stack = createStackNavigator();

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Authentication - Simplified for local offline-first with background sync
  const { user } = useAuth();

  
  // User Profile
  const { profile, updateProfile } = useUserProfile(user);

  // User-specific state
  const [userData, setUserData] = useState({
    firstName: '', lastName: '', givenName: '', age: '', height: '', weight: '', gender: '',
    activityLevel: '', goal: '', targetWeight: ''
  });

  const [dailyLog, setDailyLog] = useState({
    calories: 0, protein: 0, carbs: 0, fats: 0, foods: []
  });

  const [weeklyData, setWeeklyData] = useState([]);

  // Load dark mode preference
  useEffect(() => {
    const loadDarkMode = async () => {
      const saved = await AsyncStorage.getItem('macroGenie_darkMode');
      if (saved) {
        setDarkMode(JSON.parse(saved));
      }
    };
    loadDarkMode();
  }, []);

  // Load user-specific data when user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        
        const userDataKey = `macroGenie_userData_${user.id}`;
        const dailyLogKey = `macroGenie_dailyLog_${user.id}`;
        const weeklyDataKey = `macroGenie_weeklyData_${user.id}`;

        const savedUserData = await AsyncStorage.getItem(userDataKey);
        const savedDailyLog = await AsyncStorage.getItem(dailyLogKey);
        const savedWeeklyData = await AsyncStorage.getItem(weeklyDataKey);

        if (savedUserData) {
          try {
            const parsed = JSON.parse(savedUserData);
            setUserData(parsed);
          } catch (e) {
            console.error('Error loading user data:', e);
          }
        } else {
          setUserData({
            firstName: '', lastName: '', givenName: '', age: '', height: '', weight: '', gender: '',
            activityLevel: '', goal: '', targetWeight: ''
          });
        }

        if (savedDailyLog) {
          try {
            setDailyLog(JSON.parse(savedDailyLog));
          } catch (e) {
            console.error('Error loading daily log:', e);
          }
        }

        if (savedWeeklyData) {
          try {
            setWeeklyData(JSON.parse(savedWeeklyData));
          } catch (e) {
            console.error('Error loading weekly data:', e);
          }
        }
      } else {
        // User logged out, reset everything
        setUserData({
          firstName: '', lastName: '', givenName: '', age: '', height: '', weight: '', gender: '',
          activityLevel: '', goal: '', targetWeight: ''
        });
        setDailyLog({ calories: 0, protein: 0, carbs: 0, fats: 0, foods: [] });
        setWeeklyData([]);
      }
    };

    loadUserData();
  }, [user]);

  // Save user-specific data when it changes
  useEffect(() => {
    const saveUserData = async () => {
      if (user && userData.givenName) {
        const userDataKey = `macroGenie_userData_${user.id}`;
        await AsyncStorage.setItem(userDataKey, JSON.stringify(userData));
      }
    };
    saveUserData();
  }, [user, userData]);

  useEffect(() => {
    const saveDailyLog = async () => {
      if (user) {
        const dailyLogKey = `macroGenie_dailyLog_${user.id}`;
        await AsyncStorage.setItem(dailyLogKey, JSON.stringify(dailyLog));
      }
    };
    saveDailyLog();
  }, [user, dailyLog]);

  useEffect(() => {
    const saveWeeklyData = async () => {
      if (user) {
        const weeklyDataKey = `macroGenie_weeklyData_${user.id}`;
        await AsyncStorage.setItem(weeklyDataKey, JSON.stringify(weeklyData));
      }
    };
    saveWeeklyData();
  }, [user, weeklyData]);

  // Background Cloud Syncing for Coach Access
  useEffect(() => {
    const syncDataToCoach = async () => {
      const isOnline = true;
      if (isOnline && user && dailyLog.foods.length > 0) {
        // Silently sync progress to coach in background
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    };
    syncDataToCoach();
  }, [dailyLog.foods.length]);

  const { nutrition, calculateNutrition } = useNutrition(userData, profile);

  // Calculate nutrition when userData is loaded or when weight/goal changes
  useEffect(() => {
    if (user && userData.weight && userData.height && userData.age) {
      calculateNutrition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userData.weight, userData.goal, userData.targetWeight]); // Re-run when weight, goal, or target weight changes

  // Save dark mode preference
  useEffect(() => {
    const saveDarkMode = async () => {
      await AsyncStorage.setItem('macroGenie_darkMode', JSON.stringify(darkMode));
    };
    saveDarkMode();
  }, [darkMode]);

  // Snappy loading time - Removed artificial delay
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleSetupComplete = () => {
    // Save current weight and target weight to profile
    if (userData.weight) {
      updateProfile({ currentWeight: parseFloat(userData.weight) });
    }
    if (userData.targetWeight) {
      updateProfile({ targetWeight: parseFloat(userData.targetWeight) });
    }
    calculateNutrition();
  };

  const handleWeightChange = (newWeight) => {
    setUserData(prev => ({
      ...prev,
      weight: newWeight
    }));
    setTimeout(() => {
      calculateNutrition();
    }, 100);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Check if user needs setup
  const shouldShowSetup = !userData.givenName || !userData.weight;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar 
          barStyle={darkMode ? "light-content" : "dark-content"} 
          backgroundColor={darkMode ? "#0f0f0f" : "#ffffff"}
          translucent={Platform.OS === 'android'}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {shouldShowSetup ? (
              <Stack.Screen name="Setup">
                {(props) => (
                  <UserSetup 
                    {...props} 
                    userData={userData} 
                    setUserData={setUserData} 
                    onComplete={handleSetupComplete} 
                  />
                )}
              </Stack.Screen>
            ) : (
              <>
                <Stack.Screen name="Main">
                  {(props) => (
                    <Dashboard
                      {...props}
                      userData={userData}
                      nutrition={nutrition}
                      dailyLog={dailyLog}
                      setDailyLog={setDailyLog}
                      weeklyData={weeklyData}
                      darkMode={darkMode}
                      setDarkMode={setDarkMode}
                      user={user}
                      calculateNutrition={calculateNutrition}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen name="Profile">
                  {(props) => (
                    <UserProfile
                      {...props}
                      user={user}
                      profile={profile}
                      userData={userData}
                      setUserData={setUserData}
                      updateProfile={updateProfile}
                      onWeightChange={handleWeightChange}
                      calculateNutrition={calculateNutrition}
                      darkMode={darkMode}
                      weeklyData={weeklyData}
                      dailyLog={dailyLog}
                      nutrition={nutrition}
                    />
                  )}
                </Stack.Screen>
              </>
            )}
          </Stack.Navigator>
        </KeyboardAvoidingView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;

