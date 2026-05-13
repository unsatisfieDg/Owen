/**
 * Meal Planner Utility
 * Suggests meals based on remaining macros
 */

const RECIPE_DATABASE = [
  {
    name: "Classic Protein Oats",
    calories: 380, protein: 30, carbs: 45, fats: 8,
    category: "Budget",
    ingredients: [
      "50g Rolled Oats (190kcal, 5g P, 34g C, 3g F)", 
      "30g Whey Protein (120kcal, 24g P, 3g C, 1g F)", 
      "10g Almonds (60kcal, 2g P, 2g C, 5g F)", 
      "100ml Non-Fat Milk (35kcal, 3g P, 5g C, 0g F)"
    ],
    instructions: "Cook oats in milk, stir in protein powder once off heat, top with almonds."
  },
  {
    name: "Filipino Chicken Adobo",
    calories: 480, protein: 40, carbs: 30, fats: 15,
    category: "Filipino",
    ingredients: [
      "200g Chicken Thigh, skinless (240kcal, 38g P, 0g C, 9g F)", 
      "150g White Rice (195kcal, 4g P, 43g C, 0g F)",
      "30ml Soy Sauce & Vinegar Mix (25kcal, 2g P, 4g C, 0g F)", 
      "5g Garlic & Olive Oil (45kcal, 0g P, 1g C, 5g F)"
    ],
    instructions: "Simmer chicken in soy sauce, vinegar, and garlic. Serve over rice."
  },
  {
    name: "Bistek Tagalog (Beef Steak)",
    calories: 450, protein: 45, carbs: 40, fats: 12,
    category: "Filipino",
    ingredients: [
      "150g Lean Beef Sirloin (270kcal, 43g P, 0g C, 9g F)", 
      "100g White Rice (130kcal, 3g P, 28g C, 0g F)",
      "20ml Soy Sauce & Calamansi (15kcal, 1g P, 3g C, 0g F)", 
      "50g Onion Rings (20kcal, 0g P, 5g C, 0g F)"
    ],
    instructions: "Marinate beef in soy and calamansi. Pan-sear and top with sautéed onion rings."
  },
  {
    name: "Budget Tuna & Rice Bowl",
    calories: 420, protein: 35, carbs: 50, fats: 5,
    category: "Budget",
    ingredients: [
      "150g Canned Tuna in Water (130kcal, 28g P, 0g C, 1g F)", 
      "150g White Rice (195kcal, 4g P, 43g C, 0g F)", 
      "15g Light Mayo (40kcal, 0g P, 2g C, 4g F)", 
      "10g Seaweed/Nori (15kcal, 1g P, 2g C, 0g F)"
    ],
    instructions: "Mix drained tuna with light mayo. Serve over hot rice and top with crushed seaweed."
  },
  {
    name: "Tortang Talong (Eggplant Omelette)",
    calories: 310, protein: 18, carbs: 15, fats: 20,
    category: "Filipino",
    ingredients: [
      "100g Large Eggplant (25kcal, 1g P, 6g C, 0g F)", 
      "100g (2 Large) Eggs (140kcal, 12g P, 1g C, 10g F)", 
      "50g Ground Lean Pork (120kcal, 10g P, 0g C, 8g F)",
      "5g Cooking Oil (45kcal, 0g P, 0g C, 5g F)"
    ],
    instructions: "Roast and peel eggplant. Flatten and dip in beaten egg with cooked ground pork. Pan-fry until golden."
  },
  {
    name: "Chicken Inasal (Bacolod Style)",
    calories: 380, protein: 42, carbs: 12, fats: 16,
    category: "Filipino",
    ingredients: [
      "200g Chicken Leg/Thigh, skin off (240kcal, 38g P, 0g C, 9g F)", 
      "10g Lemongrass & Garlic (15kcal, 0g P, 3g C, 0g F)", 
      "20ml Vinegar (5kcal, 0g P, 1g C, 0g F)", 
      "10g Annatto Oil (90kcal, 0g P, 0g C, 10g F)"
    ],
    instructions: "Marinate chicken in lemongrass and vinegar, grill while basting with annatto oil."
  },
  {
    name: "Sardine Pasta Aglio e Olio",
    calories: 430, protein: 26, carbs: 55, fats: 14,
    category: "Budget",
    ingredients: [
      "100g Spanish Sardines in Olive Oil (180kcal, 20g P, 0g C, 11g F)", 
      "75g Dry Pasta (270kcal, 9g P, 56g C, 1g F)", 
      "10g Garlic (15kcal, 1g P, 3g C, 0g F)", 
      "5g Olive Oil (45kcal, 0g P, 0g C, 5g F)"
    ],
    instructions: "Cook pasta. Sauté garlic and chili in a little sardine oil, toss with pasta and flaked sardines."
  },
  {
    name: "Ginisang Monggo (Mung Beans)",
    calories: 320, protein: 22, carbs: 45, fats: 6,
    category: "Filipino",
    ingredients: [
      "100g Dry Mung Beans (350kcal, 24g P, 63g C, 1g F) *Split 2 servings*", 
      "50g Spinach (10kcal, 1g P, 2g C, 0g F)", 
      "20g Tinapa / Smoked Fish (40kcal, 8g P, 0g C, 1g F)",
      "5g Oil (45kcal, 0g P, 0g C, 5g F)"
    ],
    instructions: "Boil monggo until soft, sauté with garlic and tinapa, add spinach at the end."
  },
  {
    name: "Pork Sinigang (Lean Cut)",
    calories: 390, protein: 35, carbs: 20, fats: 15,
    category: "Filipino",
    ingredients: [
      "150g Lean Pork Tenderloin (210kcal, 32g P, 0g C, 9g F)", 
      "50g Kangkong / Water Spinach (10kcal, 1g P, 2g C, 0g F)",
      "100g Radish & Eggplant (25kcal, 1g P, 5g C, 0g F)",
      "80g White Rice (105kcal, 2g P, 23g C, 0g F)"
    ],
    instructions: "Boil pork until tender, add tamarind broth and vegetables. Serve with rice."
  },
  {
    name: "Tofu Sisig (Vegetarian)",
    calories: 340, protein: 24, carbs: 25, fats: 16,
    category: "Filipino",
    ingredients: [
      "200g Firm Tofu (180kcal, 20g P, 4g C, 10g F)", 
      "15g Light Mayo (40kcal, 0g P, 2g C, 4g F)", 
      "20g Onions & Chili (10kcal, 0g P, 2g C, 0g F)",
      "80g White Rice (105kcal, 2g P, 23g C, 0g F)"
    ],
    instructions: "Air-fry or bake diced tofu. Mix with light mayo, onions, calamansi, and chili. Serve over rice."
  },
  {
    name: "Beef & Broccoli Stir Fry",
    calories: 410, protein: 38, carbs: 35, fats: 14,
    category: "High Protein",
    ingredients: [
      "150g Lean Beef Strips (250kcal, 35g P, 0g C, 10g F)", 
      "150g Broccoli Florets (50kcal, 4g P, 10g C, 0g F)", 
      "100g White Rice (130kcal, 3g P, 28g C, 0g F)", 
      "15ml Oyster Sauce (15kcal, 0g P, 4g C, 0g F)"
    ],
    instructions: "Stir fry beef until brown. Add broccoli and oyster sauce with a splash of water, cover to steam."
  },
  {
    name: "Egg & Tomato Rice Bowl",
    calories: 360, protein: 16, carbs: 48, fats: 12,
    category: "Budget",
    ingredients: [
      "100g (2 Large) Eggs (140kcal, 12g P, 1g C, 10g F)", 
      "150g Tomatoes (25kcal, 1g P, 6g C, 0g F)", 
      "150g White Rice (195kcal, 4g P, 43g C, 0g F)", 
      "5g Cooking Oil (45kcal, 0g P, 0g C, 5g F)"
    ],
    instructions: "Scramble eggs and set aside. Sauté tomatoes until soft, mix eggs back in. Serve over hot rice."
  }
];

