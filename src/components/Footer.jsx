import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const Footer = ({ darkMode }) => {
  const currentYear = new Date().getFullYear();

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      {/* Brand row */}
      <View style={styles.brandRow}>
        <LinearGradient
          colors={['#0d9488', '#134e4a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconBox}
        >
          <Image 
            source={require('../../assets/owen_icon_white.png')} 
            style={{ width: 22, height: 22 }} 
            resizeMode="contain"
            fadeDuration={0}
          />
        </LinearGradient>
        <View style={styles.brandText}>
          <Text style={[styles.brandName, darkMode && styles.textDark]}>Owen</Text>
          <Text style={[styles.brandTagline, darkMode && styles.textSecondaryDark]}>
            Your personal nutrition buddy
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.githubBtn, darkMode && styles.githubBtnDark]}
          onPress={() => Linking.openURL('https://github.com/unsatisfieDg')}
        >
          <Icon name="github" size={18} color={darkMode ? '#9ca3af' : '#6b7280'} />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={[styles.divider, darkMode && styles.dividerDark]} />

      {/* Copyright */}
      <View style={styles.copyrightRow}>
        <Text style={[styles.copyrightText, darkMode && styles.textSecondaryDark]}>
          © {currentYear} Owen
        </Text>
        <View style={styles.madewith}>
          <Text style={[styles.copyrightText, darkMode && styles.textSecondaryDark]}>
            Made with{' '}
          </Text>
          <Icon name="heart" size={12} color="#ef4444" />
          <Text style={[styles.copyrightText, darkMode && styles.textSecondaryDark]}>
            {' '}for your health
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
    borderColor: 'rgba(255,255,255,0.07)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    flex: 1,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  brandTagline: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 1,
  },
  githubBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  githubBtnDark: {
    backgroundColor: '#262626',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginBottom: 14,
  },
  dividerDark: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  copyrightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  madewith: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  textDark: { color: '#fff' },
  textSecondaryDark: { color: 'rgba(255,255,255,0.4)' },
});

export default memo(Footer);
