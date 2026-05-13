import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import OwenMascot from './OwenMascot';

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
  const protein     = dailyLog?.protein || 0;
  const carbs       = dailyLog?.carbs || 0;
  const fats        = dailyLog?.fats || 0;

  const remCals     = Math.round(nutrition.tdee - cals);
  const remProtein  = Math.round((nutrition.protein || 0) - protein);
  const remCarbs    = Math.round((nutrition.carbs || 0) - carbs);
  const remFats     = Math.round((nutrition.fats || 0) - fats);

  if (cals === 0) return "Ready to start? Log your first meal and I'll track the macros! 🍎";
  
  // Priority 1: Protein (The most important for most users)
  if (remProtein > 20) {
    return `Protein check! You still need ${remProtein}g to hit your muscle-building target today. 💪`;
  }

  // Priority 2: Large calorie gap
  if (remCals > 600) {
    return `You've got ${remCals} kcal left! Maybe a balanced meal with some ${remCarbs > 30 ? 'Carbs' : 'Healthy Fats'}? 🍱`;
  }

  // Priority 3: Carbs (Energy)
  if (remCarbs > 40) {
    return `Energy levels low? You have room for ${remCarbs}g of Carbs. Perfect for a pre-workout snack! ⚡`;
  }

  // Priority 4: Fats
  if (remFats > 15) {
    return `Healthy fats needed! ${remFats}g left. Think avocado, nuts, or olive oil! 🥑`;
  }

  // Priority 5: Over limit
  if (remCals < -50) {
    return `Whoops, you're ${Math.abs(remCals)} kcal over. No sweat! Let's stay active today. 🏃‍♂️`;
  }

  // Success
  if (Math.abs(remCals) <= 100 && remProtein <= 10) {
    return "Absolute perfection! You've nailed your macro targets today. Great job! 🏆";
  }

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
          <OwenMascot size={isSmallScreen ? 180 : 200} isHappy={isHappy} darkMode={darkMode} />
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
    marginTop: -30,
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

export default memo(Header);
