import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View, Image, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Frame IDs
const IDLE        = 0;
const BLINK_HALF  = 1;
const BLINK_CLOSE = 2;
const LOOK_LEFT   = 3;
const LOOK_RIGHT  = 4;
const SMILE       = 5;

// Blink sequence: each step is { frame, duration ms }
// Slower than the original 50ms — feels like a real, lazy blink
const BLINK_SEQ = [
  { frame: BLINK_HALF,  duration: 120 },
  { frame: BLINK_CLOSE, duration: 200 },
  { frame: BLINK_HALF,  duration: 120 },
];

// How long Owen holds a side glance before returning to idle
const LOOK_HOLD_MS = 1800;

const OwenMascot = ({ size = 120, isHappy = false }) => {
  const [frame, setFrame] = useState(IDLE);
  const scaleIn = useRef(new Animated.Value(1)).current;

  // Sync frame with isHappy when at a neutral state
  useEffect(() => {
    let timeout;
    if (frame === IDLE || frame === SMILE) {
      timeout = setTimeout(() => {
        setFrame(isHappy ? SMILE : IDLE);
      }, 600); // 600ms delay when mood changes
    }
    return () => clearTimeout(timeout);
  }, [isHappy]);

  // ── Random blink loop (every 2–4s) ──
  useEffect(() => {
    let timeout;
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 2000;
      timeout = setTimeout(() => {
        // If happy, transition smoothly: SMILE -> IDLE -> Blink -> IDLE -> SMILE
        const seq = isHappy 
          ? [
              { frame: IDLE, duration: 200 },
              ...BLINK_SEQ,
              { frame: IDLE, duration: 900 }
            ]
          : BLINK_SEQ;

        let i = 0;
        const runStep = () => {
          if (i < seq.length) {
            const { frame: f, duration } = seq[i++];
            setFrame(f);
            timeout = setTimeout(runStep, duration);
          } else {
            setFrame(isHappy ? SMILE : IDLE);
            scheduleBlink();
          }
        };
        runStep();
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
        
        if (isHappy) {
          // Transition through neutral before and after looking
          setFrame(IDLE);
          timeout = setTimeout(() => {
            setFrame(expr);
            timeout = setTimeout(() => {
              setFrame(IDLE);
              timeout = setTimeout(() => {
                setFrame(SMILE);
                scheduleLook();
              }, 900);
            }, LOOK_HOLD_MS);
          }, 200);
        } else {
          setFrame(expr);
          timeout = setTimeout(() => {
            setFrame(IDLE);
            scheduleLook();
          }, LOOK_HOLD_MS);
        }
      }, delay);
    };
    scheduleLook();
    return () => clearTimeout(timeout);
  }, [isHappy]);

  const imgStyle = { width: size, height: size, position: 'absolute' };
  const shown    = { opacity: 1 };
  const hidden   = { opacity: 0 };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={{ width: size, height: size, transform: [{ scale: scaleIn }] }}>
        <Image source={require('../../assets/genius_bot.png')}        fadeDuration={0} style={[imgStyle, frame === IDLE        ? shown : hidden]} resizeMode="contain" />
        <Image source={require('../../assets/owen_blink_half.png')}   fadeDuration={0} style={[imgStyle, frame === BLINK_HALF  ? shown : hidden]} resizeMode="contain" />
        <Image source={require('../../assets/owen_blink_closed.png')} fadeDuration={0} style={[imgStyle, frame === BLINK_CLOSE ? shown : hidden]} resizeMode="contain" />
        <Image source={require('../../assets/owen_look_left.png')}    fadeDuration={0} style={[imgStyle, frame === LOOK_LEFT   ? shown : hidden]} resizeMode="contain" />
        <Image source={require('../../assets/owen_look_right.png')}   fadeDuration={0} style={[imgStyle, frame === LOOK_RIGHT  ? shown : hidden]} resizeMode="contain" />
        <Image source={require('../../assets/owen_smile.png')}        fadeDuration={0} style={[imgStyle, frame === SMILE       ? shown : hidden]} resizeMode="contain" />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'flex-end' },
});

export default OwenMascot;
