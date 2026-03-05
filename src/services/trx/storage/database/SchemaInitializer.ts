/**
 * SchemaInitializer.ts - Handles TRX database schema initialization
 */

import { DatabaseManager, SQLiteDatabase } from './DatabaseManager';
import { LoggingService } from '../../logging/LoggingService';
import { INITIAL_SCHEMA_SQL, INDEXES_SQL } from './schemas/SchemaSQL';

interface SchemaVersion {
  version: number;
  applied_at: string;
  description: string;
}

export class SchemaInitializer {
  private static instance: SchemaInitializer;
  private dbManager: DatabaseManager;
  private logger: LoggingService;

  private constructor() {
    this.dbManager = DatabaseManager.getInstance();
    this.logger = LoggingService.getInstance();
  }

  public static getInstance(): SchemaInitializer {
    if (!SchemaInitializer.instance) {
      SchemaInitializer.instance = new SchemaInitializer();
    }
    return SchemaInitializer.instance;
  }

  public async initializeSchema(): Promise<void> {
    try {
      this.logger.info('Initializing TRX database schema...', 'SchemaInitializer.initializeSchema');
      const db = await this.dbManager.getDatabase();
      const currentVersion = await this.getCurrentVersion(db);

      if (currentVersion === 0) {
        await this.createInitialSchema(db);
      } else {
        this.logger.info(`Schema version ${currentVersion} already applied`, 'SchemaInitializer.initializeSchema');
        await this.runMigrations(db, currentVersion);
      }

      this.logger.info('Schema initialization complete', 'SchemaInitializer.initializeSchema');
    } catch (error) {
      this.logger.error(
        'Schema initialization failed',
        error instanceof Error ? error : new Error(String(error)),
        'SchemaInitializer.initializeSchema'
      );
      throw error;
    }
  }

  private async runMigrations(db: SQLiteDatabase, currentVersion: number): Promise<void> {
    if (currentVersion < 2) {
      // v2: add terminal_settings table for SQLite-based selected terminal storage
      try {
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS terminal_settings (
            id INTEGER PRIMARY KEY,
            ip TEXT NOT NULL,
            port INTEGER NOT NULL DEFAULT 1180,
            name TEXT,
            is_selected INTEGER NOT NULL DEFAULT 1,
            connected_at TEXT,
            last_ping_success TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
          );
        `);
        await db.runAsync(
          'INSERT INTO schema_version (version, applied_at, description) VALUES (?, ?, ?)',
          [2, new Date().toISOString(), 'Add terminal_settings table']
        );
        this.logger.info('Applied TRX schema v2 migration', 'SchemaInitializer.runMigrations');
      } catch (error) {
        this.logger.error(
          'Failed to apply v2 migration',
          error instanceof Error ? error : new Error(String(error)),
          'SchemaInitializer.runMigrations'
        );
      }
    }
  }

  private async createInitialSchema(db: SQLiteDatabase): Promise<void> {
    try {
      this.logger.info('Creating initial schema...', 'SchemaInitializer.createInitialSchema');
      await db.execAsync('BEGIN TRANSACTION;');
      try {
        await db.execAsync(INITIAL_SCHEMA_SQL);
        await db.execAsync(INDEXES_SQL);
        await db.runAsync(
          'INSERT INTO schema_version (version, applied_at, description) VALUES (?, ?, ?)',
          [1, new Date().toISOString(), 'Initial TRX schema creation']
        );
        await db.execAsync('COMMIT;');
        this.logger.info('Initial schema created successfully', 'SchemaInitializer.createInitialSchema');
      } catch (error) {
        await db.execAsync('ROLLBACK;');
        throw error;
      }
    } catch (error) {
      this.logger.error(
        'Failed to create initial schema',
        error instanceof Error ? error : new Error(String(error)),
        'SchemaInitializer.createInitialSchema'
      );
      throw error;
    }
  }

  private async getCurrentVersion(db: SQLiteDatabase): Promise<number> {
    try {
      const tableExists = await db.getAllAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'"
      );
      if (tableExists.length === 0) return 0;

      const result = await db.getAllAsync<SchemaVersion>(
        'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
      );
      return result.length > 0 ? result[0].version : 0;
    } catch {
      return 0;
    }
  }
}
