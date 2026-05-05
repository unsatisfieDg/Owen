import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the offline user outside the hook to maintain a stable memory reference.
// If defined inside, it creates a new object on every render, causing infinite loops in App.js useEffects.
const LOCAL_USER = {
  id: 'offline_athlete_v1',
  username: 'Athlete',
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString()
};

export const useAuth = () => {
  return {
    user: LOCAL_USER,
    isLoading: false,
    signup: async () => ({ success: true, user: LOCAL_USER }),
    login: async () => ({ success: true, user: LOCAL_USER }),
    logout: async () => {},
    updateUser: async () => {},
    isAuthenticated: true
  };
};

// User profile management
export const useUserProfile = (user) => {
  const [profile, setProfile] = useState({
    currentWeight: null,
    targetWeight: null,
    preferences: {
      units: 'metric',
      notifications: true,
      darkMode: false
    }
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        const profileKey = `macroGenie_profile_${user.id}`;
        const savedProfile = await AsyncStorage.getItem(profileKey);
        if (savedProfile) {
          try {
            setProfile(JSON.parse(savedProfile));
          } catch (error) {
            console.error('Error parsing saved profile:', error);
          }
        } else {
          // Reset to default if no profile for this user
          setProfile({
            currentWeight: null,
            targetWeight: null,
            preferences: {
              units: 'metric',
              notifications: true,
              darkMode: false
            }
          });
        }
      }
    };
    
    loadProfile();
  }, [user]);

  const updateProfile = async (updates) => {
    if (!user) return;
    
    const updatedProfile = { ...profile, ...updates };
    setProfile(updatedProfile);
    const profileKey = `macroGenie_profile_${user.id}`;
    await AsyncStorage.setItem(profileKey, JSON.stringify(updatedProfile));
  };

  return {
    profile,
    updateProfile
  };
};

export default { useAuth, useUserProfile };
