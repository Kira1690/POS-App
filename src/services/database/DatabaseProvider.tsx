/**
 * Database Provider - React context for SQLite database access
 *
 * Initializes the database, runs one-time AsyncStorage migration,
 * and exposes the db instance via context + useDatabase() hook.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { type SQLiteDatabase } from 'expo-sqlite';
import { databaseService } from './DatabaseService';
import { migrateFromAsyncStorage } from './migrations';

interface DatabaseContextValue {
  db: SQLiteDatabase;
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextValue | null>(null);

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const [db, setDb] = useState<SQLiteDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeDatabase = useCallback(async () => {
    try {
      const database = await databaseService.initialize();
      await migrateFromAsyncStorage(database);
      setDb(database);
      setIsReady(true);

      if (__DEV__) {
        console.log('[DatabaseProvider] Database ready');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown database error';
      console.error('[DatabaseProvider] Failed to initialize:', message);
      setError(message);
    }
  }, []);

  useEffect(() => {
    initializeDatabase();
  }, [initializeDatabase]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>Database Error</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!isReady || !db) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing database...</Text>
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={{ db, isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
};

/**
 * Hook to access the SQLite database instance.
 * Must be used within a DatabaseProvider.
 */
export function useDatabase(): SQLiteDatabase {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context.db;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
