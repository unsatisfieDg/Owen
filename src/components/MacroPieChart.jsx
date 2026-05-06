import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MACRO_CONFIG = [
  { key: 'protein', name: 'Protein', color: '#6366f1', icon: 'dumbbell',   cals: 4 },
  { key: 'carbs',   name: 'Carbs',   color: '#10b981', icon: 'food-apple', cals: 4 },
  { key: 'fats',    name: 'Fats',    color: '#f59e0b', icon: 'oil',        cals: 9 },
];

const MacroPieChart = ({ dailyLog, darkMode }) => {
  const chartWidth = SCREEN_WIDTH - 48;

  const macroCals = MACRO_CONFIG.map((m) => ({
    ...m,
    grams: Math.round(dailyLog[m.key] || 0),
    calories: Math.round((dailyLog[m.key] || 0) * m.cals),
  }));

  const totalCalFromMacros = macroCals.reduce((sum, m) => sum + m.calories, 0);
  const hasData = totalCalFromMacros > 0;

  // Pie data — grams per macro, labels hidden
  const pieData = macroCals.map((m) => ({
    name: m.name,
    value: Math.max(m.grams, 0.001),
    color: m.color,
    legendFontColor: 'transparent',
    legendFontSize: 1,
  }));

  const chartConfig = {
    color: () => 'transparent',
  };

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="chart-pie" size={20} color="#a855f7" />
        <Text style={[styles.title, darkMode && styles.textDark]}>Today's Macros</Text>
      </View>

      {/* ── Pie Chart — colors only ── */}
      {hasData ? (
        <View style={styles.chartWrapper}>
          <PieChart
            data={pieData}
            width={chartWidth}
            height={200}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft={String(Math.round(chartWidth / 4))}
            hasLegend={false}
          />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="chart-pie-outline" size={52} color={darkMode ? '#4b5563' : '#d1d5db'} />
          <Text style={[styles.emptyTitle, darkMode && styles.textSecondaryDark]}>
            No food logged yet
          </Text>
          <Text style={[styles.emptySubtext, darkMode && styles.textSecondaryDark]}>
            Add meals to see your calorie breakdown
          </Text>
        </View>
      )}

      {/* ── Macro Details Box ── */}
      <View style={[styles.detailsBox, darkMode && styles.detailsBoxDark]}>
        {/* Macro rows — grams breakdown */}
        {macroCals.map((m, i) => {
          const totalGrams = macroCals.reduce((s, x) => s + x.grams, 0);
          const pct = totalGrams > 0
            ? ((m.grams / totalGrams) * 100).toFixed(0)
            : 0;

          return (
            <View key={m.key}>
              <View style={styles.macroRow}>
                {/* Color dot + icon + name */}
                <View style={styles.macroLeft}>
                  <View style={[styles.colorDot, { backgroundColor: m.color }]} />
                  <Icon name={m.icon} size={14} color={m.color} />
                  <Text style={[styles.macroName, darkMode && styles.textSecondaryDark]}>
                    {m.name}
                  </Text>
                </View>

                {/* Grams */}
                <Text style={[styles.macroGrams, darkMode && styles.textSecondaryDark]}>
                  {m.grams}g
                </Text>

                {/* % badge */}
                <View style={[styles.pctBadge, { backgroundColor: m.color + '22' }]}>
                  <Text style={[styles.pctText, { color: m.color }]}>{pct}%</Text>
                </View>
              </View>

              {/* Bar */}
              <View style={[styles.barTrack, darkMode && styles.barTrackDark]}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${pct}%`, backgroundColor: m.color },
                  ]}
                />
              </View>

              <View style={[styles.rowDivider, darkMode && styles.dividerDark]} />
            </View>
          );
        })}

        {/* Calories row */}
        <View style={styles.macroRow}>
          <View style={styles.macroLeft}>
            <View style={[styles.colorDot, { backgroundColor: '#ef4444' }]} />
            <Icon name="fire" size={14} color="#ef4444" />
            <Text style={[styles.macroName, darkMode && styles.textSecondaryDark]}>
              Calories
            </Text>
          </View>
          <Text style={[styles.macroGrams, darkMode && styles.textSecondaryDark]}>
            {totalCalFromMacros} kcal
          </Text>
          <View style={[styles.pctBadge, { backgroundColor: '#ef444422' }]}>
            <Text style={[styles.pctText, { color: '#ef4444' }]}>total</Text>
          </View>
        </View>
        <View style={[styles.barTrack, darkMode && styles.barTrackDark]}>
          <View style={[styles.barFill, { width: hasData ? '100%' : '0%', backgroundColor: '#ef4444' }]} />
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
    overflow: 'hidden',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16,
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

  // ── Details Box ──
  detailsBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  detailsBoxDark: {
    backgroundColor: '#262626',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 12,
  },
  dividerDark: {
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  macroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  macroGrams: {
    fontSize: 12,
    color: '#6b7280',
    minWidth: 32,
    textAlign: 'right',
  },
  macroCals: {
    fontSize: 13,
    fontWeight: '700',
    minWidth: 64,
    textAlign: 'right',
  },
  pctBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 38,
    alignItems: 'center',
  },
  pctText: {
    fontSize: 11,
    fontWeight: '800',
  },
  barTrack: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  barTrackDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginBottom: 10,
  },
  textDark: { color: '#fff' },
  textSecondaryDark: { color: 'rgba(255,255,255,0.55)' },
});

export default MacroPieChart;
