import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const CompletionModal = ({ visible, onClose, streak, stats }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef([...Array(20)].map(() => ({
    translateY: new Animated.Value(0),
    translateX: new Animated.Value(0),
    rotate: new Animated.Value(0),
    opacity: new Animated.Value(1),
  }))).current;

  useEffect(() => {
    if (visible) {
      // Scale animation for the main content
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Confetti animation
      confettiAnims.forEach((anim, index) => {
        Animated.parallel([
          Animated.timing(anim.translateY, {
            toValue: height,
            duration: 3000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: (Math.random() - 0.5) * width,
            duration: 3000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: Math.random() * 10,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } else {
      scaleAnim.setValue(0);
      confettiAnims.forEach((anim) => {
        anim.translateY.setValue(0);
        anim.translateX.setValue(0);
        anim.rotate.setValue(0);
        anim.opacity.setValue(1);
      });
    }
  }, [visible]);

  const confettiColors = ['#10b981', '#6366f1', '#a855f7', '#f59e0b', '#ef4444'];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Confetti */}
        {confettiAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              {
                left: Math.random() * width,
                top: -20,
                backgroundColor: confettiColors[index % confettiColors.length],
                transform: [
                  { translateY: anim.translateY },
                  { translateX: anim.translateX },
                  { rotate: anim.rotate.interpolate({
                      inputRange: [0, 10],
                      outputRange: ['0deg', '360deg'],
                    })
                  },
                ],
                opacity: anim.opacity,
              },
            ]}
          />
        ))}

        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.gradient}
          >
            {/* Trophy Icon */}
            <View style={styles.iconContainer}>
              <Icon name="trophy" size={80} color="#fbbf24" />
            </View>

            {/* Congratulations Text */}
            <Text style={styles.title}>🎉 Congratulations! 🎉</Text>
            <Text style={styles.subtitle}>You've hit your daily macros!</Text>

            {/* Streak */}
            {streak > 0 && (
              <View style={styles.streakContainer}>
                <Icon name="fire" size={32} color="#f59e0b" />
                <Text style={styles.streakText}>{streak} Day Streak!</Text>
              </View>
            )}

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.weeklyComplete || 0}</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.monthlyComplete || 0}</Text>
                <Text style={styles.statLabel}>This Month</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalComplete || 0}</Text>
                <Text style={styles.statLabel}>All Time</Text>
              </View>
            </View>

            {/* Motivational Message */}
            <Text style={styles.message}>
              {getMotivationalMessage(streak)}
            </Text>

            {/* Close Button */}
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Awesome! 💪</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const getMotivationalMessage = (streak) => {
  if (streak >= 30) return "You're a nutrition champion! 🏆";
  if (streak >= 14) return "Two weeks strong! Keep crushing it! 💪";
  if (streak >= 7) return "A full week! You're unstoppable! 🔥";
  if (streak >= 3) return "Three days in a row! Building great habits! ⭐";
  if (streak === 1) return "Great start! Come back tomorrow! 🌟";
  return "Consistency is key! Keep it up! 💚";
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  content: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    padding: 32,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#d1fae5',
    marginBottom: 24,
    textAlign: 'center',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 24,
    gap: 8,
  },
  streakText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#d1fae5',
  },
  message: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    textAlign: 'center',
  },
});

export default CompletionModal;

