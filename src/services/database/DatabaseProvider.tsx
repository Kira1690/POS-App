/**
 * Database Provider - React context for SQLite database access
 *
 * Initializes the database, runs one-time AsyncStorage migration,
 * and exposes the db instance via context + useDatabase() hook.
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  // Track initialization per JS session to handle Fast Refresh
  // After Fast Refresh, React preserves state (isReady=true) but the native
  // DB handle may be stale. This ref resets on each module evaluation.
  const initDoneRef = useRef(false);

  const initializeDatabase = useCallback(async () => {
    try {
      const database = await databaseService.initialize();
      await migrateFromAsyncStorage(database);
      setDb(database);
      setIsReady(true);
      setError(null);
      initDoneRef.current = true;

      if (__DEV__) {
        console.log('[DatabaseProvider] Database ready');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown database error';
      if (__DEV__) {
        console.error('[DatabaseProvider] Failed to initialize:', message);
      }
      setIsReady(false);

      // In dev mode, NativeDatabase errors after Fast Refresh are unrecoverable
      // because the native SQLite module handle is stale. Trigger a full reload.
      if (__DEV__ && message.includes('NativeDatabase')) {
        console.log('[DatabaseProvider] Stale native handle detected — triggering full reload');
        try {
          const { DevSettings } = require('react-native');
          DevSettings.reload();
          return; // Don't show error state, reload is coming
        } catch {
          // DevSettings not available, fall through to error state
        }
      }

      setError(message);
    }
  }, []);

  // Always re-initialize on mount. After Fast Refresh, React preserves
  // isReady=true but the native SQLite handle is stale (NullPointerException).
  // DatabaseService.initialize() validates the connection and re-opens if needed.
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
