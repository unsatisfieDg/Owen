import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, Image, Easing, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Frame IDs
const IDLE        = 0;
const BLINK_HALF  = 1;
const BLINK_CLOSE = 2;
const LOOK_LEFT   = 3;
const LOOK_RIGHT  = 4;
const SMILE       = 5;
const WRITING     = 6;

const BLINK_SEQ      = [BLINK_HALF, BLINK_CLOSE, BLINK_HALF, IDLE];
const BLINK_FRAME_MS = 50;

// Idle expressions played randomly
const IDLE_EXPRESSIONS = [LOOK_LEFT, LOOK_RIGHT, SMILE];

const FloatingMascot = ({ size = 120, isHappy = false }) => {
  const [frame, setFrame] = useState(IDLE);
  const scaleIn = useRef(new Animated.Value(0.85)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Sync frame with isHappy when not animating other things
  useEffect(() => {
    if (frame === IDLE || frame === SMILE) {
      setFrame(isHappy ? SMILE : IDLE);
    }
  }, [isHappy]);

  // ── Pop-in on mount ──
  useEffect(() => {
    Animated.spring(scaleIn, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();
  }, []);

  // ── Random blink loop (every 2–4s) ──
  useEffect(() => {
    let timeout;
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 2000;
      timeout = setTimeout(() => {
        let i = 0;
        const runFrame = () => {
          if (i < BLINK_SEQ.length) {
            setFrame(BLINK_SEQ[i++]);
            setTimeout(runFrame, BLINK_FRAME_MS);
          } else {
            setFrame(isHappy ? SMILE : IDLE);
            scheduleBlink();
          }
        };
        runFrame();
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(timeout);
  }, [isHappy]);

  // ── Random look left/right (every 6–10s) ──
  useEffect(() => {
    let timeout;
    const scheduleLook = () => {
      const delay = 6000 + Math.random() * 4000;
      timeout = setTimeout(() => {
        const expr = Math.random() > 0.5 ? LOOK_LEFT : LOOK_RIGHT;
        setFrame(expr);
        setTimeout(() => {
          setFrame(isHappy ? SMILE : IDLE);
          scheduleLook();
        }, 900);
      }, delay);
    };
    scheduleLook();
    return () => clearTimeout(timeout);
  }, [isHappy]);

  // ── Random smile removed, now controlled by isHappy prop ──

  const imgStyle    = { width: size, height: size, position: 'absolute' };
  const shown       = { opacity: 1 };
  const hidden      = { opacity: 0 };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={{
          width: size,
          height: size,
          transform: [
            { scale: scaleIn },
            { translateY: translateY },
          ],
        }}
      >
        <Image source={require('../../assets/owen_writing.png')}      fadeDuration={0} style={[imgStyle, frame === WRITING     ? shown : hidden]} resizeMode="contain" />
        <Image source={require('../../assets/genius_bot.png')}         fadeDuration={0} style={[imgStyle, frame === IDLE        ? shown : hidden]} resizeMode="contain" />
        <Image source={require('../../assets/owen_blink_half.png')}    fadeDuration={0} style={[imgStyle, frame === BLINK_HALF  ? shown : hidden]} resizeMode="contain" />
        <Image source={require('../../assets/owen_blink_closed.png')}  fadeDuration={0} style={[imgStyle, frame === BLINK_CLOSE ? shown : hidden]} resizeMode="contain" />
        <Image source={require('../../assets/owen_look_left.png')}     fadeDuration={0} style={[imgStyle, frame === LOOK_LEFT   ? shown : hidden]} resizeMode="contain" />
        <Image source={require('../../assets/owen_look_right.png')}    fadeDuration={0} style={[imgStyle, frame === LOOK_RIGHT  ? shown : hidden]} resizeMode="contain" />
        <Image source={require('../../assets/owen_smile.png')}         fadeDuration={0} style={[imgStyle, frame === SMILE       ? shown : hidden]} resizeMode="contain" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'flex-end' },
});

export default FloatingMascot;
