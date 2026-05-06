import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MACRO_DOTS = [
  { key: 'calories', label: 'cal',  color: '#ef4444' },
  { key: 'protein',  label: 'P',    color: '#6366f1' },
  { key: 'carbs',    label: 'C',    color: '#10b981' },
  { key: 'fats',     label: 'F',    color: '#f59e0b' },
];

const FoodLogList = ({ foods, onRemove, darkMode }) => {
  if (!foods || foods.length === 0) {
    return (
      <View style={[styles.emptyState, darkMode && styles.emptyStateDark]}>
        <Icon name="food-off" size={40} color={darkMode ? '#4b5563' : '#d1d5db'} />
        <Text style={[styles.emptyTitle, darkMode && styles.textDark]}>No foods logged yet</Text>
        <Text style={[styles.emptySubtext, darkMode && styles.textSecondaryDark]}>
          Search and add meals above
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* List Header */}
      <View style={styles.listHeader}>
        <View style={styles.listHeaderLeft}>
          <Icon name="history" size={16} color="#6366f1" />
          <Text style={[styles.listHeaderText, darkMode && styles.textDark]}>
            Today's Log
          </Text>
        </View>
        <View style={[styles.countBadge]}>
          <Text style={styles.countText}>{foods.length} items</Text>
        </View>
      </View>

      {/* Food Items */}
      {foods.map((food, idx) => (
        <View
          key={food.id || idx}
          style={[styles.foodCard, darkMode && styles.foodCardDark]}
        >
          {/* Left accent bar */}
          <View style={styles.accentBar} />

          <View style={styles.foodContent}>
            {/* Name + time */}
            <View style={styles.foodTop}>
              <Text
                style={[styles.foodName, darkMode && styles.textDark]}
                numberOfLines={1}
              >
                {food.name}
              </Text>
              {food.timestamp && (
                <Text style={[styles.foodTime, darkMode && styles.textSecondaryDark]}>
                  {new Date(food.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              )}
            </View>

            {/* Macro chips */}
            <View style={styles.macroRow}>
              {MACRO_DOTS.map((m) => (
                <View key={m.key} style={[styles.macroChip, { borderColor: m.color + '40' }]}>
                  <View style={[styles.macroDot, { backgroundColor: m.color }]} />
                  <Text style={[styles.macroChipText, { color: m.color }]}>
                    {m.key === 'calories'
                      ? `${Math.round(food[m.key] || 0)} ${m.label}`
                      : `${m.label}: ${Math.round(food[m.key] || 0)}g`}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Remove button */}
          {onRemove && (
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => onRemove(food.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close-circle" size={20} color={darkMode ? '#4b5563' : '#d1d5db'} />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyStateDark: {
    backgroundColor: '#1f1f1f',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  listHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  countBadge: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366f1',
  },
  foodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  foodCardDark: {
    backgroundColor: '#1f1f1f',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  accentBar: {
    width: 3,
    alignSelf: 'stretch',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  foodContent: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  foodTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  foodTime: {
    fontSize: 11,
    color: '#9ca3af',
  },
  macroRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  macroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  macroDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  macroChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  removeBtn: {
    padding: 12,
  },
  textDark: { color: '#fff' },
  textSecondaryDark: { color: 'rgba(255,255,255,0.5)' },
});

export default FoodLogList;
