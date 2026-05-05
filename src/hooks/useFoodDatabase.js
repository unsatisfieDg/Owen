import { useState, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';

export const useFoodDatabase = () => {
  const [db, setDb] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadDatabase() {
      try {
        const dbName = 'offline_foods.db';
        const dbPath = `${FileSystem.documentDirectory}SQLite/${dbName}`;
        
        // Ensure the directory exists
        const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}SQLite`);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}SQLite`);
        }

        // Check if the DB is already copied, if not copy it from assets
        const fileInfo = await FileSystem.getInfoAsync(dbPath);
        if (!fileInfo.exists) {
          console.log('Copying massive SQLite database to device...');
          const asset = Asset.fromModule(require('../../assets/offline_foods.db'));
          await asset.downloadAsync();
          await FileSystem.copyAsync({
            from: asset.localUri,
            to: dbPath,
          });
        }

        // Open the database using the new sync API (SDK 50+)
        const database = await SQLite.openDatabaseAsync(dbName);
        setDb(database);
        setIsReady(true);
      } catch (error) {
        console.error("Error loading SQLite Database:", error);
      }
    }

    loadDatabase();
  }, []);

  const searchFoods = async (query) => {
    if (!db || !query || query.trim().length < 2) return [];
    try {
      // Use parameterized query to prevent SQL injection and do wildcard search
      const result = await db.getAllAsync(
        'SELECT * FROM foods WHERE name LIKE ? LIMIT 20',
        [`%${query}%`]
      );
      return result;
    } catch (error) {
      console.error("Error searching SQLite:", error);
      return [];
    }
  };

  return { isReady, searchFoods };
};
