import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const Footer = ({ darkMode }) => {
  const currentYear = new Date().getFullYear();

  const openGitHub = () => {
    Linking.openURL('https://github.com/unsatisfieDg');
  };

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      {/* Brand Section */}
      <View style={styles.brandSection}>
        <View style={styles.brandHeader}>
          <View style={styles.iconContainer}>
            <Icon name="heart" size={20} color="#fff" />
          </View>
          <Text style={[styles.brandTitle, darkMode && styles.textDark]}>MacroGenius</Text>
        </View>
        <Text style={[styles.brandDescription, darkMode && styles.textSecondaryDark]}>
          Track your nutrition to achieve your health and fitness goals.
        </Text>
      </View>

      {/* Connect Section */}
      <TouchableOpacity style={[styles.githubButton, darkMode && styles.githubButtonDark]} onPress={openGitHub}>
        <Icon name="github" size={24} color="#6366f1" />
      </TouchableOpacity>

      {/* Copyright */}
      <View style={[styles.copyright, darkMode && styles.copyrightDark]}>
        <Text style={[styles.copyrightText, darkMode && styles.textSecondaryDark]}>
          © {currentYear} MacroGenius. Made with{' '}
        </Text>
        <Icon name="heart" size={14} color="#ef4444" />
        <Text style={[styles.copyrightText, darkMode && styles.textSecondaryDark]}> for your health.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginTop: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  brandSection: {
    marginBottom: 24,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: '#6366f1',
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  textDark: {
    color: '#fff',
  },
  brandDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  textSecondaryDark: {
    color: 'rgba(255,255,255,0.7)',
  },
  githubButton: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  githubButtonDark: {
    backgroundColor: '#262626',
  },
  copyright: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  copyrightDark: {
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  copyrightText: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default Footer;
