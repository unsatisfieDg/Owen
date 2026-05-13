// Enhanced nutrition calculator with accurate lb-based formulas

// Convert kg to lbs
const kgToLbs = (kg) => kg * 2.20462;

// Convert lbs to kg
const lbsToKg = (lbs) => lbs / 2.20462;

// Mifflin-St Jeor Equation for BMR calculation
export const calculateBMR = (userData) => {
  const { weight, height, age, gender } = userData;
  
  // Convert to kg and cm if needed
  const weightKg = parseFloat(weight);
  const heightCm = parseFloat(height);
  const ageYears = parseFloat(age);
  
  // Mifflin-St Jeor formula
  if (gender === 'male') {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) + 5;
  } else {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) - 161;
  }
};

// Enhanced TDEE calculation with precise activity multipliers
export const calculateTDEE = (bmr, activityLevel, goal) => {
  const activityMultipliers = {
    '1.2': 1.2,     // Sedentary
    '1.375': 1.375, // Lightly active
    '1.55': 1.55,   // Moderately active
    '1.725': 1.725, // Very active
    '1.9': 1.9      // Extremely active
  };
  
  const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));
  
  // Return base TDEE without adjustment here
  // We'll use calories per pound method instead
  return tdee;
};

// Calculate calories based on goal using kcal per lb method
export const calculateCaloriesFromWeight = (weightKg, goal) => {
  const weightLbs = kgToLbs(weightKg);
  let kcalPerLb;
  let description;
  
  switch (goal) {
    case 'muscle': // 💪 Bulking (Muscle Gain)
      kcalPerLb = 19; // 18-20 kcal/lb (using 19)
      description = 'Gain 0.5–1 lb/week';
      break;
    case 'loss': // 🔥 Cutting (Fat Loss)
      kcalPerLb = 12.5; // 12-13 kcal/lb (using 12.5)
      description = 'Lose 1–2 lb/week';
      break;
    case 'recomp': // ⚖️ Recomp (Lose Fat + Gain Muscle)
      kcalPerLb = 14.5; // 14-15 kcal/lb (using 14.5)
      description = 'Slow body recomposition';
      break;
    case 'slowloss': // 🏃 Losing Weight (Slow Fat Loss)
      kcalPerLb = 13.5; // 13-14 kcal/lb (using 13.5)
      description = 'Lose ~0.5 lb/week';
      break;
    default: // ⚙️ Maintenance
      kcalPerLb = 15.5; // 15-16 kcal/lb (using 15.5)
      description = 'Maintain current weight';
      break;
  }
  
  return {
    calories: Math.round(weightLbs * kcalPerLb),
    description
  };
};

