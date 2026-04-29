# 🏋️ MacroGenius - React Native

> Track your nutrition to achieve your health and fitness goals

**Native mobile app for iOS and Android!** 📱

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

## ✨ Features

### 📊 Nutrition Tracking
- **Smart Nutrition Calculator** - Accurate BMR, TDEE, and macro calculations using Mifflin-St Jeor equation
- **Goal-Based Planning** - Customized macros for bulking, cutting, body recomp, slow loss, or maintenance
- **Real-Time Progress** - Track calories, protein, and carbs throughout the day
- **Macro Pie Chart** - Visual representation of your daily intake

### 🍽️ Food Tracker
- **Comprehensive Food Database** - 200+ foods including international and Filipino cuisine
- **API Integration** - Search foods via Edamam Food Database API
- **Quick Add** - Add foods with custom serving sizes in grams
- **Smart Predictions** - Live search results as you type
- **Barcode Scanner** 📷 - Scan food barcodes and auto-add nutrition (calories, carbs, protein per serving)
- **SQLite Offline Database** 📂 - 9,000+ precise food items with USDA-standardized nutrition data
- **Offline On-Device AI** 🤖 - Hybrid AI Coach that runs locally on high-end devices and falls back to Cloud AI on older models

### 🎯 Goal Completion System
- **Daily Completion Tracking** - Get notified when you hit your daily macros (95%+ target)
- **Streak Tracker** - Build momentum with daily streaks 🔥
- **Progress Stats** - Weekly, monthly, and all-time completion statistics
- **Celebration Modal** - Confetti animation and motivational messages
- **Completion Badge** - Visual indicator when daily goals are achieved

### 👤 User Profile
- **Personalized Dashboard** - Custom greeting and user-specific data
- **Edit Profile** - Update weight, goals, and fitness targets on the fly
- **Auto-Recalculation** - Nutrition goals automatically update when you change your profile
- **Gender Icons** - Male (♂) and Female (♀) icons with color coding
- **Streak Display** - View your current streak and completion history

### 🎨 User Experience
- **Dark Mode** - Beautiful dark theme for comfortable nighttime tracking
- **Responsive Design** - Optimized for all screen sizes
- **Smooth Animations** - Native animations and haptic feedback
- **Keyboard Management** - Smart keyboard handling and scroll locking
- **Loading Screens** - Custom loading animation for better UX

### 🔐 Security
- **User Authentication** - Secure login and signup system
- **Encrypted Storage** - Base64 encoding for sensitive data
- **Session Management** - Auto-logout after inactivity
- **Secure Password Hashing** - Salted and hashed passwords

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+ and npm
- **Expo CLI** (optional, for easier development)
- **iOS Simulator** (macOS) or **Android Emulator**
- **Expo Go app** on your phone (easiest option)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/macrogenius.git
cd macrogenius

# Install dependencies
npm install

# Start the app
npm start
# or
npx expo start
```

### Running on Devices

#### 📱 Expo Go (Easiest Method)
1. Install Expo Go on your phone:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Run `npm start` or `npx expo start`
3. Scan the QR code with your phone camera (iOS) or Expo Go app (Android)

#### 🍎 iOS Simulator (macOS only)
```bash
npx expo start --ios
```

#### 🤖 Android Emulator
```bash
npx expo start --android
```

#### 🌐 Web Browser (for testing)
```bash
npx expo start --web
```

### Environment Variables (Optional)

For Edamam Food API integration, create a `.env` file:

```env
VITE_EDAMAM_FOOD_APP_ID=your_app_id
VITE_EDAMAM_FOOD_APP_KEY=your_app_key
```

Or add them directly to `app.json`:

```json
{
  "expo": {
    "extra": {
      "edamamFoodAppId": "YOUR_APP_ID",
      "edamamFoodAppKey": "YOUR_APP_KEY"
    }
  }
}
```

**Note:** The app works without API keys using the built-in local food database.

## 🏗️ Project Structure

```
macrogenius/
├── App.js                      # Main app with navigation & state
├── index.js                    # Entry point
├── app.json                    # Expo configuration
├── babel.config.js             # Babel configuration
├── package.json                # Dependencies
│
├── src/
│   ├── components/
│   │   ├── AuthForm.jsx        # Login/Signup form
│   │   ├── Dashboard.jsx       # Main dashboard with charts
│   │   ├── UserSetup.jsx       # Initial user setup flow
│   │   ├── UserProfile.jsx     # User profile & stats
│   │   ├── FoodTracker.jsx     # Food search & logging
│   │   ├── NutritionInfo.jsx   # Nutrition summary card
│   │   ├── NutritionCards.jsx  # Macro progress cards
│   │   ├── MacroPieChart.jsx   # Pie chart visualization
│   │   ├── CompletionModal.jsx # Celebration modal
│   │   ├── Header.jsx          # App header
│   │   ├── Footer.jsx          # App footer
│   │   └── LoadingScreen.jsx   # Custom loading screen
│   │
│   ├── hooks/
│   │   ├── useAuth.js          # Authentication logic
│   │   ├── useNutrition.js     # Nutrition calculations
│   │   ├── useLocalStorage.js  # AsyncStorage wrapper
│   │   ├── useSessionManager.js # Session timeout
│   │   └── useCompletionTracking.js # Streak & completion
│   │
│   ├── utils/
│   │   ├── nutritionCalculator.js # BMR, TDEE, macros
│   │   ├── foodDatabase.js        # Local food database
│   │   ├── api.js                 # Edamam API integration
│   │   └── secureStorage.js       # Data encryption
│   │
│   └── assets/
│       └── MacroGenie.png      # App icon/logo
│
└── node_modules/               # Dependencies

