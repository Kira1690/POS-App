/**
 * DatabaseManager.ts - SQLite connection manager for TRX
 */

import * as SQLite from 'expo-sqlite';
import { LoggingService } from '../../logging/LoggingService';
import { getDatabaseConfig } from './DatabaseConfig';

export type SQLiteDatabase = SQLite.SQLiteDatabase;

export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: SQLiteDatabase | null = null;
  private logger: LoggingService;
  private isInitialized = false;

  private constructor() {
    this.logger = LoggingService.getInstance();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async getDatabase(): Promise<SQLiteDatabase> {
    if (!this.db) {
      await this.initialize();
    }
    return this.db!;
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const config = getDatabaseConfig();
      this.logger.info(`Opening database: ${config.databaseName}`, 'DatabaseManager.initialize');

      this.db = await SQLite.openDatabaseAsync(config.databaseName);

      if (config.enableWAL) {
        await this.db.execAsync('PRAGMA journal_mode = WAL;');
      }

      if (config.enableForeignKeys) {
        await this.db.execAsync('PRAGMA foreign_keys = ON;');
      }

      if (config.busyTimeout > 0) {
        await this.db.execAsync(`PRAGMA busy_timeout = ${config.busyTimeout};`);
      }

      this.isInitialized = true;
      this.logger.info('Database initialized successfully', 'DatabaseManager.initialize');
    } catch (error) {
      this.logger.error(
        'Failed to initialize database',
        error instanceof Error ? error : new Error(String(error)),
        'DatabaseManager.initialize'
      );
      throw error;
    }
  }

  public async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.isInitialized = false;
      this.logger.info('Database closed', 'DatabaseManager.closeDatabase');
    }
  }
}