// Enhanced macro calculation with goal-specific lb-based ratios
export const calculateMacros = (tdee, goal, userData = {}, profile = {}) => {
  const weightKg = parseFloat(userData.weight) || 70;
  const currentWeight = parseFloat(profile.currentWeight) || weightKg;
  const targetWeight = parseFloat(profile.targetWeight);
  
  // ALWAYS use current weight for calculations (not target weight)
  // Target weight is just a goal/milestone
  const referenceWeight = currentWeight > 0 ? currentWeight : weightKg;
  const weightLbs = kgToLbs(referenceWeight);
  
  // Recalculate calories using lb-based method
  const { calories, description } = calculateCaloriesFromWeight(referenceWeight, goal);
  
  let proteinGPerLb, fatGPerLb, carbsGPerLb;
  let proteinPercent, fatPercent, carbsPercent;
  let calorieAdjustment;
  
  // Goal-specific macro ratios based on exact specifications
  if (goal === 'muscle') {
    // 💪 Bulking (Muscle Gain)
    proteinGPerLb = 0.9;  // 0.8–1.0 g/lb (using 0.9)
    proteinPercent = '20–25%';
    carbsPercent = '50–60%';
    calorieAdjustment = description;
  } else if (goal === 'loss') {
    // 🔥 Cutting (Fat Loss)
    proteinGPerLb = 1.1;  // 1.0–1.2 g/lb (using 1.1)
    proteinPercent = '30–35%';
    carbsPercent = '35–45%';
    calorieAdjustment = description;
  } else if (goal === 'recomp') {
    // ⚖️ Recomp (Lose Fat + Gain Muscle)
    proteinGPerLb = 1.05; // 1.0–1.1 g/lb (using 1.05)
    proteinPercent = '30–35%';
    carbsPercent = '40–45%';
    calorieAdjustment = description;
  } else if (goal === 'slowloss') {
    // 🏃 Losing Weight (Slow Fat Loss + Muscle Gain)
    proteinGPerLb = 1.1;  // 1.0–1.2 g/lb (using 1.1)
    proteinPercent = '30–35%';
    carbsPercent = '35–45%';
    calorieAdjustment = description;
  } else {
    // ⚙️ BASELINE: Maintenance (Current Weight)
    proteinGPerLb = 0.9;  // 0.8–1.0 g/lb (using 0.9)
    proteinPercent = '25–30%';
    carbsPercent = '40–50%';
    calorieAdjustment = description;
  }
  
  // Calculate macros in grams
  const protein = Math.round(weightLbs * proteinGPerLb);
  
  // Calculate fat (default 25% of total calories)
  // Fat = 9 cal/g
  const fatCalories = calories * 0.25;
  const fats = Math.round(fatCalories / 9);
  
  // Calculate carbs to fill remaining calories after protein and fat
  // Protein = 4 cal/g, Carbs = 4 cal/g
  const proteinCalories = protein * 4;
  const remainingCalories = calories - proteinCalories - fatCalories;
  const carbs = Math.round(Math.max(0, remainingCalories) / 4);
  
  return {
    tdee: calories, // Use the lb-based calculation
    bmr: tdee, // Keep original bmr
    protein: protein,
    carbs: carbs,
    fats: fats,
    proteinGPerLb: proteinGPerLb.toFixed(1),
    carbsGPerLb: (carbs / weightLbs).toFixed(1),
    proteinPercent: proteinPercent,
    carbsPercent: carbsPercent,
    calorieAdjustment: calorieAdjustment,
    goal: goal,
    referenceWeight: Math.round(referenceWeight * 10) / 10,
    referenceWeightLbs: Math.round(weightLbs * 10) / 10,
    currentWeightUsed: true, // Always use current weight
    targetWeight: targetWeight // Include target weight for display purposes
  };
};

// Calculate remaining macros for the day
export const calculateRemainingMacros = (dailyLog, nutrition) => {
  return {
    calories: Math.max(0, nutrition.tdee - dailyLog.calories),
    protein: Math.max(0, nutrition.protein - dailyLog.protein),
    carbs: Math.max(0, nutrition.carbs - dailyLog.carbs),
    fats: Math.max(0, nutrition.fats - dailyLog.fats)
  };
};

// Calculate macro percentages
export const calculateMacroPercentages = (dailyLog) => {
  const total = dailyLog.protein + dailyLog.carbs + dailyLog.fats;
  if (total === 0) return { protein: 0, carbs: 0, fats: 0 };
  
  return {
    protein: Math.round((dailyLog.protein / total) * 100),
    carbs: Math.round((dailyLog.carbs / total) * 100),
    fats: Math.round((dailyLog.fats / total) * 100)
  };
};

// Calculate progress percentage for each macro
export const calculateProgressPercentages = (dailyLog, nutrition) => {
  return {
    calories: Math.min(100, Math.round((dailyLog.calories / nutrition.tdee) * 100)),
    protein: Math.min(100, Math.round((dailyLog.protein / nutrition.protein) * 100)),
    carbs: Math.min(100, Math.round((dailyLog.carbs / nutrition.carbs) * 100)),
    fats: Math.min(100, Math.round((dailyLog.fats / nutrition.fats) * 100))
  };
};

// Calculate BMI (Body Mass Index)
export const calculateBMI = (weight, height) => {
  const weightKg = parseFloat(weight);
  const heightM = parseFloat(height) / 100; // Convert cm to m
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
};