```

## 🎨 Tech Stack

### Core
- **React Native** - Native mobile development
- **Expo SDK 54** - Development platform
- **React Navigation** - Stack navigation
- **AsyncStorage** - Local data persistence

### UI & Styling
- **React Native StyleSheet** - Component styling
- **Expo Linear Gradient** - Gradient backgrounds
- **@expo/vector-icons** - Material Community Icons
- **Dimensions API** - Responsive design

### State & Logic
- **React Hooks** - useState, useEffect, useCallback
- **Custom Hooks** - Reusable logic
- **Context (implicit)** - State management via props

### Data & API
- **Edamam Food API** - Food search (optional)
- **Buffer (polyfill)** - Base64 encoding
- **expo-constants** - Environment variables

### Features
- **expo-haptics** - Haptic feedback
- **Animated API** - Native animations
- **Date handling** - ISO date strings for streaks

## 📖 Usage Guide

### 1️⃣ Sign Up / Login
- Create an account or log in with existing credentials
- Secure authentication with encrypted passwords

### 2️⃣ Complete User Setup
- Enter your personal details (name, age, gender, height, weight)
- Select your activity level
- Choose your fitness goal (maintain, bulk, cut, recomp, slow loss)
- Set target weight (if applicable)

### 3️⃣ Track Your Nutrition
- View your daily calorie and macro goals on the dashboard
- Use the Food Tracker to search and add foods manually
- **OR scan barcodes** for instant food logging! 📷
- Monitor your progress in real-time with progress bars and pie charts

#### 📷 Using the Barcode Scanner:
1. Tap the **purple barcode button** in the Food Tracker
2. Allow camera permission (first time only)
3. **Scan any food product barcode**
4. Food automatically added with serving size nutrition!
   - ✅ Calories, Protein, and Carbs per serving
   - ✅ No manual input needed
   - ✅ Works with 870,000+ products worldwide

### 4️⃣ Hit Your Goals
- When you reach 95%+ of your daily macros, you'll get a celebration modal! 🎉
- Build your streak by completing goals daily
- View your progress stats in "My Profile"

### 5️⃣ Adjust as Needed
- Tap "My Profile" to edit your weight or fitness goals
- Your nutrition goals will automatically recalculate
- Track your completion history and streaks

## 🎯 Macro Calculation Logic

MacroGenius uses **pound-based formulas** for accurate macro calculations:

### Goals Available:
1. **Maintain** - Maintain current weight
2. **Bulk** - Gain 0.5-1 lb/week
3. **Cut (Fat Loss)** - Lose 1-2 lb/week
4. **Recomp** - Lose fat + gain muscle simultaneously
5. **Slow Loss** - Lose ~0.5 lb/week while preserving muscle

### Macros Tracked:
- **Calories** - Based on TDEE (Total Daily Energy Expenditure)
- **Protein** - Customized per goal (1.0-1.2g per lb bodyweight)
- **Carbs** - Fills remaining calories after protein
- **Fats** - Not tracked (user choice)

**Note:** The app requires 95% completion of calories, protein, and carbs to mark a day as complete.

## 🍱 Food Database

The app includes **200+ foods** covering:
- Common proteins (chicken, beef, fish, eggs, etc.)
- Carbs (rice, pasta, bread, potatoes, etc.)
- Fruits & vegetables
- Dairy products
- **Filipino foods** (Bangus, Tilapia, Saba, Kamote, Pechay, etc.)
- Snacks and beverages

All foods are **searchable** and include **accurate macros per 100g**.

## 🏆 Completion System

### How It Works:
1. **Track your food** throughout the day
2. **Reach 95%+** of your calorie, protein, and carb goals
3. **Get the celebration modal** with confetti animation 🎉
4. **Build your streak** by completing consecutive days
5. **View stats** in "My Profile": weekly, monthly, and all-time completions

### Reset Behavior:
- Daily log **auto-resets** only after you complete your goals
- No midnight auto-reset
- Streaks continue if you complete goals daily

## 🎨 Dark Mode

Toggle dark mode using the moon/sun icon in the header. Dark mode is:
- Persistent across sessions
- Applied to all components
- Easy on the eyes for nighttime tracking

## 📱 Supported Platforms

- ✅ iOS (iPhone & iPad)
- ✅ Android
- ⚠️ Web (limited support, not optimized)

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Areas for Contribution:
- Additional food items to the database
- UI/UX improvements
- Bug fixes
- Performance optimizations
- Documentation updates

## 🐛 Known Issues

- Edamam API requires valid credentials (falls back to local database if missing)
- Web version has limited functionality (optimized for mobile)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mifflin-St Jeor Equation** - BMR calculation
- **Edamam Food Database API** - Food search functionality
- **Expo Team** - Amazing development platform
- **Filipino Community** - Inspiration for local food additions
- **Fitness Community** - Built with ❤️ for your health journey

## 📞 Support

For issues, questions, or feature requests:
- 🐛 [Open an issue on GitHub](https://github.com/unsatisfieDg/macrogenius/issues)
- 📧 Contact the maintainer

## 🚀 Roadmap

### ✅ Completed Features:
- [x] **Barcode scanner for food tracking** - Scan and auto-add foods!

### 🔮 Future Features Under Consideration:
- [x] Weekly/monthly analytics dashboard
- [x] Custom food creation
- [x] SQLite Offline Database (9,000+ items)
- [x] Hybrid AI Assistant (On-device + Cloud)
- [ ] Meal planning and recipes
- [ ] Export data (CSV/PDF)
- [ ] Social features (share progress)
- [ ] Water intake tracking
- [ ] Weight trend charts
- [ ] Multiple barcode scans in sequence

---

**Made with 💜 for your health and fitness journey**

⭐ **Star this repo if you find it helpful!**

📱 **Happy tracking with MacroGenius!** 🎯
