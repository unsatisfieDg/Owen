import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MACRO_CONFIG = [
  { key: 'protein', name: 'Protein', color: '#6366f1', icon: 'dumbbell',   unit: 'g',    cals: 4 },
  { key: 'carbs',   name: 'Carbs',   color: '#10b981', icon: 'food-apple', unit: 'g',    cals: 4 },
  { key: 'fats',    name: 'Fats',    color: '#f59e0b', icon: 'oil',        unit: 'g',    cals: 9 },
];

const MacroPieChart = ({ dailyLog, darkMode }) => {
  const chartWidth = SCREEN_WIDTH - 48;

  // Build pie data from actual macro grams
  const pieData = MACRO_CONFIG.map((m) => ({
    name: m.name,
    value: Math.max(dailyLog[m.key] || 0, 0.001), // avoid 0 in pie
    color: m.color,
    legendFontColor: darkMode ? 'rgba(255,255,255,0.6)' : '#6b7280',
    legendFontSize: 12,
  }));

  const totalGrams =
    (dailyLog.protein || 0) + (dailyLog.carbs || 0) + (dailyLog.fats || 0);

  // Total calories from macros (4-4-9 rule)
  const calFromMacros =
    (dailyLog.protein || 0) * 4 +
    (dailyLog.carbs || 0) * 4 +
    (dailyLog.fats || 0) * 9;

  const hasData = totalGrams > 0;

  const chartConfig = {
    color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
  };

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon name="chart-pie" size={22} color="#a855f7" />
          <Text style={[styles.title, darkMode && styles.textDark]}>Today's Macros</Text>
        </View>
        {hasData && (
          <Text style={[styles.subtitle, darkMode && styles.textSecondaryDark]}>
            {Math.round(calFromMacros)} kcal from macros
          </Text>
        )}
      </View>

      {/* Chart or Empty State */}
      {hasData ? (
        <View style={styles.chartWrapper}>
          <PieChart
            data={pieData}
            width={chartWidth}
            height={200}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="10"
            hasLegend={false}
            absolute
          />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="chart-pie-outline" size={52} color={darkMode ? '#4b5563' : '#d1d5db'} />
          <Text style={[styles.emptyTitle, darkMode && styles.textSecondaryDark]}>No food logged yet</Text>
          <Text style={[styles.emptySubtext, darkMode && styles.textSecondaryDark]}>
            Add meals below to see your macro breakdown
          </Text>
        </View>
      )}

      {/* Macro Breakdown Chips */}
      <View style={styles.breakdown}>
        {MACRO_CONFIG.map((m) => {
          const val = Math.round(dailyLog[m.key] || 0);
          const pct = totalGrams > 0 ? ((val / totalGrams) * 100).toFixed(0) : 0;

          return (
            <View
              key={m.key}
              style={[styles.chip, { borderColor: m.color + '44' }, darkMode && styles.chipDark]}
            >
              <View style={[styles.chipDot, { backgroundColor: m.color }]} />
              <View style={styles.chipInfo}>
                <Text style={[styles.chipName, darkMode && styles.textSecondaryDark]}>{m.name}</Text>
                <Text style={[styles.chipValue, { color: m.color }]}>
                  {val}g
                </Text>
                {hasData && (
                  <Text style={[styles.chipPct, darkMode && styles.textSecondaryDark]}>{pct}%</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 4,
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 32,
  },
  chartWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  breakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    gap: 8,
  },
  chipDark: {
    backgroundColor: '#262626',
  },
  chipDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
  },
  chipInfo: {
    flex: 1,
  },
  chipName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  chipValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chipPct: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 1,
  },
  textDark: { color: '#fff' },
  textSecondaryDark: { color: 'rgba(255,255,255,0.5)' },
});

export default MacroPieChart;
