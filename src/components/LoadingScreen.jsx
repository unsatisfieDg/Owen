import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Easing,
  Image,
  useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import OwenMascot from './OwenMascot';

const LoadingScreen = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 0,
      useNativeDriver: true,
    }).start();

    // Bouncing dots staggered
    const animateDot = (anim, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: -10,
            duration: 350,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 350,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(700 - delay),
        ])
      );

    const a1 = animateDot(dot1, 0);
    const a2 = animateDot(dot2, 150);
    const a3 = animateDot(dot3, 300);
    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, []);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Use app's background colors
  const bgColor = isDark ? '#0f0f0f' : '#f8f9fa';
  const brandColor = '#0f766e';
  const dotColor = isDark ? '#14b8a6' : '#0d9488';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#0a0a0a', '#134e4a', '#06201e'] : ['#f0fdfa', '#ccfbf1', '#99f6e4']}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.content, { opacity: fadeIn }]}>
        {/* Mascot */}
        <View style={styles.mascotWrapper}>
          <Image 
            source={require('../../assets/owen_icon_white.png')} 
            style={{ width: 140, height: 140, tintColor: isDark ? '#2dd4bf' : '#0d9488' }} 
            resizeMode="contain" 
            fadeDuration={0}
          />
        </View>

        {/* Brand */}
        <Text style={[styles.appName, { color: isDark ? '#fff' : '#134e4a' }]}>MacroGenius</Text>
        <Text style={[styles.tagline, { color: isDark ? '#94a3b8' : '#0f766e' }]}>Owen is preparing your nutrition data...</Text>

        {/* Bouncing dots */}
        <View style={styles.dotsRow}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                { transform: [{ translateY: dot }] },
                { backgroundColor: i === 0 ? '#10b981' : i === 1 ? '#34d399' : '#6ee7b7' }
              ]}
            />
          ))}
        </View>

        <Text style={[styles.loadingText, { color: isDark ? '#64748b' : '#9ca3af' }]}>Hybrid AI & Offline DB Syncing</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  mascotWrapper: {
    marginBottom: 12,
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1.5,
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 16,
    marginTop: 2,
    marginBottom: 40,
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default LoadingScreen;
