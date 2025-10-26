import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const NutritionInfo = ({ nutrition, userData, darkMode }) => {
  if (!nutrition.tdee) return null;

  return (
    <ScrollView style={styles.container}>
      {/* BMI Card */}
      <View style={[styles.card, darkMode && styles.cardDark]}>
        <View style={styles.cardHeader}>
          <Icon name="scale-bathroom" size={20} color="#3b82f6" />
          <Text style={[styles.cardTitle, darkMode && styles.textDark]}>BMI</Text>
        </View>
        <Text style={[styles.cardValue, darkMode && styles.textDark]}>{nutrition.bmi}</Text>
        <Text style={styles.cardSubtitle}>{nutrition.bmiCategory}</Text>
        <Text style={[styles.cardDescription, darkMode && styles.textSecondaryDark]}>{nutrition.bmiRecommendation}</Text>
      </View>

      {/* Calories Card */}
      <View style={[styles.card, darkMode && styles.cardDark]}>
        <View style={styles.cardHeader}>
          <Icon name="fire" size={20} color="#ef4444" />
          <Text style={[styles.cardTitle, darkMode && styles.textDark]}>Daily Calories</Text>
        </View>
        <Text style={[styles.cardValue, darkMode && styles.textDark]}>{nutrition.tdee} kcal</Text>
        <Text style={[styles.cardDescription, darkMode && styles.textSecondaryDark]}>{nutrition.calorieAdjustment}</Text>
      </View>

      {/* Macros Grid */}
      <View style={styles.macrosGrid}>
        <View style={[styles.macroCard, darkMode ? { backgroundColor: 'rgba(239, 68, 68, 0.2)' } : { backgroundColor: '#fee2e2' }]}>
          <View style={styles.macroDot} />
          <Text style={[styles.macroName, darkMode && styles.textDark]}>Protein</Text>
          <Text style={[styles.macroValue, darkMode && styles.textDark]}>{nutrition.protein}g</Text>
          <Text style={[styles.macroDescription, darkMode && styles.textSecondaryDark]}>
            {nutrition.proteinGPerLb || '0.9'} g/lb
          </Text>
        </View>

        <View style={[styles.macroCard, darkMode ? { backgroundColor: 'rgba(16, 185, 129, 0.2)' } : { backgroundColor: '#d1fae5' }]}>
          <View style={[styles.macroDot, { backgroundColor: '#10b981' }]} />
          <Text style={[styles.macroName, darkMode && styles.textDark]}>Carbs</Text>
          <Text style={[styles.macroValue, darkMode && styles.textDark]}>{nutrition.carbs}g</Text>
          <Text style={[styles.macroDescription, darkMode && styles.textSecondaryDark]}>
            {nutrition.carbsGPerLb || '1.75'} g/lb
          </Text>
        </View>
      </View>

      {/* Goal Recommendations */}
      {nutrition.goalRecommendations && (
        <View style={[styles.card, darkMode && styles.cardDark]}>
          <View style={styles.cardHeader}>
            <Icon name="lightbulb" size={20} color="#f59e0b" />
            <Text style={[styles.cardTitle, darkMode && styles.textDark]}>{nutrition.goalRecommendations.title}</Text>
          </View>
          {nutrition.goalRecommendations.tips.slice(0, 3).map((tip, index) => (
            <View key={index} style={styles.tip}>
              <Icon name="check-circle" size={16} color="#10b981" />
              <Text style={[styles.tipText, darkMode && styles.textDark]}>{tip}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardDark: {
    backgroundColor: '#262626',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  textDark: {
    color: '#fff',
  },
  textSecondaryDark: {
    color: 'rgba(255,255,255,0.7)',
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  macrosGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  macroCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  macroDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    marginBottom: 8,
  },
  macroName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  macroDescription: {
    fontSize: 10,
    color: '#6b7280',
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
});

export default NutritionInfo;
