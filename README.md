# MacroGenius - React Native

Track your nutrition to achieve your health and fitness goals. This is a native mobile app built for both iOS and Android.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

## Features

### Nutrition Tracking
- **Nutrition Calculator** - Calculates BMR, TDEE, and macros using the Mifflin-St Jeor equation.
- **Goal-Based Planning** - Supports different goals like bulking, cutting, maintenance, or body recomposition.
- **Progress Monitoring** - Track daily calorie, protein, and carb intake.
- **Visual Breakdown** - A pie chart to see your macro distribution at a glance.

### Food Tracking
- **Food Database** - Includes over 200 items, with a focus on international and local Filipino cuisine.
- **Search Integration** - Connects to the Edamam Food Database API for broader search results.
- **Quick Logging** - Add foods quickly with custom serving sizes in grams.
- **Offline Search** - Built-in SQLite database with over 9,000 items for use without an internet connection.
- **Barcode Scanner** - Scan food labels to automatically retrieve and log nutrition data.
- **AI Assistant** - A hybrid assistant that runs locally on high-end devices and uses the cloud as a backup for others.

### Goal System
- **Daily Targets** - Notifications for when you reach 95% or more of your daily macro targets.
- **Daily Streaks** - Tracks how many consecutive days you have met your goals.
- **History and Stats** - View your progress over weeks, months, or the entire time you have used the app.
- **Milestones** - Simple animations and messages to acknowledge reached goals.

### Profile and Personalization
- **Dashboard** - A summary view based on your specific user data.
- **Adjustable Settings** - Update your weight, activity level, and goals whenever needed.
- **Automatic Updates** - Your daily targets recalibrate immediately when you update your profile.
- **Streak Tracking** - Clear display of your current progress and history.

### User Experience
- **Dark Mode** - A dark theme option for better visibility at night.
- **Responsive Layout** - Designed to work across different screen sizes.
- **Native Performance** - Uses native animations and feedback for a smooth feel.
- **Simplified Navigation** - Easy to move between the tracker, profile, and settings.

### Security
- **Authentication** - A system for secure account creation and login.
- **Data Protection** - Sensitive information is handled using secure encoding and hashing methods.
- **Session Control** - Automatic management of user sessions for better security.

## Quick Start

### Prerequisites
- Node.js 16 or higher
- Expo Go app on your mobile device (recommended for testing)

### Installation
```bash
# Clone the repository
git clone https://github.com/unsatisfieDg/MacroGenius.git
cd MacroGenius

# Install dependencies
npm install

# Start the development server
npm start
```

### Testing on Devices
1. Install **Expo Go** from the App Store or Google Play.
2. Run `npm start` in your terminal.
3. Scan the QR code displayed in the terminal with your phone.

## Project Structure
```
macrogenius/
├── App.js                      # Main application logic
├── src/
│   ├── components/             # UI components
│   ├── hooks/                  # Logic and state management
│   ├── utils/                  # Calculations and API helpers
│   └── assets/                 # Images and local database files
```

## Tech Stack
- **React Native** and **Expo** for the core mobile application.
- **React Navigation** for moving between screens.
- **AsyncStorage** and **SQLite** for local data storage.
- **Edamam API** for external food data.

## Usage
1. **Setup**: Enter your age, gender, height, weight, and activity level.
2. **Logging**: Search for foods or scan barcodes to log your meals.
3. **Review**: Check your progress bars and pie chart to stay on track.
4. **Consistency**: Aim to hit your targets daily to build your streak.

## Roadmap
- [x] Barcode scanner integration
- [x] Custom food creation
- [x] SQLite offline database (9,000+ items)
- [x] Hybrid AI Assistant (On-device + Cloud)
- [ ] Meal planning and recipe suggestions
- [ ] Data export (CSV/PDF)
- [ ] Social sharing features
- [ ] Water intake tracking

## License
This project is licensed under the MIT License.

## Acknowledgments
- Mifflin-St Jeor equation for nutrition math.
- Edamam for the food API.
- The Expo and React Native communities.

---
**Developed to help users take control of their nutrition and fitness.**
