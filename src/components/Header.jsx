import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import FloatingMascot from './FloatingMascot';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;

const DAYS = [
  'SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY',
];
const MONTHS = [
  'JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
  'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER',
];

const getDateString = () => {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
};

const getContextualMessage = (dailyLog, nutrition) => {
  if (!nutrition?.tdee) return 'Set up your profile to unlock personalized targets!';
  const cals        = dailyLog?.calories || 0;
  const remaining   = Math.round(nutrition.tdee - cals);
  const proteinLeft = Math.round((nutrition.protein || 0) - (dailyLog?.protein || 0));
  if (cals === 0)        return "You haven't logged anything yet. What did you eat today?";
  if (remaining > 800)   return `You still have ${remaining} kcal room today. Keep fueling up!`;
  if (remaining < 0)     return `You're ${Math.abs(remaining)} kcal over your goal. Maybe a lighter dinner?`;
  if (remaining < 150)   return `Almost at your goal — just ${remaining} kcal left. You've got this!`;
  if (proteinLeft > 30)  return `Protein check! ${proteinLeft}g left to hit your target. 💪`;
  return 'Looking great today! Stay consistent and keep the momentum going. 🔥';
};

const Header = ({
  darkMode,
  setDarkMode,
  user,
  userName,
  greeting,
  onProfileClick,
  onMascotPress,
  dailyLog,
  nutrition,
}) => {
  const message = getContextualMessage(dailyLog, nutrition);
  
  // Calculate if Owen should be happy (>= 50% progress)
  const progress = nutrition?.tdee ? (dailyLog?.calories || 0) / nutrition.tdee : 0;
  const isHappy = progress >= 0.5;

  return (
    <View style={[styles.container, darkMode && styles.containerDark]}>

      {/* ── Top Row: Date + Icon Buttons ── */}
      <View style={styles.topRow}>
        <Text style={[styles.dateText, darkMode && styles.dateTextDark]}>
          {getDateString()}
        </Text>

        <View style={styles.topButtons}>
          {/* Goals → Profile */}
          <TouchableOpacity
            style={[styles.goalBtn, darkMode && styles.goalBtnDark]}
            onPress={onProfileClick}
          >
            <Icon name="flag-outline" size={15} color="#0f766e" />
            <Text style={styles.goalBtnText}>Goals</Text>
          </TouchableOpacity>

          {/* Dark mode toggle */}
          <TouchableOpacity
            style={[styles.iconBtn, darkMode && styles.iconBtnDark]}
            onPress={() => setDarkMode(!darkMode)}
          >
            <Icon
              name={darkMode ? 'white-balance-sunny' : 'moon-waning-crescent'}
              size={18}
              color={darkMode ? '#fbbf24' : '#6b7280'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Big Greeting ── */}
      <Text style={[styles.greeting, darkMode && styles.greetingDark]}>
        {greeting},{'\n'}
        <Text style={[styles.greetingName, darkMode && styles.greetingNameDark]}>
          {userName || 'there'}!
        </Text>
      </Text>

      {/* ── Mascot + Speech Bubble ── */}
      <View style={styles.mascotRow}>
        <TouchableOpacity onPress={onMascotPress} activeOpacity={0.8} style={styles.mascotTouch}>
          <FloatingMascot size={isSmallScreen ? 180 : 200} isHappy={isHappy} />
        </TouchableOpacity>

        {/* Speech bubble */}
        <View style={[styles.bubble, darkMode && styles.bubbleDark]}>
          {/* Small left pointer */}
          <View style={[styles.bubblePointer, darkMode && styles.bubblePointerDark]} />
          <Text style={styles.bubbleName}>Owen</Text>
          <Text style={[styles.bubbleText, darkMode && styles.bubbleTextDark]}>
            {message}
          </Text>
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? 8 : 2,
    paddingBottom: 0,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
  },
  containerDark: {
    backgroundColor: '#0f0f0f',
  },

  /* ── Top Row ── */
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
    paddingHorizontal: isSmallScreen ? 12 : 16,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  dateTextDark: {
    color: '#6b7280',
  },
  topButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  iconBtnDark: {
    backgroundColor: '#1e1e1e',
  },
  goalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  goalBtnDark: {
    backgroundColor: '#1e1e1e',
  },
  goalBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f766e',
  },

  /* ── Greeting ── */
  greeting: {
    fontSize: isSmallScreen ? 24 : 28,
    fontWeight: '400',
    color: '#374151',
    lineHeight: isSmallScreen ? 32 : 36,
    marginTop: -2,
    marginBottom: 0,
    paddingHorizontal: isSmallScreen ? 12 : 16,
  },
  greetingDark: {
    color: '#d1d5db',
  },
  greetingName: {
    fontWeight: '900',
    color: '#111827',
  },
  greetingNameDark: {
    color: '#fff',
  },

  /* ── Mascot Row ── */
  mascotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -20,
    marginBottom: -14,
    paddingRight: isSmallScreen ? 12 : 16,
  },
  mascotTouch: {
    alignItems: 'center',
    marginLeft: -18,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  tapHintText: {
    fontSize: 9,
    color: '#0f766e',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* ── Speech Bubble ── */
  bubble: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: isSmallScreen ? 10 : 12,
    marginLeft: -10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    position: 'relative',
  },
  bubbleDark: {
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  bubblePointer: {
    position: 'absolute',
    left: -8,
    top: 22,
    width: 0,
    height: 0,
    borderTopWidth: 7,
    borderBottomWidth: 7,
    borderRightWidth: 9,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#fff',
  },
  bubblePointerDark: {
    borderRightColor: '#1e1e1e',
  },
  bubbleName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f766e',
    marginBottom: 5,
  },
  bubbleText: {
    fontSize: isSmallScreen ? 11 : 12,
    color: '#6b7280',
    lineHeight: 18,
  },
  bubbleTextDark: {
    color: '#9ca3af',
  },
});

export default Header;
