import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Share, Alert, Platform } from 'react-native';

/**
 * Share a plain-text progress summary using the native share sheet.
 * Works on both iOS and Android without needing a file.
 */
export const shareProgressText = async ({ userData, nutrition, completionStats, completionData, dailyLog }) => {
  try {
    const name = userData?.givenName || userData?.firstName || 'there';
    const streak = completionData?.streak || 0;
    const bestStreak = completionData?.bestStreak || 0;
    const weekly = completionStats?.weeklyComplete || 0;
    const total = completionStats?.totalComplete || 0;

    const goalLabel =
      userData?.goal === 'muscle' ? 'Bulking'
      : userData?.goal === 'loss' ? 'Cutting'
      : userData?.goal === 'recomp' ? 'Body Recomp'
      : userData?.goal === 'slowloss' ? 'Slow Fat Loss'
      : 'Maintenance';

    const calPct = nutrition?.tdee
      ? Math.round((dailyLog?.calories / nutrition.tdee) * 100)
      : 0;
    const proteinPct = nutrition?.protein
      ? Math.round((dailyLog?.protein / nutrition.protein) * 100)
      : 0;

    const streakLine = streak > 0
      ? `🔥 ${streak}-day streak (best: ${bestStreak})`
      : `Just getting started — day 1 incoming!`;

    const message =
`Owen – Nutrition Progress

Hey, I'm ${name}!
Goal: ${goalLabel}

Today's Progress
• Calories: ${dailyLog?.calories || 0} / ${nutrition?.tdee || '—'} kcal (${calPct}%)
• Protein: ${dailyLog?.protein || 0}g / ${nutrition?.protein || '—'}g (${proteinPct}%)
• Carbs: ${dailyLog?.carbs || 0}g
• Fats: ${dailyLog?.fats || 0}g

Streak & Stats
${streakLine}
✅ Goals hit this week: ${weekly}
🏆 All-time completions: ${total}

Tracked with Owen — Smart Nutrition Tracker`;

    const result = await Share.share(
      {
        message,
        title: 'My Owen Progress',
      },
      {
        dialogTitle: 'Share your progress',
        subject: 'My Owen Nutrition Progress',
      }
    );

    return result;
  } catch (error) {
    Alert.alert('Share Failed', 'Could not open the share sheet.');
  }
};

/**
 * Share the CSV export file via expo-sharing.
 * Reuses the same logic as exportLogsToCSV but with a cleaner share sheet title.
 */
export const shareProgressCSV = async (weeklyData) => {
  try {
    if (!weeklyData || weeklyData.length === 0) {
      Alert.alert('No Data', "You haven't logged enough data to export yet.");
      return;
    }

    let csvContent = 'Date,Food Name,Serving(g),Calories(kcal),Protein(g),Carbs(g),Fats(g)\n';
    weeklyData.forEach(day => {
      const date = day.date || 'Unknown';
      (day.foods || []).forEach(food => {
        const row = [
          date,
          `"${food.name}"`,
          food.serving,
          food.calories,
          food.protein,
          food.carbs,
          food.fats,
        ].join(',');
        csvContent += row + '\n';
      });
    });

    const fileName = `Owen_Progress_${new Date().toISOString().split('T')[0]}.csv`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/csv',
        dialogTitle: 'Share your Nutrition Log',
        UTI: 'public.comma-separated-values-text',
      });
    } else {
      Alert.alert('Not Available', 'File sharing is not supported on this device.');
    }
  } catch (error) {
    console.error('Share CSV error:', error);
    Alert.alert('Share Failed', 'Could not share the CSV file.');
  }
};
