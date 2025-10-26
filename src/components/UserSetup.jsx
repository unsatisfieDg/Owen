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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;

const UserSetup = ({ userData, setUserData, onComplete, navigation }) => {
  const [isValid, setIsValid] = useState(false);

  const validateForm = () => {
    const basicValid =
      userData.name && userData.age && userData.height && userData.weight &&
      userData.gender && userData.activityLevel && userData.goal;

    const needsTargetWeight = userData.goal !== 'maintain' && userData.goal !== '';
    const targetWeightValid = needsTargetWeight ? (userData.targetWeight && userData.targetWeight.trim() !== '') : true;

    const valid = basicValid && targetWeightValid;
    setIsValid(valid);
  };

  useEffect(() => {
    validateForm();
  }, [userData]);

  const handleInputChange = (field, value) => {
    setUserData({ ...userData, [field]: value });
  };

  const handleComplete = () => {
    if (isValid) {
      onComplete();
      // Navigation will happen automatically via App.js
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Icon name="account-settings" size={48} color="#6366f1" />
            </View>
            <Text style={styles.title}>Let's Get Started</Text>
            <Text style={styles.subtitle}>
              Tell us about yourself to calculate your perfect nutrition plan
            </Text>
          </View>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#9ca3af"
              value={userData.name || ''}
              onChangeText={(value) => handleInputChange('name', value)}
            />
            {userData.name ? (
              <Icon name="check-circle" size={20} color="#10b981" style={styles.checkIcon} />
            ) : null}
          </View>

          {/* Age and Gender Row */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor="#9ca3af"
                value={userData.age || ''}
                onChangeText={(value) => handleInputChange('age', value)}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={userData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Select..." value="" color="#9ca3af" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                </Picker>
              </View>
            </View>
          </View>

          {/* Height and Weight Row */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="Height"
                placeholderTextColor="#9ca3af"
                value={userData.height || ''}
                onChangeText={(value) => handleInputChange('height', value)}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Weight"
                placeholderTextColor="#9ca3af"
                value={userData.weight || ''}
                onChangeText={(value) => handleInputChange('weight', value)}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Activity Level */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Activity Level</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={userData.activityLevel}
                onValueChange={(value) => handleInputChange('activityLevel', value)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Select activity level" value="" color="#9ca3af" />
                <Picker.Item label="Sedentary (little/no exercise)" value="1.2" />
                <Picker.Item label="Light (1-3 days/week)" value="1.375" />
                <Picker.Item label="Moderate (3-5 days/week)" value="1.55" />
                <Picker.Item label="Active (6-7 days/week)" value="1.725" />
                <Picker.Item label="Very Active (athlete)" value="1.9" />
              </Picker>
            </View>
          </View>

          {/* Goal */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Goal</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={userData.goal}
                onValueChange={(value) => handleInputChange('goal', value)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Select your goal" value="" color="#9ca3af" />
                <Picker.Item label="Maintenance (Current Weight)" value="maintain" />
                <Picker.Item label="Bulking (Muscle Gain)" value="muscle" />
                <Picker.Item label="Cutting (Fat Loss)" value="loss" />
                <Picker.Item label="Recomp (Lose Fat + Gain Muscle)" value="recomp" />
                <Picker.Item label="Slow Fat Loss" value="slowloss" />
              </Picker>
            </View>
          </View>

          {/* Target Weight (conditional) */}
          {userData.goal && userData.goal !== 'maintain' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Target Weight (kg) 🎯</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter target weight"
                placeholderTextColor="#9ca3af"
                value={userData.targetWeight || ''}
                onChangeText={(value) => handleInputChange('targetWeight', value)}
                keyboardType="decimal-pad"
              />
              <Text style={styles.hint}>
                💡 This is your goal weight for{' '}
                {userData.goal === 'muscle'
                  ? 'bulking'
                  : userData.goal === 'loss'
                  ? 'cutting'
                  : userData.goal === 'slowloss'
                  ? 'losing weight'
                  : 'recomp'}
              </Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, !isValid && styles.submitButtonDisabled]}
            onPress={handleComplete}
            disabled={!isValid}
          >
            <LinearGradient
              colors={isValid ? ['#6366f1', '#a855f7'] : ['#9ca3af', '#9ca3af']}
              style={styles.submitGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.submitText}>Calculate My Goals</Text>
              <Icon name="arrow-right" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: isSmallScreen ? 16 : 24,
    paddingTop: isSmallScreen ? 12 : 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: isSmallScreen ? 16 : 20,
    padding: isSmallScreen ? 20 : 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    maxWidth: SCREEN_WIDTH - (isSmallScreen ? 32 : 48),
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  checkIcon: {
    position: 'absolute',
    right: 12,
    top: 42,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  pickerWrapper: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 48,
    color: '#111827',
  },
  pickerItem: {
    fontSize: 16,
    height: 48,
    color: '#111827',
  },
  hint: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    gap: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserSetup;
