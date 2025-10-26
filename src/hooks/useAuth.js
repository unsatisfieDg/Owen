import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

// Simple password hashing using SHA-256
const hashPassword = async (password) => {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return hash;
};

// Get all users from AsyncStorage
const getAllUsers = async () => {
  const usersData = await AsyncStorage.getItem('macroGenie_users');
  if (!usersData) return [];
  try {
    return JSON.parse(usersData);
  } catch (error) {
    console.error('Error parsing users:', error);
    return [];
  }
};

// Save users to AsyncStorage
const saveUsers = async (users) => {
  await AsyncStorage.setItem('macroGenie_users', JSON.stringify(users));
};

// User authentication and management
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const loadUser = async () => {
      const savedUser = await AsyncStorage.getItem('macroGenie_currentUser');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user:', error);
          await AsyncStorage.removeItem('macroGenie_currentUser');
        }
      }
      setIsLoading(false);
    };
    
    loadUser();
  }, []);

  const signup = async (username, password) => {
    const users = await getAllUsers();
    
    // Check if username already exists
    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
      return { success: false, error: 'Username already exists' };
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username: username,
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // Save to users list
    users.push(newUser);
    await saveUsers(users);

    // Set as current user (without password hash)
    const userSession = {
      id: newUser.id,
      username: newUser.username,
      createdAt: newUser.createdAt,
      lastLogin: newUser.lastLogin
    };
    
    setUser(userSession);
    await AsyncStorage.setItem('macroGenie_currentUser', JSON.stringify(userSession));
    
    return { success: true, user: userSession };
  };

  const login = async (username, password) => {
    const users = await getAllUsers();
    
    // Find user by username (case-insensitive)
    const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!foundUser) {
      return { success: false, error: 'Incorrect username or password' };
    }

    // Hash the provided password and compare
    const hashedPassword = await hashPassword(password);
    
    if (hashedPassword !== foundUser.passwordHash) {
      return { success: false, error: 'Incorrect username or password' };
    }

    // Update last login
    foundUser.lastLogin = new Date().toISOString();
    await saveUsers(users);

    // Set as current user (without password hash)
    const userSession = {
      id: foundUser.id,
      username: foundUser.username,
      createdAt: foundUser.createdAt,
      lastLogin: foundUser.lastLogin
    };
    
    setUser(userSession);
    await AsyncStorage.setItem('macroGenie_currentUser', JSON.stringify(userSession));
    
    return { success: true, user: userSession };
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('macroGenie_currentUser');
  };

  const updateUser = async (updates) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    
    setUser(updatedUser);
    await AsyncStorage.setItem('macroGenie_currentUser', JSON.stringify(updatedUser));
  };

  return {
    user,
    isLoading,
    signup,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user
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
