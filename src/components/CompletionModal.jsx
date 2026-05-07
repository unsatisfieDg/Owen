import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const CONFETTI_COLORS = ['#0d9488', '#5eead4', '#10b981', '#f59e0b', '#0f766e', '#2dd4bf'];
const CONFETTI_COUNT = 24;

const getMotivationalMessage = (streak) => {
  if (streak >= 30) return "You're a nutrition champion! 🏆";
  if (streak >= 14) return "Two weeks strong! Unstoppable! 💪";
  if (streak >= 7)  return "A full week of consistency! 🔥";
  if (streak >= 3)  return "Building incredible habits! ⭐";
  if (streak === 1) return "Amazing start! See you tomorrow! 🌟";
  return "Consistency is your superpower! 💚";
};

const CompletionModal = ({ visible, onClose, streak, stats }) => {
  const scaleAnim  = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const trophyBounce = useRef(new Animated.Value(0)).current;

  const confettiAnims = useRef(
    [...Array(CONFETTI_COUNT)].map(() => ({
      translateY: new Animated.Value(-20),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      // Overlay fade + card spring
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Trophy bounce loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(trophyBounce, {
            toValue: -12,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(trophyBounce, {
            toValue: 0,
            duration: 500,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Confetti
      confettiAnims.forEach((anim, i) => {
        const startX = (Math.random() - 0.5) * width * 0.6;
        anim.translateX.setValue(startX);
        anim.translateY.setValue(-20);
        anim.opacity.setValue(1);
        anim.rotate.setValue(0);

        Animated.parallel([
          Animated.timing(anim.translateY, {
            toValue: height * 0.85,
            duration: 2500 + Math.random() * 1500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: startX + (Math.random() - 0.5) * 120,
            duration: 2500 + Math.random() * 1500,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: Math.random() > 0.5 ? 5 : -5,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(1500),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      trophyBounce.setValue(0);
      confettiAnims.forEach((a) => {
        a.translateY.setValue(-20);
        a.translateX.setValue(0);
        a.rotate.setValue(0);
        a.opacity.setValue(1);
      });
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        {/* Confetti */}
        {confettiAnims.map((anim, i) => (
          <Animated.View
            key={i}
            style={[
              styles.confetti,
              i % 3 === 0 ? styles.confettiCircle : i % 3 === 1 ? styles.confettiRect : styles.confettiStar,
              {
                left: width * 0.1 + Math.random() * width * 0.8,
                top: 0,
                backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                transform: [
                  { translateY: anim.translateY },
                  { translateX: anim.translateX },
                  {
                    rotate: anim.rotate.interpolate({
                      inputRange: [-5, 5],
                      outputRange: ['-180deg', '180deg'],
                    }),
                  },
                ],
                opacity: anim.opacity,
              },
            ]}
          />
        ))}

        {/* Card */}
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={['#0d9488', '#0f766e', '#134e4a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {/* Trophy */}
            <Animated.View style={{ transform: [{ translateY: trophyBounce }] }}>
              <View style={styles.trophyRing}>
                <Icon name="trophy" size={56} color="#fbbf24" />
              </View>
            </Animated.View>

            {/* Title */}
            <Text style={styles.title}>Daily Goal Complete!</Text>
            <Text style={styles.subtitle}>You crushed all four macros today 🎯</Text>

            {/* Streak */}
            {streak > 0 && (
              <View style={styles.streakBadge}>
                <Icon name="fire" size={22} color="#f97316" />
                <Text style={styles.streakText}>{streak} Day Streak</Text>
              </View>
            )}

            {/* Stats row */}
            <View style={styles.statsRow}>
              {[
                { label: 'This Week', value: stats?.weeklyComplete ?? 0 },
                { label: 'This Month', value: stats?.monthlyComplete ?? 0 },
                { label: 'All Time',  value: stats?.totalComplete ?? 0 },
              ].map((s, i, arr) => (
                <React.Fragment key={s.label}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                  {i < arr.length - 1 && <View style={styles.statDivider} />}
                </React.Fragment>
              ))}
            </View>

            {/* Message */}
            <Text style={styles.message}>{getMotivationalMessage(streak)}</Text>

            {/* CTA */}
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.closeBtnText}>Awesome! Keep it up 💪</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    width: 9,
    height: 9,
  },
  confettiCircle: {
    borderRadius: 5,
  },
  confettiRect: {
    borderRadius: 2,
    width: 7,
    height: 12,
  },
  confettiStar: {
    borderRadius: 1,
    width: 10,
    height: 10,
    transform: [{ rotate: '45deg' }],
  },
  card: {
    width: width * 0.88,
    maxWidth: 380,
    borderRadius: 28,
    overflow: 'hidden',
  },
  gradient: {
    padding: 32,
    alignItems: 'center',
  },
  trophyRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  streakText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },
  statValue: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 24,
    lineHeight: 22,
  },
  closeBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f766e',
  },
});

export default CompletionModal;
