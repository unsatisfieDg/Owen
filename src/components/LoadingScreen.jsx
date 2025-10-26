import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const LoadingScreen = () => {
  const pulseAnim = new Animated.Value(1);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Animated Logo */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#6366f1', '#8b5cf6', '#a855f7']}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Icon name="dumbbell" size={60} color="#fff" />
            </Animated.View>
          </LinearGradient>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>MacroGenius</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>Track Your Nutrition</Text>

        {/* Loading Dots */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, { backgroundColor: '#6366f1' }]} />
          <View style={[styles.dot, { backgroundColor: '#a855f7' }]} />
          <View style={[styles.dot, { backgroundColor: '#6366f1' }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 32,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default LoadingScreen;