/**
 * Suggests a meal based on target macros vs current consumed
 * @param {Object} nutrition - Target macros
 * @param {Object} dailyLog - Consumed macros
 * @param {string} keyword - Optional filter (e.g. 'Filipino', 'Budget')
 * @returns {Object} A suggested recipe
 */
export const suggestMeal = (nutrition, dailyLog, keyword = '') => {
  const remCals = nutrition.tdee - (dailyLog?.calories || 0);
  const remProtein = (nutrition.protein || 0) - (dailyLog?.protein || 0);

  let pool = RECIPE_DATABASE;

  // Filter by keyword if provided
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    const themedPool = RECIPE_DATABASE.filter(r => 
      r.name.toLowerCase().includes(lowerKeyword) || 
      (r.category && r.category.toLowerCase().includes(lowerKeyword))
    );
    if (themedPool.length > 0) pool = themedPool;
  }

  // Filter recipes that fit roughly into remaining calories
  const fittingRecipes = pool.filter(r => {
    if (remCals < 200) return r.calories <= 250;
    return r.calories <= remCals + 100; 
  });

  // Sort by how well they fill the protein gap
  const sorted = (fittingRecipes.length > 0 ? fittingRecipes : pool)
    .sort((a, b) => {
      const aScore = Math.abs(a.protein - remProtein);
      const bScore = Math.abs(b.protein - remProtein);
      return aScore - bScore;
    });

  // Pick randomly from the top 3 best fits to ensure variety
  const topN = sorted.slice(0, 3);
  return topN[Math.floor(Math.random() * topN.length)];
};
