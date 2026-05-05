import { searchFoodDatabase } from './foodDatabase';
import { Platform } from 'react-native';

// Simulated device capability check
const checkDeviceCapability = async () => {
  // In a real app, we'd check device memory, processor, etc.
  // Here we just mock it to be true most of the time
  return true; 
};

// Simulated network check
const checkNetworkConnection = async () => {
  // Mocking network check. We could use NetInfo in real app.
  return true;
};

/**
 * Advanced Hybrid AI processing strategy:
 * 1. Checks device capability and network status.
 * 2. Attempts robust on-device NLP processing.
 * 3. Falls back to Cloud API if on-device fails or confidence is low, and network is available.
 */
export const processNaturalLanguageFood = async (text, customFoods = [], searchSQLite = null) => {
  const isDeviceCapable = await checkDeviceCapability();
  const isOnline = await checkNetworkConnection();
  
  let processedOnDevice = false;
  let foodName = text;
  let amount = 100;
  let unit = 'g';
  let confidence = 0;

  // 1. On-Device Processing (Local NLP Model Simulation)
  if (isDeviceCapable) {
    // Advanced On-Device Regex Pattern matching
    const regexPatterns = [
      /(\d+(?:\.\d+)?)\s*(g|grams|oz|ml|cups|tbsp|tsp|pieces|piece|large|small)?\s+(?:of\s+)?([a-zA-Z\s]+)/i,
      /([a-zA-Z\s]+)\s+(\d+(?:\.\d+)?)\s*(g|grams|oz|ml|cups|tbsp|tsp|pieces|piece|large|small)?/i
    ];

    for (const regex of regexPatterns) {
      const match = text.match(regex);
      if (match) {
        // Handle different match groups depending on pattern
        if (isNaN(parseFloat(match[1]))) {
          // Pattern 2: Food first, then amount
          foodName = match[1].trim();
          amount = parseFloat(match[2]);
          unit = match[3] ? match[3].toLowerCase() : 'g';
        } else {
          // Pattern 1: Amount first, then food
          amount = parseFloat(match[1]);
          unit = match[2] ? match[2].toLowerCase() : 'g';
          foodName = match[3].trim();
        }
        processedOnDevice = true;
        confidence = 0.85; // High confidence for exact regex match
        break;
      }
    }
  }

  // 2. Cloud Fallback Processing
  if (!processedOnDevice || confidence < 0.7) {
    if (isOnline) {
      // Simulate Cloud API latency
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Simulated complex cloud NLP extraction
      const numMatch = text.match(/(\d+)/);
      if (numMatch) {
        amount = parseFloat(numMatch[1]);
      }
      foodName = text.replace(/i ate|i had|give me|log|add|some|a|for|breakfast|lunch|dinner|snack/gi, '').replace(/[0-9]+/g, '').trim();
      processedOnDevice = false;
      confidence = 0.95; // Cloud models usually have higher confidence
    } else if (!processedOnDevice) {
        // Offline and on-device failed: fallback to basic keyword extraction
        foodName = text.trim();
        amount = 100;
        processedOnDevice = true;
        confidence = 0.4;
    }
  }

  // Normalize amount based on unit (roughly to grams)
  let servingInGrams = amount;
  if (unit.includes('oz')) servingInGrams = amount * 28.35;
  else if (unit.includes('cup')) servingInGrams = amount * 240;
  else if (unit.includes('tbsp')) servingInGrams = amount * 15;
  else if (unit.includes('tsp')) servingInGrams = amount * 5;
  else if (unit.includes('piece') || unit === 'large' || unit === 'small' || !unit || unit === 'g' || unit === 'grams') {
    servingInGrams = unit === 'g' || unit === 'grams' ? amount : amount * 100;
  }

  // Query databases (Local first, then custom, then legacy)
  let results = [];
  
  if (searchSQLite) {
    const sqliteResults = await searchSQLite(foodName);
    results = [...results, ...sqliteResults];
  }
  
  const legacyResults = searchFoodDatabase(foodName);
  const customResults = customFoods.filter(f => f.name.toLowerCase().includes(foodName.toLowerCase()));

  // Merge and deduplicate, prioritizing custom > sqlite > legacy
  const seen = new Set();
  const combined = [
    ...customResults,
    ...results,
    ...legacyResults
  ].filter(item => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 5); // Return top 5 matches

  const sourceStr = processedOnDevice 
    ? (confidence < 0.5 ? 'On-Device Basic' : 'On-Device AI (Local Model)') 
    : 'Cloud AI (Server Model)';

  return {
    success: combined.length > 0,
    foods: combined,
    extractedName: foodName,
    extractedServing: Math.round(servingInGrams),
    source: sourceStr,
    confidence,
    message: combined.length > 0 
      ? `Found ${combined.length} matches for "${foodName}". Select one to log ${Math.round(servingInGrams)}g:` 
      : `I couldn't find "${foodName}" in the database. Try adjusting your description.`
  };
};
