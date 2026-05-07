import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Image } from 'react-native';

const FloatingMascot = ({ size = 120 }) => {
  const scaleIn = useRef(new Animated.Value(0.85)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pop-in on mount
    Animated.parallel([
      Animated.spring(scaleIn, {
        toValue: 1, tension: 80, friction: 6, useNativeDriver: true,
      }),
      Animated.timing(fadeIn, {
        toValue: 1, duration: 400, useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Mascot image (No float or rock animation) */}
      <Animated.View style={{ transform: [{ scale: scaleIn }], opacity: fadeIn }}>
        <Image
          source={require('../../assets/genius_bot.png')}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'flex-end' },
});

export default FloatingMascot;