// Get BMI category
export const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-500', recommendation: 'Consider gaining weight' };
  if (bmi < 25) return { category: 'Normal weight', color: 'text-green-500', recommendation: 'Maintain current weight' };
  if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-500', recommendation: 'Consider losing weight' };
  return { category: 'Obese', color: 'text-red-500', recommendation: 'Consult healthcare provider' };
};

// Calculate ideal weight range
export const calculateIdealWeight = (height, gender) => {
  const heightM = parseFloat(height) / 100;
  const heightSquared = heightM * heightM;
  
  return {
    min: Math.round(18.5 * heightSquared),
    max: Math.round(24.9 * heightSquared)
  };
};

// Calculate water intake recommendation (35ml per kg + activity adjustment)
export const calculateWaterIntake = (weight, activityLevel) => {
  const baseWater = parseFloat(weight) * 35; // 35ml per kg
  const activityMultiplier = parseFloat(activityLevel) - 1;
  const additionalWater = baseWater * activityMultiplier * 0.1;
  
  return Math.round(baseWater + additionalWater);
};

// Calculate fiber recommendation (14g fiber per 1000 calories)
export const calculateFiberIntake = (calories) => {
  return Math.round((calories / 1000) * 14);
};

// Get goal-specific recommendations
export const getGoalRecommendations = (goal) => {
  const recommendations = {
    maintain: {
      title: '⚙️ Maintenance (Current Weight)',
      tips: [
        'Maintains muscle mass',
        'Supports recovery',
        'Fuels training and energy balance',
        'Monitor weight weekly',
        'Adjust if weight changes'
      ],
      protein: '0.8–1.0 g/lb',
      carbs: '1.5–2.0 g/lb',
      calories: '~15–16 kcal per lb'
    },
    muscle: {
      title: '💪 Bulking (Muscle Gain)',
      tips: [
        'Gain 0.5–1 lb/week until target weight',
        'Track progress weekly',
        'If no gain in 2 weeks, add +150–200 kcal',
        'Focus on compound exercises',
        'Ensure 7-9 hours of quality sleep'
      ],
      protein: '0.8–1.0 g/lb',
      carbs: '2.0–3.0 g/lb',
      calories: '~18–20 kcal per lb'
    },
    loss: {
      title: '🔥 Cutting (Fat Loss)',
      tips: [
        'Lose 1–2 lb/week while preserving lean muscle',
        'High protein preserves lean mass',
        'Prioritize strength training',
        'Ensure adequate sleep (7-9 hours)',
        'Track measurements, not just weight'
      ],
      protein: '1.0–1.2 g/lb',
      carbs: '1.0–1.5 g/lb',
      calories: '~12–13 kcal per lb'
    },
    recomp: {
      title: '⚖️ Recomp (Lose Fat + Gain Muscle)',
      tips: [
        'Slow body recomposition',
        'Works best for beginners or after a training break',
        'High protein is crucial',
        'Focus on progressive overload',
        'Be patient - recomp takes time'
      ],
      protein: '1.0–1.1 g/lb',
      carbs: '1.2–1.6 g/lb',
      calories: '~14–15 kcal per lb'
    },
    slowloss: {
      title: '🏃 Losing Weight (Slow Fat Loss)',
      tips: [
        'Lose ~0.5 lb/week',
        'Similar to recomp but slightly faster fat loss',
        'Preserves muscle while losing fat',
        'High protein is essential',
        'Monitor strength in gym to ensure muscle retention'
      ],
      protein: '1.0–1.2 g/lb',
      carbs: '1.0–1.5 g/lb',
      calories: '~13–14 kcal per lb'
    }
  };
  
  return recommendations[goal] || recommendations.maintain;
};

export default {
  calculateBMR,
  calculateTDEE,
  calculateMacros,
  calculateRemainingMacros,
  calculateMacroPercentages,
  calculateProgressPercentages,
  calculateBMI,
  getBMICategory,
  calculateIdealWeight,
  calculateWaterIntake,
  calculateFiberIntake,
  getGoalRecommendations,
  kgToLbs,
  lbsToKg
};
