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

// ─── Tier 3: Filler Word Stripper ────────────────────────────────────────────
// Removes common conversational phrases so the food name can be isolated.
const FILLER_WORDS = [
  'i ate', 'i had', 'i just had', 'i just ate', 'i consumed', 'i drank',
  'i drink', 'i eat', 'give me', 'log', 'add', 'track', 'record',
  'for breakfast', 'for lunch', 'for dinner', 'for snack', 'for brunch',
  'at breakfast', 'at lunch', 'at dinner',
  'this morning', 'this evening', 'tonight', 'just now', 'earlier',
  'some', 'a bit of', 'a piece of', 'a portion of', 'a serving of',
  'about', 'around', 'roughly', 'approximately',
  'and', 'with', 'plus',
];

const stripFillerWords = (text) => {
  let cleaned = text.toLowerCase();
  for (const phrase of FILLER_WORDS) {
    cleaned = cleaned.replace(new RegExp(`\\b${phrase}\\b`, 'gi'), '');
  }
  return cleaned.replace(/\s+/g, ' ').trim();
};

// ─── Tier 3: Portion-Size Synonym Map ────────────────────────────────────────
// Maps common English portion descriptions → approximate grams.
// Based on real-world dietary reference standards.
const PORTION_MAP = [
  { pattern: /\b(\d*\.?\d+)?\s*large\b/i,    grams: 150, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*medium\b/i,   grams: 100, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*small\b/i,    grams: 70,  default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*bowl\b/i,     grams: 250, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*big bowl\b/i, grams: 400, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*plate\b/i,    grams: 350, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*cup[s]?\b/i,  grams: 240, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*glass\b/i,    grams: 250, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*handful\b/i,  grams: 30,  default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*slice[s]?\b/i,grams: 28,  default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*piece[s]?\b/i,grams: 100, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*scoop[s]?\b/i,grams: 35,  default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*tbsp\b/i,     grams: 15,  default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*tsp\b/i,      grams: 5,   default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*oz\b/i,       grams: 28.35,default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*can\b/i,      grams: 400, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*bottle\b/i,   grams: 500, default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*egg[s]?\b/i,  grams: 60,  default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*banana[s]?\b/i,grams: 120,default: 1 },
  { pattern: /\b(\d*\.?\d+)?\s*apple[s]?\b/i,grams: 182, default: 1 },
];

// Extract portion size from Tier 3 text using synonym map
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

// ─── Tier 3: Multiplied item parser ──────────────────────────────────────────
// Handles patterns like "3 eggs", "2 bananas", "4 slices of bread"
const extractMultipliedItems = (text) => {
  const match = text.match(/(\d+)\s+([a-zA-Z\s]+)/);
  if (match) {
    const count = parseInt(match[1], 10);
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
  let foodName = text;
  let amount = 100;
  let unit = 'g';
  let confidence = 0;
  let tier = 3;

  // ── Tier 1: On-Device Regex NLP ──────────────────────────────────────────
  if (isDeviceCapable) {
    const regexPatterns = [
      /(\d+(?:\.\d+)?)\s*(g|grams|oz|ml|cups?|tbsp|tsp|pieces?|large|small)?\s+(?:of\s+)?([a-zA-Z\s]+)/i,
      /([a-zA-Z\s]+)\s+(\d+(?:\.\d+)?)\s*(g|grams|oz|ml|cups?|tbsp|tsp|pieces?|large|small)?/i,
    ];

    for (const regex of regexPatterns) {
      const match = text.match(regex);
      if (match) {
        if (isNaN(parseFloat(match[1]))) {
          foodName = match[1].trim();
          amount = parseFloat(match[2]);
          unit = match[3] ? match[3].toLowerCase() : 'g';
        } else {
          amount = parseFloat(match[1]);
          unit = match[2] ? match[2].toLowerCase() : 'g';
          foodName = match[3].trim();
        }
        processedOnDevice = true;
        confidence = 0.85;
        tier = 1;
        break;
      }
    }
  }

  // ── Tier 2: Cloud AI Fallback ─────────────────────────────────────────────
  if (!processedOnDevice || confidence < 0.7) {
    if (isOnline) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      const numMatch = text.match(/(\d+)/);
      if (numMatch) amount = parseFloat(numMatch[1]);
      foodName = text
        .replace(/i ate|i had|give me|log|add|some|a|for|breakfast|lunch|dinner|snack/gi, '')
        .replace(/[0-9]+/g, '')
        .trim();
      processedOnDevice = false;
      confidence = 0.95;
      tier = 2;
    } else {
      // ── Tier 3: Smart Keyword Engine (Budget / Fully Offline) ───────────
      // Step 1: Strip filler conversational words
      let cleaned = stripFillerWords(text);

      // Step 2: Try multiplied-item parsing ("3 eggs", "2 slices of bread")
      const multiplied = extractMultipliedItems(cleaned);
      if (multiplied) {
        foodName = multiplied.item;
        amount = multiplied.count * 100; // rough fallback
      } else {
        foodName = cleaned;
      }

      // Step 3: Extract serving size from portion synonym map
      const portion = extractPortionFromSynonyms(text);
      if (portion.matched) {
        amount = portion.grams;
      }

      // Step 4: Strip numeric leftovers from the food name
      foodName = foodName.replace(/\d+/g, '').replace(/\s+/g, ' ').trim();

      processedOnDevice = true;
      confidence = portion.matched ? 0.65 : 0.45;
      tier = 3;
    }
  }

  // ── Unit → Grams Normalization ────────────────────────────────────────────
  let servingInGrams = amount;
  if (unit.includes('oz'))   servingInGrams = amount * 28.35;
  else if (unit.includes('cup'))  servingInGrams = amount * 240;
  else if (unit.includes('tbsp')) servingInGrams = amount * 15;
  else if (unit.includes('tsp'))  servingInGrams = amount * 5;
  else if (unit.includes('piece') || unit === 'large' || unit === 'small') {
    servingInGrams = amount * 100;
  }

  // ── Database Query ────────────────────────────────────────────────────────
  let results = [];
  if (searchSQLite) {
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

  // ── Source Label ──────────────────────────────────────────────────────────
  const sourceLabel = {
    1: 'On-Device AI (Local NLP)',
    2: 'Cloud AI (Server Model)',
    3: confidence >= 0.6
      ? 'On-Device Basic (Smart Keywords)'
      : 'On-Device Basic (Keyword Fallback)',
  }[tier];

  return {
    success: combined.length > 0,
    foods: combined,
    extractedName: foodName,
    extractedServing: Math.round(servingInGrams),
    source: sourceLabel,
    confidence,
    tier,
    message: combined.length > 0
      ? `Found ${combined.length} match${combined.length > 1 ? 'es' : ''} for "${foodName}". Select one to log ${Math.round(servingInGrams)}g:`
      : `I couldn't find "${foodName}" in the database. Try a simpler description like "chicken" or "rice".`,
  };
};
