import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, Image } from 'react-native';

const FloatingMascot = ({ size = 80 }) => {
  const floatingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create a continuous floating animation
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: -15, // Move up by 15 pixels
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0, // Move back down
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    
    float.start();
    
    return () => float.stop();
  }, [floatingAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateY: floatingAnim }] }}>
        <Image 
          source={require('../../assets/genius_bot.png')} 
          style={[styles.mascot, { width: size, height: size }]} 
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  mascot: {
    borderRadius: 40, // Assuming circular background if any
  }
});

export default FloatingMascot;
