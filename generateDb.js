const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
}

const dbPath = path.join(assetsDir, 'offline_foods.db');
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath); // Delete old db
}

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS foods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    serving REAL,
    calories REAL,
    protein REAL,
    carbs REAL,
    fats REAL
  );
  
  CREATE INDEX idx_foods_name ON foods(name);
`);

// High precision data (Sample size representing Option B scaling)
const preciseFoods = [
    { name: "Chicken Breast, Raw, Boneless, Skinless", category: "protein", calories: 120, protein: 22.5, carbs: 0, fats: 2.6 },
    { name: "Chicken Breast, Cooked, Roasted", category: "protein", calories: 165, protein: 31, carbs: 0, fats: 3.6 },
    { name: "Ground Beef, 80% Lean, Raw", category: "protein", calories: 254, protein: 17.2, carbs: 0, fats: 20 },
    { name: "Ground Beef, 80% Lean, Pan-broiled", category: "protein", calories: 268, protein: 24.3, carbs: 0, fats: 18.5 },
    { name: "Ground Beef, 95% Lean, Raw", category: "protein", calories: 137, protein: 21.4, carbs: 0, fats: 5 },
    { name: "Egg, Whole, Raw, Fresh", category: "protein", calories: 143, protein: 12.6, carbs: 0.7, fats: 9.5 },
    { name: "Egg, White, Raw, Fresh", category: "protein", calories: 52, protein: 10.9, carbs: 0.7, fats: 0.2 },
    { name: "Salmon, Atlantic, Raw", category: "protein", calories: 208, protein: 20.4, carbs: 0, fats: 13.4 },
    { name: "Rice, White, Long-grain, Raw", category: "carbs", calories: 365, protein: 7.1, carbs: 80, fats: 0.7 },
    { name: "Rice, White, Long-grain, Cooked", category: "carbs", calories: 130, protein: 2.7, carbs: 28, fats: 0.3 },
    { name: "Oats, Rolled, Raw", category: "carbs", calories: 379, protein: 13.2, carbs: 67.7, fats: 6.5 },
    { name: "Sweet Potato, Raw", category: "carbs", calories: 86, protein: 1.6, carbs: 20.1, fats: 0.1 },
    { name: "Sweet Potato, Baked in skin", category: "carbs", calories: 90, protein: 2, carbs: 20.7, fats: 0.2 },
    { name: "Broccoli, Raw", category: "vegetable", calories: 34, protein: 2.8, carbs: 6.6, fats: 0.4 },
    { name: "Broccoli, Boiled, Drained", category: "vegetable", calories: 35, protein: 2.4, carbs: 7.2, fats: 0.4 },
    { name: "Almonds, Raw", category: "fats", calories: 579, protein: 21.2, carbs: 21.6, fats: 49.9 },
    { name: "Avocado, Raw", category: "fats", calories: 160, protein: 2, carbs: 8.5, fats: 14.7 },
    { name: "Olive Oil, Extra Virgin", category: "fats", calories: 884, protein: 0, carbs: 0, fats: 100 },
    { name: "Bangus (Milkfish), Raw", category: "protein", calories: 148, protein: 20.5, carbs: 0, fats: 6.7 },
    { name: "Tilapia, Raw", category: "protein", calories: 96, protein: 20.1, carbs: 0, fats: 1.7 },
    { name: "Pechay, Raw", category: "vegetable", calories: 13, protein: 1.5, carbs: 2.2, fats: 0.2 },
    { name: "Kamote (Sweet Potato), Raw", category: "carbs", calories: 86, protein: 1.6, carbs: 20.1, fats: 0.1 },
    { name: "Whey Protein Isolate, Vanilla", category: "protein", calories: 110, protein: 25, carbs: 1, fats: 0.5 },
    { name: "Greek Yogurt, Plain, Nonfat", category: "protein", calories: 59, protein: 10, carbs: 3.6, fats: 0.4 },
    { name: "Peanut Butter, Smooth", category: "fats", calories: 588, protein: 25, carbs: 20, fats: 50 },
    { name: "Tuna, Canned in Water, Drained", category: "protein", calories: 116, protein: 25.5, carbs: 0, fats: 0.8 },
    { name: "Cottage Cheese, Low Fat (1%)", category: "protein", calories: 72, protein: 12.4, carbs: 2.7, fats: 1 },
    { name: "Quinoa, Cooked", category: "carbs", calories: 120, protein: 4.4, carbs: 21.3, fats: 1.9 },
    { name: "Lentils, Cooked", category: "carbs", calories: 116, protein: 9, carbs: 20.1, fats: 0.4 },
    { name: "Spinach, Raw", category: "vegetable", calories: 23, protein: 2.9, carbs: 3.6, fats: 0.4 },
    { name: "Banana, Raw", category: "carbs", calories: 89, protein: 1.1, carbs: 22.8, fats: 0.3 },
    { name: "Apple, Raw with Skin", category: "carbs", calories: 52, protein: 0.3, carbs: 13.8, fats: 0.2 },
    { name: "Milk, Whole (3.25%)", category: "fats", calories: 61, protein: 3.1, carbs: 4.8, fats: 3.2 },
    { name: "Milk, Skim", category: "protein", calories: 34, protein: 3.4, carbs: 5, fats: 0.1 },
    { name: "Beef, Steak, Sirloin, Grilled", category: "protein", calories: 244, protein: 29.1, carbs: 0, fats: 13.1 },
    { name: "Pork Chop, Boneless, Cooked", category: "protein", calories: 196, protein: 29.7, carbs: 0, fats: 7.7 },
    { name: "Tofu, Firm, Raw", category: "protein", calories: 144, protein: 15.8, carbs: 2.8, fats: 8.7 }
];

// Duplicate the array many times to simulate a massive 10,000+ item database to prove SQLite performance
const insert = db.prepare('INSERT INTO foods (id, name, category, serving, calories, protein, carbs, fats) VALUES (@id, @name, @category, @serving, @calories, @protein, @carbs, @fats)');

db.transaction(() => {
    let globalId = 1;
    // Insert precise foods
    for (const food of preciseFoods) {
        insert.run({
            id: globalId.toString(),
            name: food.name,
            category: food.category,
            serving: 100, // all standardized to 100g
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fats: food.fats
        });
        globalId++;
    }
    
    // Generate thousands of synthetic items to prove Option B scaling
    for(let i = 0; i < 9000; i++) {
        insert.run({
            id: globalId.toString(),
            name: `Generic Brand ${i} - ${preciseFoods[i % preciseFoods.length].name}`,
            category: preciseFoods[i % preciseFoods.length].category,
            serving: 100,
            calories: preciseFoods[i % preciseFoods.length].calories,
            protein: preciseFoods[i % preciseFoods.length].protein,
            carbs: preciseFoods[i % preciseFoods.length].carbs,
            fats: preciseFoods[i % preciseFoods.length].fats
        });
        globalId++;
    }
})();

console.log("Database created with " + db.prepare('SELECT COUNT(*) FROM foods').pluck().get() + " items at " + dbPath);
db.close();
