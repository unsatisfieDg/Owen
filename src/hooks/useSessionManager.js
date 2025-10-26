import { useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

/**
 * Session Manager Hook for React Native
 * Handles automatic logout on inactivity and session expiration
 */
export const useSessionManager = (user, onLogout) => {
  const SESSION_TIMEOUT = 3600000; // 1 hour in milliseconds
  const ACTIVITY_CHECK_INTERVAL = 60000; // Check every minute
  
  const lastActivityRef = useRef(Date.now());
  const activityCheckIntervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  // Update last activity timestamp
  const updateActivity = useCallback(async () => {
    lastActivityRef.current = Date.now();
    if (user) {
      await AsyncStorage.setItem('macroGenie_lastActivity', lastActivityRef.current.toString());
    }
  }, [user]);

  // Check if session has expired
  const checkSession = useCallback(async () => {
    if (!user) return;

    const now = Date.now();
    const savedActivity = await AsyncStorage.getItem('macroGenie_lastActivity');
    const lastActivity = parseInt(savedActivity || now.toString());
    const timeSinceLastActivity = now - lastActivity;

    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      console.log('Session expired due to inactivity');
      onLogout();
      // Note: Alert will be handled in the component
    }
  }, [user, SESSION_TIMEOUT, onLogout]);

  // Setup app state listener for React Native
  useEffect(() => {
    if (!user) return;

    const handleAppStateChange = async (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground - check session
        await checkSession();
      }
      
      if (nextAppState === 'active') {
        // User is actively using the app
        await updateActivity();
      }
      
      appStateRef.current = nextAppState;
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Set up periodic session check
    activityCheckIntervalRef.current = setInterval(checkSession, ACTIVITY_CHECK_INTERVAL);

    // Initial activity update
    updateActivity();

    // Cleanup
    return () => {
      subscription.remove();
      if (activityCheckIntervalRef.current) {
        clearInterval(activityCheckIntervalRef.current);
      }
    };
  }, [user, updateActivity, checkSession]);

  // Check session on mount
  useEffect(() => {
    if (user) {
      checkSession();
    }
  }, [user, checkSession]);

  return {
    updateActivity,
    sessionTimeout: SESSION_TIMEOUT
  };
};
