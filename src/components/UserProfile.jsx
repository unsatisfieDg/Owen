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
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useCompletionTracking } from '../hooks/useCompletionTracking';
import { exportLogsToCSV } from '../utils/exportUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;

const UserProfile = ({
  user,
  profile,
  userData,
  setUserData,
  updateProfile,
  onWeightChange,
  calculateNutrition,
  navigation,
  darkMode,
  weeklyData,
  dailyLog,
  nutrition,
}) => {
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  const GOAL_OPTIONS = [
    { label: 'Maintenance (Current Weight)', value: 'maintain' },
    { label: 'Bulking (Muscle Gain)', value: 'muscle' },
    { label: 'Cutting (Fat Loss)', value: 'loss' },
    { label: 'Recomp (Lose Fat + Gain Muscle)', value: 'recomp' },
    { label: 'Slow Fat Loss', value: 'slowloss' },
  ];
  const [currentWeight, setCurrentWeight] = useState(
    profile.currentWeight?.toString() || userData.weight
  );
  const [targetWeight, setTargetWeight] = useState(
    profile.targetWeight?.toString() || userData.targetWeight
  );
  const [selectedGoal, setSelectedGoal] = useState(userData.goal || 'maintain');
  const [isEditing, setIsEditing] = useState(false);

  // Completion tracking
  const { completionData, getCompletionStats } = useCompletionTracking(user?.id);
  const [completionStats, setCompletionStats] = useState({
    weeklyComplete: 0,
    monthlyComplete: 0,
    totalComplete: 0,
  });

  useEffect(() => {
    if (user?.id) {
      setCompletionStats(getCompletionStats());
    }
  }, [completionData, getCompletionStats, user]);

  const handleSave = () => {
    // Update all data at once
    const updatedData = { ...userData };
    
    // Update weight
    if (currentWeight && currentWeight !== userData.weight) {
      updatedData.weight = currentWeight;
      updateProfile({ currentWeight: parseFloat(currentWeight) });
    }
    
    // Update goal
    if (selectedGoal !== userData.goal) {
      updatedData.goal = selectedGoal;
    }
    
    // Update target weight based on goal
    if (selectedGoal !== 'maintain' && targetWeight) {
      updatedData.targetWeight = targetWeight;
      updateProfile({ targetWeight: parseFloat(targetWeight) });
    } else if (selectedGoal === 'maintain') {
      // Clear target weight if switching to maintenance
      updatedData.targetWeight = '';
    }
    
    // Update userData all at once - this will trigger the useEffect in App.js
    setUserData(updatedData);
    
    // Exit edit mode
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setCurrentWeight(profile.currentWeight?.toString() || userData.weight);
    setTargetWeight(profile.targetWeight?.toString() || userData.targetWeight);
    setSelectedGoal(userData.goal || 'maintain');
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={[styles.safeArea, darkMode && styles.safeAreaDark]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, darkMode && styles.containerDark]}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        <View style={[styles.card, darkMode && styles.cardDark]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#0f766e" />
            </TouchableOpacity>
            <Text style={[styles.title, darkMode && styles.titleDark]}>My Profile</Text>
            {!isEditing ? (
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
                <Icon name="pencil" size={20} color="#0f766e" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* User Info */}
          <View style={[styles.infoCard, darkMode && styles.infoCardDark]}>
            <Icon name="account-circle" size={64} color="#0f766e" />
            <Text style={styles.username}>{user.username}</Text>
            <Text style={[styles.name, darkMode && styles.nameDark]}>
              {userData.firstName} {userData.lastName}
            </Text>
            <Text style={[styles.givenName, darkMode && styles.nameDark]}>
              Called: {userData.givenName}
            </Text>
          </View>

          {/* Current Weight */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, darkMode && styles.labelDark]}>Current Weight (kg)</Text>
            <TextInput
              style={[
                styles.input, 
                darkMode && styles.inputDark,
                !isEditing && styles.inputDisabled
              ]}
              placeholder="Enter current weight"
              placeholderTextColor={darkMode ? '#6b7280' : '#9ca3af'}
              value={currentWeight}
              onChangeText={setCurrentWeight}
              keyboardType="decimal-pad"
              editable={isEditing}
            />
          </View>

          {/* Goal Selection */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, darkMode && styles.labelDark]}>Fitness Goal</Text>
            {!isEditing ? (
              // Read-only display when not editing
              <View style={[
                styles.goalDisplay,
                darkMode && styles.goalDisplayDark
              ]}>
                <Text style={[styles.goalDisplayText, darkMode && styles.goalDisplayTextDark]}>
                  {selectedGoal === 'maintain' 
                    ? 'Maintenance (Current Weight)'
                    : selectedGoal === 'muscle'
                    ? 'Bulking (Muscle Gain)'
                    : selectedGoal === 'loss'
                    ? 'Cutting (Fat Loss)'
                    : selectedGoal === 'recomp'
                    ? 'Recomp (Lose Fat + Gain Muscle)'
                    : 'Slow Fat Loss'}
                </Text>
              </View>
            ) : (
              // Editable tap-select when editing
              <TouchableOpacity 
                style={[
                  styles.pickerWrapper, 
                  darkMode && styles.pickerWrapperDark
                ]}
                onPress={() => setShowGoalModal(true)}
              >
                <Text style={[styles.pickerText, darkMode && styles.pickerTextDark]}>
                  {GOAL_OPTIONS.find(o => o.value === selectedGoal)?.label || 'Select goal...'}
                </Text>
                <Icon name="chevron-down" size={20} color={darkMode ? '#9ca3af' : '#0f766e'} />
              </TouchableOpacity>
            )}
          </View>

          {/* Target Weight */}
          {selectedGoal && selectedGoal !== 'maintain' && (
            <View style={styles.inputContainer}>
              <Text style={[styles.label, darkMode && styles.labelDark]}>Target Weight (kg)</Text>
              <TextInput
                style={[
                  styles.input, 
                  darkMode && styles.inputDark,
                  !isEditing && styles.inputDisabled
                ]}
                placeholder="Enter target weight"
                placeholderTextColor={darkMode ? '#6b7280' : '#9ca3af'}
                value={targetWeight}
                onChangeText={setTargetWeight}
                keyboardType="decimal-pad"
                editable={isEditing}
              />
              {isEditing && (
                <Text style={[styles.hint, darkMode && styles.hintDark]}>
                  💡 Your goal weight for{' '}
                  {selectedGoal === 'muscle'
                    ? 'bulking'
                    : selectedGoal === 'loss'
                    ? 'cutting'
                    : selectedGoal === 'slowloss'
                    ? 'losing weight'
                    : 'recomp'}
                </Text>
              )}
            </View>
          )}

          {/* Streak Tracker */}
          {completionData.streak > 0 && (
            <View style={[styles.streakCard, darkMode && styles.streakCardDark]}>
              <View style={styles.streakHeader}>
                <Icon name="fire" size={32} color="#f59e0b" />
                <Text style={[styles.streakTitle, darkMode && styles.streakTitleDark]}>
                  Current Streak
                </Text>
              </View>
              <Text style={[styles.streakValue, darkMode && styles.streakValueDark]}>
                {completionData.streak} {completionData.streak === 1 ? 'Day' : 'Days'}
              </Text>
              {completionData.bestStreak > completionData.streak && (
                <Text style={[styles.streakSubtext, darkMode && styles.streakSubtextDark]}>
                  Best: {completionData.bestStreak} days
                </Text>
              )}
            </View>
          )}

          {/* Progress Stats */}
          <View style={[styles.progressCard, darkMode && styles.progressCardDark]}>
            <Text style={[styles.progressTitle, darkMode && styles.progressTitleDark]}>
              📊 Progress Stats
            </Text>
            <View style={styles.progressStatsContainer}>
              <View style={styles.progressStat}>
                <Text style={[styles.progressValue, darkMode && styles.progressValueDark]}>
                  {completionStats.weeklyComplete}
                </Text>
                <Text style={[styles.progressLabel, darkMode && styles.progressLabelDark]}>
                  This Week
                </Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressStat}>
                <Text style={[styles.progressValue, darkMode && styles.progressValueDark]}>
                  {completionStats.monthlyComplete}
                </Text>
                <Text style={[styles.progressLabel, darkMode && styles.progressLabelDark]}>
                  This Month
                </Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressStat}>
                <Text style={[styles.progressValue, darkMode && styles.progressValueDark]}>
                  {completionStats.totalComplete}
                </Text>
                <Text style={[styles.progressLabel, darkMode && styles.progressLabelDark]}>
                  All Time
                </Text>
              </View>
            </View>
          </View>

          {/* Data Management */}
          <View style={[styles.progressCard, darkMode && styles.progressCardDark, { marginTop: 8 }]}>
            <Text style={[styles.progressTitle, darkMode && styles.progressTitleDark]}>
              💾 Data Management
            </Text>
            <Text style={[styles.hint, { marginBottom: 16, marginTop: -8 }]}>
              Export your nutrition history for your own records.
            </Text>
            
            <TouchableOpacity 
              style={styles.exportButton} 
              onPress={() => exportLogsToCSV(weeklyData)}
            >
              <LinearGradient
                colors={['#0f766e', '#134e4a']}
                style={styles.exportGradient}
              >
                <Icon name="file-export-outline" size={20} color="#fff" />
                <Text style={styles.exportText}>Export Daily Logs (CSV)</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>



          {/* User Stats */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, darkMode && styles.statCardDark]}>
              <Icon name="human-male-height" size={24} color="#3b82f6" />
              <Text style={[styles.statValue, darkMode && styles.statValueDark]} numberOfLines={1}>
                {userData.height} cm
              </Text>
              <Text style={[styles.statLabel, darkMode && styles.statLabelDark]}>Height</Text>
            </View>

            <View style={[styles.statCard, darkMode && styles.statCardDark]}>
              <Icon name="cake-variant" size={24} color="#10b981" />
              <Text style={[styles.statValue, darkMode && styles.statValueDark]} numberOfLines={1}>
                {userData.age}
              </Text>
              <Text style={[styles.statLabel, darkMode && styles.statLabelDark]}>Age</Text>
            </View>

            <View style={[styles.statCard, darkMode && styles.statCardDark]}>
              <Icon 
                name={userData.gender === 'male' ? 'gender-male' : 'gender-female'} 
                size={24} 
                color={userData.gender === 'male' ? '#3b82f6' : '#ec4899'} 
              />
              <Text style={[styles.statValue, darkMode && styles.statValueDark]} numberOfLines={1}>
                {userData.gender === 'male' ? 'Male' : 'Female'}
              </Text>
              <Text style={[styles.statLabel, darkMode && styles.statLabelDark]}>Gender</Text>
            </View>
          </View>

          {/* Save Button - Only show when editing */}
          {isEditing && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <LinearGradient
                colors={['#0d9488', '#134e4a']}
                style={styles.saveGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Icon name="content-save" size={20} color="#fff" />
                <Text style={styles.saveText}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Selection Modal */}
      <Modal
        visible={showGoalModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, darkMode && styles.modalContentDark]}>
            <View style={[styles.modalHeader, darkMode && styles.modalHeaderDark]}>
              <Text style={[styles.modalTitle, darkMode && styles.textDark]}>Select Fitness Goal</Text>
              <TouchableOpacity onPress={() => setShowGoalModal(false)}>
                <Icon name="close" size={24} color={darkMode ? '#fff' : '#111827'} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={GOAL_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[
                    styles.optionItem,
                    darkMode && styles.optionItemDark,
                    selectedGoal === item.value && (darkMode ? styles.optionItemActiveDark : styles.optionItemActive)
                  ]}
                  onPress={() => {
                    setSelectedGoal(item.value);
                    setShowGoalModal(false);
                  }}
                >
                  <Text style={[
                    styles.optionLabel,
                    darkMode && styles.textDark,
                    selectedGoal === item.value && styles.optionLabelActive
                  ]}>
                    {item.label}
                  </Text>
                  {selectedGoal === item.value && (
                    <Icon name="check" size={20} color="#0d9488" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  safeAreaDark: {
    backgroundColor: '#0f0f0f',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  containerDark: {
    backgroundColor: '#0f0f0f',
  },
  scrollContent: {
    flexGrow: 1,
    padding: isSmallScreen ? 16 : 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: isSmallScreen ? 16 : 20,
    padding: isSmallScreen ? 20 : 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    maxWidth: SCREEN_WIDTH - (isSmallScreen ? 32 : 48),
    alignSelf: 'center',
    width: '100%',
  },
  cardDark: {
    backgroundColor: '#1a1a1a',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  titleDark: {
    color: '#fff',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f766e',
  },
  cancelButton: {
    padding: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  infoCard: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    marginBottom: 24,
  },
  infoCardDark: {
    backgroundColor: '#262626',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f766e',
    marginTop: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  givenName: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
    fontStyle: 'italic',
  },
  nameDark: {
    color: '#9ca3af',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f766e',
    marginBottom: 8,
  },
  labelDark: {
    color: '#e5e7eb',
  },
  input: {
    height: 48,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111827',
  },
  inputDark: {
    backgroundColor: '#262626',
    borderColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    color: '#6b7280',
  },
  goalDisplay: {
    height: 48,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  goalDisplayDark: {
    backgroundColor: '#1f1f1f',
    borderColor: '#333333',
  },
  goalDisplayText: {
    fontSize: 16,
    color: '#6b7280',
  },
  goalDisplayTextDark: {
    color: '#9ca3af',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    minHeight: 100,
  },
  statCardDark: {
    backgroundColor: '#262626',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    textAlign: 'center',
  },
  statValueDark: {
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  statLabelDark: {
    color: '#9ca3af',
  },
  pickerWrapper: {
    height: 48,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  pickerWrapperDark: {
    backgroundColor: '#262626',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pickerText: {
    fontSize: 16,
    color: '#111827',
  },
  pickerTextDark: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalContentDark: {
    backgroundColor: '#1a1a1a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalHeaderDark: {
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  optionItemDark: {
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  optionItemActive: {
    backgroundColor: '#f0fdfa',
  },
  optionItemActiveDark: {
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
  },
  optionLabel: {
    fontSize: 16,
    color: '#374151',
  },
  optionLabelActive: {
    color: '#0d9488',
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
  },
  hintDark: {
    color: '#34d399',
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    gap: 8,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Streak Tracker Styles
  streakCard: {
    backgroundColor: '#fff7ed',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#fed7aa',
  },
  streakCardDark: {
    backgroundColor: '#1f1f1f',
    borderColor: '#78350f',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
  },
  streakTitleDark: {
    color: '#fbbf24',
  },
  streakValue: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#f59e0b',
    textAlign: 'center',
    marginBottom: 4,
  },
  streakValueDark: {
    color: '#fbbf24',
  },
  streakSubtext: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
  },
  streakSubtextDark: {
    color: '#fde68a',
  },
  // Progress Stats Styles
  progressCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  progressCardDark: {
    backgroundColor: '#262626',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  progressTitleDark: {
    color: '#fff',
  },
  progressStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    flex: 1,
    alignItems: 'center',
  },
  progressDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  progressValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f766e',
    marginBottom: 4,
  },
  progressValueDark: {
    color: '#5eead4',
  },
  progressLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressLabelDark: {
    color: '#9ca3af',
  },
  textDark: {
    color: '#fff',
  },
  exportButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  exportGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    gap: 8,
  },
  exportText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default UserProfile;
