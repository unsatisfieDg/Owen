import Constants from 'expo-constants';

// API Keys from app.json extra field
const EDAMAM_FOOD_APP_ID = Constants.expoConfig?.extra?.edamamFoodAppId;
const EDAMAM_FOOD_APP_KEY = Constants.expoConfig?.extra?.edamamFoodAppKey;

// Validate API keys are configured
if (!EDAMAM_FOOD_APP_ID || !EDAMAM_FOOD_APP_KEY) {
  console.warn('⚠️ Edamam Food API keys not configured. Food search will use local database only.');
}

export const searchFood = async (query) => {
  // If API keys are not configured, return empty array (will use local database)
  if (!EDAMAM_FOOD_APP_ID || !EDAMAM_FOOD_APP_KEY) {
    return [];
  }

  try {
    const response = await fetch(
      `https://api.edamam.com/api/food-database/v2/parser?app_id=${EDAMAM_FOOD_APP_ID}&app_key=${EDAMAM_FOOD_APP_KEY}&ingr=${encodeURIComponent(query)}`
    );
    
    // Check if response is OK before parsing
    if (!response.ok) {
      console.warn(`API returned status ${response.status}, using local database`);
      return [];
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('API returned non-JSON response, using local database');
      return [];
    }

    const data = await response.json();
    
    if (data.hints) {
      return data.hints.slice(0, 5).map(hint => ({
        name: hint.food.label,
        calories: Math.round(hint.food.nutrients.ENERC_KCAL) || 0,
        protein: Math.round(hint.food.nutrients.PROCNT) || 0,
        carbs: Math.round(hint.food.nutrients.CHOCDF) || 0,
        fats: Math.round(hint.food.nutrients.FAT) || 0
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching food data:', error);
    return [];
  }
};
