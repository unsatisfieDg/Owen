import { searchFoodDatabase } from './foodDatabase';
import { Platform } from 'react-native';

// ─── Device Capability Check ─────────────────────────────────────────────────
// In production, replace with a real check using device memory/CPU APIs.
const checkDeviceCapability = async () => {
  return true;
};

// ─── Network Check ───────────────────────────────────────────────────────────
// In production, replace with NetInfo from @react-native-community/netinfo.
const checkNetworkConnection = async () => {
  return true;
};

// ─── Natural Language Pre-Processing ─────────────────────────────────────────

const FILLER_WORDS = [
  'i ate', 'i had', 'i just had', 'i just ate', 'i consumed', 'i drank',
  'i drink', 'i eat', 'give me', 'log', 'add', 'track', 'record', 'please',
  'for breakfast', 'for lunch', 'for dinner', 'for snack', 'for brunch',
  'at breakfast', 'at lunch', 'at dinner',
  'this morning', 'this evening', 'tonight', 'just now', 'earlier',
  'some', 'a bit of', 'a piece of', 'a portion of', 'a serving of',
  'about', 'around', 'roughly', 'approximately',
  'and', 'with', 'plus', 'of', 'the',
  'can i get', 'i want', 'add some', 'let me log', 'had a', 'had an', 'ate a', 'ate an', 'ate some', 'just'
];

const WORD_TO_NUM = {
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12, 'dozen': 12,
  'half': 0.5, 'quarter': 0.25, 'a': 1, 'an': 1, 'couple': 2, 'few': 3
};

const cleanInput = (text) => {
  let cleaned = text.toLowerCase();
  
  // 1. Remove filler phrases
  for (const phrase of FILLER_WORDS) {
    cleaned = cleaned.replace(new RegExp(`\\b${phrase}\\b`, 'gi'), '');
  }
  
  // 2. Convert text numbers to digits ("one" -> 1, "half" -> 0.5)
  for (const [word, num] of Object.entries(WORD_TO_NUM)) {
    cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, 'gi'), num);
  }
  
  // 3. Convert fractions to decimals ("1/2" -> "0.5")
  cleaned = cleaned.replace(/(\d+)\/(\d+)/g, (match, n, d) => parseFloat(n) / parseFloat(d));
  
  return cleaned.replace(/\s+/g, ' ').trim();
};

// ─── Portion-Size Synonym Map ────────────────────────────────────────────────
const PORTION_MAP = [
  { pattern: /\b(\d*\.?\d+)?\s*small\s+egg[s]?\b/i,  grams: 45,  default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*medium\s+egg[s]?\b/i, grams: 50,  default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*large\s+egg[s]?\b/i,  grams: 60,  default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*egg[s]?\b/i,          grams: 60,  default: 1 },

  { pattern: /\b(\d*\.?\d+)?\s*small\s+banana[s]?\b/i,  grams: 100, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*medium\s+banana[s]?\b/i, grams: 118, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*large\s+banana[s]?\b/i,  grams: 136, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*banana[s]?\b/i,          grams: 118, default: 1 },

  { pattern: /\b(\d*\.?\d+)?\s*small\s+apple[s]?\b/i,  grams: 150, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*medium\s+apple[s]?\b/i, grams: 182, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*large\s+apple[s]?\b/i,  grams: 220, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*apple[s]?\b/i,          grams: 182, default: 1 },

  { pattern: /\b(\d*\.?\d+)?\s*small\s+orange[s]?\b/i, grams: 100, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*medium\s+orange[s]?\b/i, grams: 130, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*large\s+orange[s]?\b/i, grams: 160, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*orange[s]?\b/i,          grams: 130, default: 1 },

  { pattern: /\b(\d*\.?\d+)?\s*small\s+potato(?:es)?\b/i, grams: 170, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*medium\s+potato(?:es)?\b/i, grams: 213, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*large\s+potato(?:es)?\b/i, grams: 369, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*potato(?:es)?\b/i,          grams: 213, default: 1 },

  { pattern: /\b(\d*\.?\d+)?\s*small\s+carrot[s]?\b/i, grams: 50, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*medium\s+carrot[s]?\b/i, grams: 61, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*large\s+carrot[s]?\b/i,  grams: 72, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*carrot[s]?\b/i,          grams: 61, default: 1 },

  { pattern: /\b(\d*\.?\d+)?\s*burger[s]?\b/i, grams: 200, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*sandwich(?:es)?\b/i, grams: 250, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*slice(?:s)?\s+(?:of\s+)?pizza\b/i, grams: 107, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*slice(?:s)?\s+(?:of\s+)?bread\b/i, grams: 30, default: 1 },
  
  { pattern: /\b(\d*\.?\d+)?\s*strawberry(?:ies)?\b/i, grams: 12, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*grape(?:s)?\b/i, grams: 5, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*blueberry(?:ies)?\b/i, grams: 2, default: 1 },
  
  { pattern: /\b(\d*\.?\d+)?\s*cookie(?:s)?\b/i, grams: 15, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*cracker(?:s)?\b/i, grams: 3, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*muffin(?:s)?\b/i, grams: 110, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*can(?:s)?\s+(?:of\s+)?soda\b/i, grams: 355, default: 1 },

  // Generic modifiers
  { pattern: /\b(\d*\.?\d+)?\s*large\b/i,    grams: 150, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*medium\b/i,   grams: 100, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*small\b/i,    grams: 70,  default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*big bowl[s]?\b/i, grams: 400, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*bowl[s]?\b/i, grams: 250, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*plate[s]?\b/i, grams: 350, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*cup[s]?\b/i,  grams: 240, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*glass(?:es)?\b/i, grams: 250, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*handful[s]?\b/i, grams: 30,  default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*slice[s]?\b/i, grams: 28,  default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*piece[s]?\b/i, grams: 100, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*scoop[s]?\b/i, grams: 35,  default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*tbsp\b/i,     grams: 15,  default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*tsp\b/i,      grams: 5,   default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*oz\b/i,       grams: 28.35,default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*can[s]?\b/i,  grams: 400, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*bottle[s]?\b/i, grams: 500, default: 1 },
];

