import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

/**
 * Converts food logs to a CSV string and shares it
 * @param {Array} logs - Array of daily logs
 */
export const exportLogsToCSV = async (logs) => {
  try {
    if (!logs || logs.length === 0) {
      Alert.alert('No Data', "You haven't logged any food yet!");
      return;
    }

    // Header
    let csvContent = 'Date,Food Name,Serving(g),Calories(kcal),Protein(g),Carbs(g),Fats(g)\n';

    // rows
    logs.forEach(day => {
      const date = day.date;
      day.foods.forEach(food => {
        const row = [
          date,
          `"${food.name}"`, // Quote names to handle commas
          food.serving,
          food.calories,
          food.protein,
          food.carbs,
          food.fats
        ].join(',');
        csvContent += row + '\n';
      });
    });

    const fileName = `MacroGenius_Export_${new Date().toISOString().split('T')[0]}.csv`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/csv',
        dialogTitle: 'Export your Nutrition Data',
        UTI: 'public.comma-separated-values-text',
      });
    } else {
      Alert.alert('Error', 'Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Export Error:', error);
    Alert.alert('Export Failed', 'An error occurred while generating the report.');
  }
};
