import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;

const Header = ({ darkMode, setDarkMode, user, onLogout, userName, greeting, onProfileClick }) => {
  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <View style={[styles.card, darkMode && styles.cardDark]}>
        {/* Logo + Title + Greeting */}
        <View style={styles.leftSection}>
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.logo}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="dumbbell" size={32} color="#fff" />
          </LinearGradient>
          
          <View style={styles.titleContainer}>
            <Text style={[styles.greeting, darkMode && styles.greetingDark]}>
                  {greeting}, {userName || 'there'}!
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
              {/* My Stats Button */}
          <TouchableOpacity
            style={[styles.button, styles.profileButton]}
            onPress={onProfileClick}
          >
            <Icon name="account" size={20} color="#fff" />
          </TouchableOpacity>
              
              {/* Dark Mode Toggle */}
          <TouchableOpacity
            style={[styles.button, darkMode ? styles.darkButton : styles.lightButton]}
            onPress={() => setDarkMode(!darkMode)}
          >
            <Icon 
              name={darkMode ? 'white-balance-sunny' : 'moon-waning-crescent'} 
              size={20} 
              color={darkMode ? '#fbbf24' : '#6b7280'} 
            />
          </TouchableOpacity>
              
              {/* Logout Button */}
              {user && (
            <TouchableOpacity
              style={[styles.button, styles.logoutButton]}
              onPress={onLogout}
            >
              <Icon name="logout" size={20} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: isSmallScreen ? 12 : 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'android' ? 12 : 0,
  },
  containerDark: {
    backgroundColor: '#0f0f0f',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: isSmallScreen ? 12 : 16,
    padding: isSmallScreen ? 12 : 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardDark: {
    backgroundColor: '#1a1a1a',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: isSmallScreen ? 16 : 20,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  titleDark: {
    color: '#8b5cf6',
  },
  greeting: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '600',
    color: '#374151',
  },
  greetingDark: {
    color: '#d1d5db',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButton: {
    backgroundColor: '#6366f1',
  },
  lightButton: {
    backgroundColor: '#f3f4f6',
  },
  darkButton: {
    backgroundColor: '#374151',
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
  },
});

export default Header;
