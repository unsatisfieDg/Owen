/**
 * Meal Planner Utility
 * Suggests meals based on remaining macros
 */

const RECIPE_DATABASE = [
  {
    name: "Grilled Chicken & Quinoa Bowl",
    calories: 450, protein: 45, carbs: 40, fats: 10,
    ingredients: ["150g Chicken Breast", "100g Cooked Quinoa", "50g Spinach", "5g Olive Oil"],
    instructions: "Grill chicken, mix with quinoa and spinach, drizzle with oil."
  },
  {
    name: "Classic Protein Oats",
    calories: 380, protein: 30, carbs: 45, fats: 8,
    ingredients: ["50g Oats", "1 scoop Whey Protein", "10g Almonds", "100ml Milk"],
    instructions: "Cook oats in milk, stir in protein powder once off heat, top with almonds."
  },
  {
    name: "Budget Tuna & Rice",
    calories: 420, protein: 35, carbs: 50, fats: 5,
    ingredients: ["1 can Tuna in Water", "150g White Rice", "Soy Sauce", "Green Onions"],
    instructions: "Mix drained tuna with hot rice and soy sauce. Cheap and high protein!"
  },
  {
    name: "Filipino Chicken Adobo",
    calories: 480, protein: 40, carbs: 30, fats: 15,
    category: "Filipino",
    ingredients: ["200g Chicken Thighs", "Soy Sauce", "Vinegar", "Garlic", "1 cup Brown Rice"],
    instructions: "Simmer chicken in soy sauce, vinegar, and garlic. Serve over rice."
  },
  {
    name: "Bistek Tagalog (Beef Steak)",
    calories: 450, protein: 45, carbs: 10, fats: 25,
    category: "Filipino",
    ingredients: ["150g Lean Beef", "Soy Sauce", "Calamansi", "Onion Rings"],
    instructions: "Marinate beef in soy and calamansi. Pan-sear and top with sautéed onion rings."
  },
  {
    name: "Ginisang Monggo (Mung Beans)",
    calories: 320, protein: 22, carbs: 45, fats: 6,
    category: "Filipino",
    ingredients: ["100g Mung Beans", "50g Spinach", "20g Tinapa (Smoked Fish)"],
    instructions: "Boil monggo until soft, sauté with garlic and tinapa, add spinach at the end."
  },
  {
    name: "Tortang Talong (Eggplant Omelette)",
    calories: 310, protein: 18, carbs: 15, fats: 20,
    category: "Filipino",
    ingredients: ["1 Large Eggplant", "2 Large Eggs", "50g Ground Lean Pork"],
    instructions: "Grill eggplant, peel, flatten, and dip in beaten eggs with meat. Pan-fry."
  },
  {
    name: "Pork Sinigang (Lean)",
    calories: 400, protein: 35, carbs: 20, fats: 18,
    category: "Filipino",
    ingredients: ["150g Lean Pork", "Tamarind Base", "Kangkong", "Radish", "Sitaw"],
    instructions: "Boil pork until tender, add tamarind and vegetables for a sour, healthy soup."
  },
  {
    name: "Chicken Tinola",
    calories: 320, protein: 38, carbs: 10, fats: 12,
    category: "Filipino",
    ingredients: ["200g Chicken", "Ginger", "Sayote", "Malunggay Leaves"],
    instructions: "Sauté ginger and chicken, add water and simmer with sayote and malunggay."
  },
  {
    name: "Ginisang Sardinas with Egg",
    calories: 280, protein: 24, carbs: 5, fats: 18,
    category: "Budget",
    ingredients: ["1 can Sardines in Tomato Sauce", "1 Large Egg", "Garlic", "Onion"],
    instructions: "Sauté garlic/onion, add sardines and stir in an egg until cooked. Very cheap protein!"
  },
  {
    name: "Corned Beef & Potato Hash",
    calories: 410, protein: 28, carbs: 35, fats: 20,
    category: "Budget",
    ingredients: ["100g Canned Corned Beef", "1 medium Potato", "Onion"],
    instructions: "Dice potato and fry until soft, add corned beef and sauté until crispy."
  },
  {
    name: "Student Soy-Egg Rice",
    calories: 350, protein: 14, carbs: 45, fats: 12,
    category: "Budget",
    ingredients: ["2 Fried Eggs", "150g White Rice", "Soy Sauce", "Sesame Oil"],
    instructions: "Place fried eggs over hot rice, add soy sauce and a drop of sesame oil."
  },
  {
    name: "Genius Ramen Upgrade",
    calories: 450, protein: 20, carbs: 60, fats: 15,
    category: "Budget",
    ingredients: ["1 pack Instant Noodles", "1 Soft Boiled Egg", "Handful of Spinach"],
    instructions: "Cook noodles with half the seasoning. Add spinach and a soft boiled egg for protein."
  },
  {
    name: "Lean Kare-Kare",
    calories: 520, protein: 42, carbs: 15, fats: 35,
    category: "Filipino",
    ingredients: ["150g Lean Beef", "Peanut Sauce", "Bok Choy", "Eggplant", "Sitaw"],
    instructions: "Boil beef until tender. Sauté with peanut sauce and vegetables. Serve with a touch of bagoong."
  },
  {
    name: "Healthy Pinakbet",
    calories: 280, protein: 20, carbs: 25, fats: 12,
    category: "Filipino",
    ingredients: ["50g Lean Pork", "Pumpkin", "Okra", "Eggplant", "Ampalaya"],
    instructions: "Sauté pork then add squash and other vegetables. Simmer in a little water and bagoong."
  },
  {
    name: "Arroz Caldo (Protein Style)",
    calories: 380, protein: 32, carbs: 40, fats: 10,
    category: "Filipino",
    ingredients: ["150g Chicken", "1/2 cup Rice", "2 Hard Boiled Eggs", "Ginger"],
    instructions: "Cook rice porridge with plenty of ginger and chicken. Top with two eggs for extra protein."
  },
  {
    name: "Fish Cardillo",
    calories: 340, protein: 30, carbs: 5, fats: 22,
    category: "Filipino",
    ingredients: ["150g White Fish", "2 Eggs", "2 Tomatoes", "Onions"],
    instructions: "Pan-fry fish. Sauté tomatoes and onions, add beaten eggs, then gently fold in the fish."
  },
  {
    name: "Budget Tuna Sandwich",
    calories: 320, protein: 26, carbs: 30, fats: 12,
    category: "Budget",
    ingredients: ["1 can Tuna", "2 slices Bread", "1 tbsp Mayo", "Onions"],
    instructions: "Mix tuna with mayo and onions. Spread on bread. Simple and effective."
  },
  {
    name: "Scrambled Mushroom & Eggs",
    calories: 290, protein: 18, carbs: 10, fats: 20,
    category: "Budget",
    ingredients: ["3 Eggs", "1 small can Mushrooms", "Garlic"],
    instructions: "Sauté mushrooms in garlic until brown. Add eggs and scramble. High volume, low cost."
  },
  {
    name: "Beans on Toast (High Fiber)",
    calories: 350, protein: 16, carbs: 55, fats: 5,
    category: "Budget",
    ingredients: ["1 can Baked Beans", "2 slices Whole Wheat Bread"],
    instructions: "Heat beans and pour over toasted bread. A complete student classic."
  },
  {
    name: "Peanut Butter Study Toast",
    calories: 280, protein: 10, carbs: 30, fats: 15,
    category: "Budget",
    ingredients: ["2 slices Whole Wheat Bread", "2 tbsp Peanut Butter", "1 small Banana"],
    instructions: "Spread peanut butter on toast and top with banana slices."
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
  const suggestions = (fittingRecipes.length > 0 ? fittingRecipes : pool)
    .sort((a, b) => {
      const aScore = Math.abs(a.protein - remProtein);
      const bScore = Math.abs(b.protein - remProtein);
      return aScore - bScore;
    });

  return suggestions[0];
};
