/**
 * Secure Storage Utility - React Native Version
 * Provides basic encryption for AsyncStorage data
 * NOTE: This is NOT military-grade encryption, but adds a layer of obfuscation
 * For true security, you need a backend server
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';

// Simple XOR cipher for obfuscation (better than plain text)
const SECRET_KEY = 'MacroGenie_Secure_2024_XYZ'; // In production, this should be more complex

function xorEncrypt(text, key) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return Buffer.from(result, 'binary').toString('base64'); // Base64 encode
}

function xorDecrypt(encoded, key) {
  try {
    const text = Buffer.from(encoded, 'base64').toString('binary'); // Base64 decode
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (e) {
    console.error('Decryption error:', e);
    return null;
  }
}

/**
 * Set encrypted data in AsyncStorage
 */
export const setSecureItem = async (key, value) => {
  try {
    const jsonString = JSON.stringify(value);
    const encrypted = xorEncrypt(jsonString, SECRET_KEY);
    await AsyncStorage.setItem(key, encrypted);
    return true;
  } catch (error) {
    console.error('Error setting secure item:', error);
    return false;
  }
};

/**
 * Get and decrypt data from AsyncStorage
 */
export const getSecureItem = async (key) => {
  try {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;
    
    const decrypted = xorDecrypt(encrypted, SECRET_KEY);
    if (!decrypted) return null;
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Error getting secure item:', error);
    return null;
  }
};

/**
 * Remove item from AsyncStorage
 */
export const removeSecureItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing secure item:', error);
    return false;
  }
};

/**
 * Clear all secure storage
 */
export const clearSecureStorage = async () => {
  try {
    // Only clear MacroGenie keys
    const keys = await AsyncStorage.getAllKeys();
    const macroGeniusKeys = keys.filter(key => key.startsWith('macroGenie_'));
    await AsyncStorage.multiRemove(macroGeniusKeys);
    return true;
  } catch (error) {
    console.error('Error clearing secure storage:', error);
    return false;
  }
};

/**
 * Sanitize user input to prevent XSS - React Native Version
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Basic XSS prevention - escape HTML special characters
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate and sanitize user data
 */
export const sanitizeUserData = (data) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeUserData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};




