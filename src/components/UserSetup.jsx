import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import FloatingMascot from './FloatingMascot';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;

const STEPS = [
  { key: 'identity', title: 'Who are you?', subtitle: 'Tell us a bit about yourself' },
  { key: 'body',     title: 'Your body stats', subtitle: "We'll use these to calculate your needs" },
  { key: 'goals',   title: 'Your goals',  subtitle: 'What are you working towards?' },
];

const UserSetup = ({ userData, setUserData, onComplete, navigation }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState(userData || {
    name: '', age: '', height: '', weight: '', gender: '',
    activityLevel: '', goal: '', targetWeight: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStepValid = () => {
    if (step === 0) return formData.name && formData.age && formData.gender;
    if (step === 1) return formData.height && formData.weight && formData.activityLevel;
    if (step === 2) {
      const basicGoalSet = !!formData.goal;
      const needsTarget = formData.goal !== 'maintain' && formData.goal !== '';
      return basicGoalSet && (needsTarget ? !!formData.targetWeight : true);
    }
    return false;
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setUserData(formData);
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const valid = isStepValid();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <LinearGradient
        colors={['#0d9488', '#0f766e', '#134e4a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top: mascot + progress */}
          <View style={styles.topSection}>
            <FloatingMascot size={90} />
            <Text style={styles.appName}>MacroGenius</Text>

            {/* Step Progress */}
            <View style={styles.progressRow}>
              {STEPS.map((s, i) => (
                <View key={s.key} style={styles.progressItem}>
                  <View style={[
                    styles.stepDot,
                    i < step  && styles.stepDotDone,
                    i === step && styles.stepDotActive,
                  ]}>
                    {i < step ? (
                      <Icon name="check" size={12} color="#fff" />
                    ) : (
                      <Text style={[styles.stepDotText, i === step && styles.stepDotTextActive]}>
                        {i + 1}
                      </Text>
                    )}
                  </View>
                  {i < STEPS.length - 1 && (
                    <View style={[styles.stepLine, i < step && styles.stepLineDone]} />
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{STEPS[step].title}</Text>
            <Text style={styles.cardSubtitle}>{STEPS[step].subtitle}</Text>

            {/* ─── Step 0: Identity ─── */}
            {step === 0 && (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>Full Name</Text>
                  <View style={styles.inputRow}>
                    <Icon name="account" size={18} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your name"
                      placeholderTextColor="#9ca3af"
                      value={formData.name || ''}
                      onChangeText={(v) => handleInputChange('name', v)}
                    />
                    {formData.name ? (
                      <Icon name="check-circle" size={18} color="#10b981" />
                    ) : null}
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.field, styles.half]}>
                    <Text style={styles.label}>Age</Text>
                    <View style={styles.inputRow}>
                      <Icon name="cake-variant" size={18} color="#9ca3af" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Age"
                        placeholderTextColor="#9ca3af"
                        value={formData.age || ''}
                        onChangeText={(v) => handleInputChange('age', v)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={[styles.field, styles.half]}>
                    <Text style={styles.label}>Gender</Text>
                    <View style={styles.pickerWrapper}>
                      <Picker
                        mode="dialog"
                        selectedValue={formData.gender}
                        onValueChange={(v) => handleInputChange('gender', v)}
                        style={styles.picker}
                      >
                        <Picker.Item label="Select..." value="" color="#9ca3af" />
                        <Picker.Item label="Male" value="male" />
                        <Picker.Item label="Female" value="female" />
                      </Picker>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* ─── Step 1: Body Stats ─── */}
            {step === 1 && (
              <>
                <View style={styles.row}>
                  <View style={[styles.field, styles.half]}>
                    <Text style={styles.label}>Height (cm)</Text>
                    <View style={styles.inputRow}>
                      <Icon name="human-male-height" size={18} color="#9ca3af" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="cm"
                        placeholderTextColor="#9ca3af"
                        value={formData.height || ''}
                        onChangeText={(v) => handleInputChange('height', v)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={[styles.field, styles.half]}>
                    <Text style={styles.label}>Weight (kg)</Text>
                    <View style={styles.inputRow}>
                      <Icon name="scale-bathroom" size={18} color="#9ca3af" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="kg"
                        placeholderTextColor="#9ca3af"
                        value={formData.weight || ''}
                        onChangeText={(v) => handleInputChange('weight', v)}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Activity Level</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      mode="dialog"
                      selectedValue={formData.activityLevel}
                      onValueChange={(v) => handleInputChange('activityLevel', v)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select activity level..." value="" color="#9ca3af" />
                      <Picker.Item label="Sedentary (little/no exercise)" value="1.2" />
                      <Picker.Item label="Light (1–3 days/week)" value="1.375" />
                      <Picker.Item label="Moderate (3–5 days/week)" value="1.55" />
                      <Picker.Item label="Active (6–7 days/week)" value="1.725" />
                      <Picker.Item label="Very Active (athlete)" value="1.9" />
                    </Picker>
                  </View>
                </View>
              </>
            )}

            {/* ─── Step 2: Goals ─── */}
            {step === 2 && (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>Fitness Goal</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      mode="dialog"
                      selectedValue={formData.goal}
                      onValueChange={(v) => handleInputChange('goal', v)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select your goal..." value="" color="#9ca3af" />
                      <Picker.Item label="Maintenance (Current Weight)" value="maintain" />
                      <Picker.Item label="Bulking (Muscle Gain)" value="muscle" />
                      <Picker.Item label="Cutting (Fat Loss)" value="loss" />
                      <Picker.Item label="Recomp (Lose Fat + Gain Muscle)" value="recomp" />
                      <Picker.Item label="Slow Fat Loss" value="slowloss" />
                    </Picker>
                  </View>
                </View>

                {formData.goal && formData.goal !== 'maintain' && (
                  <View style={styles.field}>
                    <Text style={styles.label}>Target Weight (kg) 🎯</Text>
                    <View style={styles.inputRow}>
                      <Icon name="bullseye-arrow" size={18} color="#9ca3af" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Target weight"
                        placeholderTextColor="#9ca3af"
                        value={formData.targetWeight || ''}
                        onChangeText={(v) => handleInputChange('targetWeight', v)}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <Text style={styles.hint}>
                      Your goal weight for {
                        formData.goal === 'muscle' ? 'bulking' :
                        formData.goal === 'loss' ? 'cutting' :
                        formData.goal === 'slowloss' ? 'slow fat loss' : 'recomp'
                      }
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* Nav Buttons */}
            <View style={styles.navRow}>
              {step > 0 ? (
                <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                  <Icon name="arrow-left" size={20} color="#0f766e" />
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
              ) : <View style={styles.backBtnPlaceholder} />}

              <TouchableOpacity
                style={[styles.nextBtn, !valid && styles.nextBtnDisabled]}
                onPress={handleNext}
                disabled={!valid}
              >
                <LinearGradient
                  colors={valid ? ['#0d9488', '#134e4a'] : ['#d1d5db', '#d1d5db']}
                  style={styles.nextGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.nextBtnText}>
                    {step === STEPS.length - 1 ? 'Calculate My Goals' : 'Continue'}
                  </Text>
                  <Icon name={step === STEPS.length - 1 ? 'rocket-launch' : 'arrow-right'} size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f766e',
  },
  background: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
  },
  kav: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: isSmallScreen ? 16 : 20,
    paddingBottom: 32,
  },
  topSection: {
    alignItems: 'center',
    paddingTop: isSmallScreen ? 12 : 24,
    paddingBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    marginTop: -4,
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  stepDotActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  stepDotDone: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  stepDotText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
  },
  stepDotTextActive: {
    color: '#0f766e',
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  stepLineDone: {
    backgroundColor: '#10b981',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: isSmallScreen ? 20 : 28,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  cardTitle: {
    fontSize: isSmallScreen ? 22 : 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 24,
  },
  field: {
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f766e',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    height: 50,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    height: '100%',
  },
  pickerWrapper: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  picker: {
    height: 50,
    color: '#111827',
  },
  hint: {
    fontSize: 11,
    color: '#0d9488',
    marginTop: 4,
    fontWeight: '500',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  backBtnPlaceholder: {
    width: 70,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f766e',
  },
  nextBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  nextBtnDisabled: {
    opacity: 0.55,
  },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    gap: 8,
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default UserSetup;
