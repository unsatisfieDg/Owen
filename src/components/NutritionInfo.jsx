import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const NutritionInfo = ({ nutrition, userData, darkMode }) => {
  if (!nutrition.tdee) return null;

  const macros = [
    {
      name: 'Protein',
      value: `${nutrition.protein}g`,
      sub: `${nutrition.proteinGPerLb || '0.9'} g/lb`,
      color: '#6366f1',
      icon: 'dumbbell',
      bg: '#eef2ff',
      bgDark: 'rgba(99,102,241,0.15)',
    },
    {
      name: 'Carbs',
      value: `${nutrition.carbs}g`,
      sub: `${nutrition.carbsGPerLb || '1.75'} g/lb`,
      color: '#10b981',
      icon: 'food-apple',
      bg: '#ecfdf5',
      bgDark: 'rgba(16,185,129,0.15)',
    },
    {
      name: 'Fats',
      value: `${nutrition.fats || Math.round((nutrition.tdee * 0.25) / 9)}g`,
      sub: '~25% of calories',
      color: '#f59e0b',
      icon: 'oil',
      bg: '#fffbeb',
      bgDark: 'rgba(245,158,11,0.15)',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, darkMode && styles.textDark]}>Daily Macro Targets</Text>
      
      {/* TDEE + BMI Row */}
      <View style={styles.topRow}>
        {/* Daily Calories Card */}
        <View style={[styles.calorieCard, darkMode && styles.calorieCardDark]}>
          <View style={styles.calorieHeader}>
            <Icon name="fire" size={20} color="#ef4444" />
            <Text style={[styles.calorieLabel, darkMode && styles.textSecondaryDark]}>Calories</Text>
          </View>
          <Text style={[styles.calorieValue, darkMode && styles.textDark]}>{nutrition.tdee}</Text>
          <Text style={[styles.calorieUnit, darkMode && styles.textSecondaryDark]}>kcal / day</Text>
          <Text style={[styles.calorieSub, darkMode && styles.textSecondaryDark]} numberOfLines={2}>
            {nutrition.calorieAdjustment}
          </Text>
        </View>

        {/* BMI Card */}
        <View style={[styles.bmiCard, darkMode && styles.bmiCardDark]}>
          <View style={styles.calorieHeader}>
            <Icon name="scale-bathroom" size={20} color="#3b82f6" />
            <Text style={[styles.calorieLabel, darkMode && styles.textSecondaryDark]}>BMI</Text>
          </View>
          <Text style={[styles.bmiValue, darkMode && styles.textDark]}>{nutrition.bmi}</Text>
          <Text style={styles.bmiCategory}>{nutrition.bmiCategory} BMI</Text>
        </View>
      </View>

      {/* Macro Targets Row */}
      <View style={styles.macroRow}>
        {macros.map((m) => (
          <View
            key={m.name}
            style={[
              styles.macroChip,
              { backgroundColor: darkMode ? m.bgDark : m.bg, borderColor: m.color + '30' },
            ]}
          >
            <Icon name={m.icon} size={18} color={m.color} style={styles.macroIcon} />
            <Text style={[styles.macroName, darkMode && styles.textSecondaryDark]}>{m.name}</Text>
            <Text style={[styles.macroValue, { color: m.color }]}>{m.value}</Text>
            <Text style={[styles.macroSub, darkMode && styles.textSecondaryDark]}>{m.sub}</Text>
          </View>
        ))}
      </View>

      {/* Goal Tips */}
      {nutrition.goalRecommendations && (
        <View style={[styles.tipsCard, darkMode && styles.tipsCardDark]}>
          <View style={styles.tipsHeader}>
            <Icon name="lightbulb-on" size={18} color="#f59e0b" />
            <Text style={[styles.tipsTitle, darkMode && styles.textDark]}>
              {nutrition.goalRecommendations.title}
            </Text>
          </View>
          {nutrition.goalRecommendations.tips.slice(0, 3).map((tip, i) => (
            <View key={i} style={styles.tip}>
              <Icon name="check-circle-outline" size={14} color="#10b981" />
              <Text style={[styles.tipText, darkMode && styles.textSecondaryDark]}>{tip}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  topRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  calorieCard: {
    flex: 1.3,
    backgroundColor: '#fff5f5',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  calorieCardDark: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.2)',
  },
  bmiCard: {
    flex: 1,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  bmiCardDark: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderColor: 'rgba(59,130,246,0.2)',
  },
  calorieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  calorieLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  calorieValue: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 34,
  },
  calorieUnit: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 6,
  },
  calorieSub: {
    fontSize: 10,
    color: '#6b7280',
    lineHeight: 14,
  },
  bmiValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 32,
  },
  bmiCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 4,
  },
  bmiDesc: {
    fontSize: 10,
    color: '#6b7280',
    lineHeight: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  macroChip: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  macroIcon: {
    marginBottom: 6,
  },
  macroName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  macroSub: {
    fontSize: 9,
    color: '#9ca3af',
    marginTop: 2,
    textAlign: 'center',
  },
  tipsCard: {
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  tipsCardDark: {
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderColor: 'rgba(245,158,11,0.2)',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  tipText: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
    lineHeight: 16,
  },
  textDark: { color: '#fff' },
  textSecondaryDark: { color: 'rgba(255,255,255,0.55)' },
});

export default NutritionInfo;
