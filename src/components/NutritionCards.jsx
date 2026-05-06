import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;

const NutritionCards = ({ nutrition, dailyLog, darkMode }) => {
  const progressData = [
    {
      name: 'Calories',
      current: Math.round(dailyLog.calories || 0),
      target: nutrition.tdee || 0,
      color: '#ef4444',
      bg: '#fff5f5',
      bgDark: 'rgba(239,68,68,0.12)',
      icon: 'fire',
      unit: 'kcal',
    },
    {
      name: 'Protein',
      current: Math.round(dailyLog.protein || 0),
      target: nutrition.protein || 0,
      color: '#6366f1',
      bg: '#eef2ff',
      bgDark: 'rgba(99,102,241,0.12)',
      icon: 'dumbbell',
      unit: 'g',
    },
    {
      name: 'Carbs',
      current: Math.round(dailyLog.carbs || 0),
      target: nutrition.carbs || 0,
      color: '#10b981',
      bg: '#ecfdf5',
      bgDark: 'rgba(16,185,129,0.12)',
      icon: 'food-apple',
      unit: 'g',
    },
    {
      name: 'Fats',
      current: Math.round(dailyLog.fats || 0),
      target: nutrition.fats || Math.round((nutrition.tdee * 0.25) / 9) || 0,
      color: '#f59e0b',
      bg: '#fffbeb',
      bgDark: 'rgba(245,158,11,0.12)',
      icon: 'oil',
      unit: 'g',
    },
  ];

  const getPercentage = (current, target) => {
    if (target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>Today's Progress</Text>
      <View style={styles.grid}>
        {progressData.map((item) => {
          const percentage = getPercentage(item.current, item.target);
        const remaining = Math.max(0, item.target - item.current);
        const isComplete = percentage >= 100;

        return (
          <View
            key={item.name}
            style={[
              styles.card,
              { backgroundColor: darkMode ? item.bgDark : item.bg },
              darkMode && styles.cardDark,
            ]}
          >
            {/* Icon + Name Row */}
            <View style={styles.cardHeader}>
              <View style={[styles.iconBadge, { backgroundColor: item.color + '22' }]}>
                <Icon name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={[styles.name, darkMode && styles.textSecondaryDark]}>{item.name}</Text>
            </View>

            {/* Values */}
            <Text style={[styles.currentValue, { color: item.color }]}>
              {item.current.toLocaleString()}
              <Text style={[styles.unit, darkMode && styles.textSecondaryDark]}> {item.unit}</Text>
            </Text>

            {/* Target and Percentage Row */}
            <View style={styles.targetRow}>
              <Text style={[styles.targetText, darkMode && styles.textSecondaryDark]}>
                {isComplete ? '✓ Goal reached' : `${remaining.toLocaleString()} ${item.unit} left`}
              </Text>
              <View style={[styles.percentBadge, { backgroundColor: item.color + (isComplete ? 'ff' : '22') }]}>
                <Text style={[styles.percentText, { color: isComplete ? '#fff' : item.color }]}>
                  {percentage}%
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={[styles.progressTrack, darkMode && styles.progressTrackDark]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                  },
                ]}
              />
            </View>

            {/* Target */}
            <Text style={[styles.targetLabel, darkMode && styles.textSecondaryDark]}>
              Goal: {item.target.toLocaleString()} {item.unit}
            </Text>
          </View>
        );
      })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    marginLeft: 4,
  },
  textDark: { color: '#fff' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: isSmallScreen ? 12 : 14,
    marginVertical: 12,
  },
  card: {
    width: '48%',
    borderRadius: 16,
    padding: isSmallScreen ? 12 : 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  cardDark: {
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  percentBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  percentText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  currentValue: {
    fontSize: isSmallScreen ? 22 : 26,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  unit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6b7280',
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  targetText: {
    fontSize: 10,
    color: '#6b7280',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressTrackDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  targetLabel: {
    fontSize: 10,
    color: '#9ca3af',
  },
  textSecondaryDark: {
    color: 'rgba(255,255,255,0.5)',
  },
  textDark: {
    color: '#fff',
  },
});

export default NutritionCards;
