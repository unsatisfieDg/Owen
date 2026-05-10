import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Easing,
  Image,
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

  return (
    <LinearGradient
      colors={['#0d9488', '#0f766e', '#134e4a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeIn }]}>
        {/* Mascot */}
        <View style={styles.mascotWrapper}>
          <Image 
            source={require('../../assets/owen_icon_white.png')} 
            style={{ width: 120, height: 120 }} 
            resizeMode="contain" 
            fadeDuration={0}
          />
        </View>

        {/* Brand */}
        <Text style={styles.appName}>Owen</Text>
        <Text style={styles.tagline}>Your personal nutrition buddy</Text>

        {/* Bouncing dots */}
        <View style={styles.dotsRow}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                { transform: [{ translateY: dot }] },
                i === 1 && { backgroundColor: '#5eead4' },
                i === 2 && { backgroundColor: '#2dd4bf' },
              ]}
            />
          ))}
        </View>

        <Text style={styles.loadingText}>Loading your data...</Text>
      </Animated.View>
    </LinearGradient>
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
    marginBottom: 8,
  },
  appName: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    marginBottom: 36,
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccfbf1',
  },
  loadingText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
});

export default LoadingScreen;
