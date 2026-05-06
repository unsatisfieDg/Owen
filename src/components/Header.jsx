import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import FloatingMascot from './FloatingMascot';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;

const Header = ({ darkMode, setDarkMode, user, userName, greeting, onProfileClick }) => {
  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      <View style={[styles.card, darkMode && styles.cardDark]}>
        {/* Logo + Title + Greeting */}
        <View style={styles.leftSection}>
          <View style={styles.mascotContainer}>
            <FloatingMascot size={50} />
          </View>

          <View style={styles.titleContainer}>
            <Text style={[styles.brandName, darkMode && styles.brandNameDark]}>MacroGenius</Text>
            <Text style={[styles.greeting, darkMode && styles.greetingDark]} numberOfLines={1}>
              {greeting}, {userName || 'there'}!
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.profileButton]}
            onPress={onProfileClick}
          >
            <Icon name="account" size={20} color="#fff" />
          </TouchableOpacity>

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
  mascotContainer: {
    marginRight: 10,
    marginTop: -4,
  },
  titleContainer: {
    flex: 1,
  },
  brandName: {
    fontSize: isSmallScreen ? 15 : 17,
    fontWeight: '800',
    color: '#6366f1',
    letterSpacing: -0.3,
  },
  brandNameDark: {
    color: '#818cf8',
  },
  greeting: {
    fontSize: isSmallScreen ? 11 : 12,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 1,
  },
  greetingDark: {
    color: '#9ca3af',
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
});

export default Header;