const extractPortionFromSynonyms = (text) => {
  for (const entry of PORTION_MAP) {
    const match = text.match(entry.pattern);
    if (match) {
      const qty = match[1] ? parseFloat(match[1]) : entry.default;
      return { grams: Math.round(qty * entry.grams), matched: true };
    }
  }
  return { grams: 100, matched: false };
};

const extractMultipliedItems = (text) => {
  const match = text.match(/(\d+(?:\.\d+)?)\s+([a-zA-Z\s]+)/);
  if (match) {
    const count = parseFloat(match[1]);
    const item = match[2].trim();
    return { count, item };
  }
  return null;
};

/**
 * Advanced Hybrid AI Processing — 3-Tier Strategy:
 *
 * Tier 1 — On-Device NLP (Regex)     → Fast, offline, high-end devices
 * Tier 2 — Cloud AI (API Simulation)  → Confident, online, any device
 * Tier 3 — Smart Keyword Engine       → Always works, fully offline, budget devices
 */
export const processNaturalLanguageFood = async (text, customFoods = [], searchSQLite = null) => {
  const isDeviceCapable = await checkDeviceCapability();
  const isOnline = await checkNetworkConnection();

  let processedOnDevice = false;
  
  // Clean the input to standardise numbers and remove fillers early
  let cleanedText = cleanInput(text);
  
  let foodName = cleanedText;
  let amount = 100;
  let unit = 'g';
  let confidence = 0;
  let tier = 3;

  // ── Tier 1: On-Device Regex NLP ──────────────────────────────────────────
  if (isDeviceCapable) {
    const regexPatterns = [
      // Pattern 1: Amount Unit Food (e.g., "1.5 cups rice", "100 g chicken", "2 eggs")
      // Now handles unitless counts better by making the unit group optional but requiring a boundary.
      /^(\d+(?:\.\d+)?)\s*(g|grams|oz|lbs|pounds|ml|liters|l|cups?|tbsp|tsp|pieces?|slices?|large|small|medium|bowl|glass)?\s*(.+)$/i,
      // Pattern 2: Food Amount Unit (e.g., "rice 1.5 cups", "chicken 100g")
      /^(.+)\s+(\d+(?:\.\d+)?)\s*(g|grams|oz|lbs|pounds|ml|liters|l|cups?|tbsp|tsp|pieces?|slices?|large|small|medium|bowl|glass)?$/i,
    ];

    for (const regex of regexPatterns) {
      const match = cleanedText.match(regex);
      if (match) {
        if (!isNaN(parseFloat(match[1]))) {
          // Matched Pattern 1
          amount = parseFloat(match[1]);
          unit = match[2] ? match[2].toLowerCase() : '';
          foodName = match[3].trim();
        } else {
          // Matched Pattern 2
          foodName = match[1].trim();
          amount = parseFloat(match[2]);
          unit = match[3] ? match[3].toLowerCase() : '';
        }
        processedOnDevice = true;
        confidence = 0.90; // Boosted confidence due to pre-cleaning
        tier = 1;
        break;
      }
    }
  }

  // ── Tier 2: Cloud AI Fallback ─────────────────────────────────────────────
  // We only hit Cloud fallback if regex failed completely or confidence is low, and we're online.
  if (!processedOnDevice || confidence < 0.7) {
    if (isOnline) {
      // Simulate network delay for cloud AI processing
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const numMatch = cleanedText.match(/(\d+(?:\.\d+)?)/);
      if (numMatch) amount = parseFloat(numMatch[1]);
      
      foodName = cleanedText.replace(/[0-9.]+/g, '').trim();
      
      // If we're in Tier 2, we still want to check for portions if unit was defaulted
      const portionCheck = extractPortionFromSynonyms(cleanedText);
      if (portionCheck.matched) {
        unit = ''; // Mark as portion-based to trigger the portion logic later
      }

      processedOnDevice = false;
      confidence = 0.95;
      tier = 2;
    } else {
      // ── Tier 3: Smart Keyword Engine (Budget / Fully Offline) ───────────
      
      // Try multiplied-item parsing ("3 eggs", "0.5 bananas")
      const multiplied = extractMultipliedItems(cleanedText);
      if (multiplied) {
        foodName = multiplied.item;
        amount = multiplied.count * 100; // rough fallback to 100g base
      }

      // Extract serving size from portion synonym map
      const portion = extractPortionFromSynonyms(cleanedText);
      if (portion.matched) {
        amount = portion.grams;
      }

      // Strip numeric leftovers from the food name
      foodName = foodName.replace(/\d+(?:\.\d+)?/g, '').replace(/\s+/g, ' ').trim();

      processedOnDevice = true;
      confidence = portion.matched ? 0.75 : 0.50;
      tier = 3;
    }
  }

  // ── Unit → Grams Normalization ────────────────────────────────────────────
  let servingInGrams = amount;
  if (unit === 'g' || unit === 'grams' || unit === 'ml') {
    servingInGrams = amount;
  } else if (unit === 'lbs' || unit === 'pounds') {
    servingInGrams = amount * 453.592;
  } else if (unit === 'l' || unit === 'liters') {
    servingInGrams = amount * 1000;
  } else if (unit.includes('oz')) {
    servingInGrams = amount * 28.35;
  } else if (unit.includes('cup')) {
    servingInGrams = amount * 240;
  } else if (unit.includes('tbsp')) {
    servingInGrams = amount * 15;
  } else if (unit.includes('tsp')) {
    servingInGrams = amount * 5;
  } else {
    // For unitless counts (like "2 eggs") or discrete units (like "1 slice")
    const portion = extractPortionFromSynonyms(cleanedText);
    if (portion.matched) {
      servingInGrams = portion.grams;
    } else {
      // Generic fallbacks if PORTION_MAP doesn't catch it
      if (unit.includes('piece') || unit.includes('slice') || unit === 'large' || unit === 'small' || unit === 'medium' || unit === '') {
        servingInGrams = amount * 100;
      } else if (unit.includes('bowl') || unit.includes('glass')) {
        servingInGrams = amount * 250;
      }
    }
  }

  // ── Database Query ────────────────────────────────────────────────────────
  let results = [];
  if (searchSQLite && foodName.length >= 2) {
    const sqliteResults = await searchSQLite(foodName);
    results = [...results, ...sqliteResults];
  }

  const legacyResults = searchFoodDatabase(foodName);
  const customResults = customFoods.filter(f =>
    f.name.toLowerCase().includes(foodName.toLowerCase())
  );

  const seen = new Set();
  const combined = [
    ...customResults,
    ...results,
    ...legacyResults,
  ].filter(item => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 5);

  return {
    success: combined.length > 0,
    foods: combined,
    extractedName: foodName,
    extractedServing: Math.round(servingInGrams),
    confidence,
    tier,
    message: combined.length > 0
      ? `Found ${combined.length} match${combined.length > 1 ? 'es' : ''} for "${foodName}". Select one to log ${Math.round(servingInGrams)}g:`
      : `I couldn't find "${foodName}" in the database. Try a simpler description like "chicken" or "rice".`,
  };
};
