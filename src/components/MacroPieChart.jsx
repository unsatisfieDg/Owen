import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const MacroPieChart = ({ dailyLog, darkMode }) => {
  const screenWidth = Dimensions.get('window').width - 48; // Account for padding

  const pieData = [
    {
      name: 'Protein',
      value: dailyLog.protein || 0,
      color: '#3b82f6',
      legendFontColor: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280',
    },
    {
      name: 'Carbs',
      value: dailyLog.carbs || 0,
      color: '#10b981',
      legendFontColor: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280',
    },
    {
      name: 'Calories',
      value: (dailyLog.calories || 0) / 10, // Scale down for visual balance
      color: '#f59e0b',
      legendFontColor: darkMode ? 'rgba(255,255,255,0.7)' : '#6b7280',
    },
  ];

  const totalMacros = (dailyLog.protein || 0) + (dailyLog.carbs || 0);

  const chartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Icon name="lightning-bolt" size={24} color="#a855f7" />
          <Text style={[styles.title, darkMode && styles.textDark]}>Today's Macros</Text>
        </View>
      </View>

      {/* Pie Chart */}
      {totalMacros > 0 ? (
        <View style={styles.chartContainer}>
          <PieChart
            data={pieData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Icon name="chart-pie" size={48} color={darkMode ? '#4b5563' : '#d1d5db'} />
          <Text style={[styles.emptyText, darkMode && styles.textSecondaryDark]}>No data yet</Text>
        </View>
      )}

      {/* Macro Breakdown */}
      <View style={styles.breakdown}>
        {[
          { name: 'Protein', value: dailyLog.protein || 0, color: '#3b82f6', icon: 'dumbbell' },
          { name: 'Carbs', value: dailyLog.carbs || 0, color: '#10b981', icon: 'food-apple' },
          { name: 'Calories', value: dailyLog.calories || 0, color: '#f59e0b', icon: 'fire' },
        ].map((item, index) => {
          const percentage =
            totalMacros > 0 ? ((item.value / totalMacros) * 100).toFixed(1) : 0;
          
          return (
            <View key={item.name} style={[styles.breakdownItem, darkMode && styles.breakdownItemDark]}>
              <Icon name={item.icon} size={20} color={item.color} />
              <Text style={[styles.breakdownValue, darkMode && styles.textDark]}>{item.value}g</Text>
              <Text style={[styles.breakdownPercentage, darkMode && styles.textSecondaryDark]}>{percentage}%</Text>
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
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  containerDark: {
    backgroundColor: '#1a1a1a',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  textDark: {
    color: '#fff',
  },
  chartContainer: {
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  centerText: {
    position: 'absolute',
    top: 85,
    alignItems: 'center',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  textSecondaryDark: {
    color: 'rgba(255,255,255,0.7)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#9ca3af',
    marginTop: 12,
    fontSize: 14,
  },
  breakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  breakdownItem: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    minWidth: 90,
  },
  breakdownItemDark: {
    backgroundColor: '#262626',
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  breakdownPercentage: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default MacroPieChart;
