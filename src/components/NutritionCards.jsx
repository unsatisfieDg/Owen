import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;

const NutritionCards = ({ nutrition, dailyLog, darkMode }) => {
  const progressData = [
    {
      name: 'Calories',
      current: dailyLog.calories || 0,
      target: nutrition.tdee || 0,
      color: '#8b5cf6',
      icon: 'lightning-bolt',
      unit: 'kcal',
    },
    {
      name: 'Protein',
      current: dailyLog.protein || 0,
      target: nutrition.protein || 0,
      color: '#3b82f6',
      icon: 'dumbbell',
      unit: 'g',
    },
    {
      name: 'Carbs',
      current: dailyLog.carbs || 0,
      target: nutrition.carbs || 0,
      color: '#10b981',
      icon: 'food-apple',
      unit: 'g',
    },
  ];

  const getPercentage = (current, target) => {
    if (target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <View style={styles.container}>
      {progressData.map((item) => {
        const percentage = getPercentage(item.current, item.target);
        const remaining = Math.max(0, item.target - item.current);

        return (
          <View key={item.name} style={[styles.card, darkMode && styles.cardDark]}>
            {/* Header */}
            <View style={styles.header}>
              <Icon name={item.icon} size={20} color={item.color} />
              <Text style={[styles.name, darkMode && styles.textDark]}>{item.name}</Text>
              <View style={[styles.badge, { backgroundColor: item.color + '20' }]}>
                <Text style={[styles.badgeText, { color: item.color }]}>
                  {percentage}%
                </Text>
              </View>
            </View>

            {/* Values */}
            <View style={styles.values}>
              <Text style={[styles.current, darkMode && styles.textDark]}>{item.current.toLocaleString()}</Text>
              <Text style={[styles.target, darkMode && styles.textSecondaryDark]}>
                / {item.target.toLocaleString()} {item.unit}
              </Text>
            </View>

            <Text style={[styles.remaining, darkMode && styles.textSecondaryDark]}>
              {percentage >= 100 ? '✓ Goal achieved!' : `${remaining.toLocaleString()} ${item.unit} remaining`}
            </Text>

            {/* Progress Bar */}
            <View style={[styles.progressBarContainer, darkMode && styles.progressBarContainerDark]}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${percentage}%`, backgroundColor: item.color },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: SCREEN_WIDTH < 600 ? 'column' : 'row',
    gap: isSmallScreen ? 8 : 12,
    marginVertical: isSmallScreen ? 12 : 16,
  },
  card: {
    flex: SCREEN_WIDTH < 600 ? undefined : 1,
    backgroundColor: '#fff',
    borderRadius: isSmallScreen ? 12 : 16,
    padding: isSmallScreen ? 12 : 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardDark: {
    backgroundColor: '#262626',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  values: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  current: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  target: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  remaining: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 12,
  },
  textDark: {
    color: '#fff',
  },
  textSecondaryDark: {
    color: 'rgba(255,255,255,0.7)',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarContainerDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
});

export default NutritionCards;
