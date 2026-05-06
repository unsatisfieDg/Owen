import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, Image } from 'react-native';

const FloatingMascot = ({ size = 80 }) => {
  const floatY   = useRef(new Animated.Value(0)).current;
  const floatR   = useRef(new Animated.Value(0)).current;
  const scaleIn  = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    // Pop-in on mount
    Animated.spring(scaleIn, {
      toValue: 1,
      tension: 80,
      friction: 6,
      useNativeDriver: true,
    }).start();

    // Gentle float up/down
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -8,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Subtle rotation rock
    const rockLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatR, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatR, {
          toValue: -1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatR, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    floatLoop.start();
    rockLoop.start();

    return () => {
      floatLoop.stop();
      rockLoop.stop();
    };
  }, []);

  const rotate = floatR.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-4deg', '4deg'],
  });

  return (
    <View style={styles.container}>
      {/* Shadow ellipse */}
      <Animated.View
        style={[
          styles.shadow,
          {
            width: size * 0.65,
            opacity: floatY.interpolate({
              inputRange: [-8, 0],
              outputRange: [0.3, 0.6],
            }),
            transform: [
              {
                scaleX: floatY.interpolate({
                  inputRange: [-8, 0],
                  outputRange: [0.85, 1],
                }),
              },
            ],
          },
        ]}
      />

      {/* Mascot */}
      <Animated.View
        style={{
          transform: [
            { translateY: floatY },
            { rotate },
            { scale: scaleIn },
          ],
        }}
      >
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
  container: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  shadow: {
    height: 6,
    backgroundColor: '#000',
    borderRadius: 50,
    position: 'absolute',
    bottom: -4,
    opacity: 0.5,
  },
});

export default FloatingMascot;
