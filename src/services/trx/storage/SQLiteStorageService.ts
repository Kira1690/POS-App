/**
 * SQLiteStorageService.ts - SQLite facade for TRX storage
 */

import { LoggingService } from '../logging/LoggingService';
import { DatabaseManager } from './database/DatabaseManager';
import { DatabaseExecutor, SQLOperation } from './database/DatabaseExecutor';
import { SchemaInitializer } from './database/SchemaInitializer';
import { ISQLiteStorage, StorageResult, DatabaseHealth } from './interfaces/ISQLiteStorage';

export class SQLiteStorageService implements ISQLiteStorage {
  private static instance: SQLiteStorageService;
  private executor: DatabaseExecutor;
  private schemaInitializer: SchemaInitializer;
  private logger: LoggingService;
  private initialized = false;

  private constructor() {
    this.executor = DatabaseExecutor.getInstance();
    this.schemaInitializer = SchemaInitializer.getInstance();
    this.logger = LoggingService.getInstance();
  }

  public static getInstance(): SQLiteStorageService {
    if (!SQLiteStorageService.instance) {
      SQLiteStorageService.instance = new SQLiteStorageService();
    }
    return SQLiteStorageService.instance;
  }

  public async initialize(): Promise<StorageResult<void>> {
    try {
      if (this.initialized) return { success: true };
      await this.schemaInitializer.initializeSchema();
      this.initialized = true;
      this.logger.info('SQLiteStorageService initialized', 'SQLiteStorageService.initialize');
      return { success: true };
    } catch (error) {
      this.logger.error(
        'Failed to initialize SQLiteStorageService',
        error instanceof Error ? error : new Error(String(error)),
        'SQLiteStorageService.initialize'
      );
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async query<T>(sql: string, params?: unknown[]): Promise<StorageResult<T[]>> {
    await this.ensureInitialized();
    const result = await this.executor.query<T>(sql, params);
    return { success: result.success, data: result.data, error: result.error };
  }

  public async queryOne<T>(sql: string, params?: unknown[]): Promise<StorageResult<T | null>> {
    await this.ensureInitialized();
    const result = await this.executor.queryOne<T>(sql, params);
    return { success: result.success, data: result.data, error: result.error };
  }

  public async execute(sql: string, params?: unknown[]): Promise<StorageResult<void>> {
    await this.ensureInitialized();
    const result = await this.executor.execute(sql, params);
    return { success: result.success, error: result.error };
  }

  public async executeBatch(operations: SQLOperation[]): Promise<StorageResult<void>> {
    await this.ensureInitialized();
    const result = await this.executor.executeBatch(operations);
    return { success: result.success, error: result.error };
  }

  public async transaction<T>(operations: () => Promise<T>): Promise<StorageResult<T>> {
    await this.ensureInitialized();
    const result = await this.executor.transaction(operations);
    return { success: result.success, data: result.data, error: result.error };
  }

  public async vacuum(): Promise<StorageResult<void>> {
    const result = await this.executor.vacuum();
    return { success: result.success, error: result.error };
  }

  public async analyze(): Promise<StorageResult<void>> {
    const result = await this.executor.analyze();
    return { success: result.success, error: result.error };
  }

  public async checkIntegrity(): Promise<StorageResult<boolean>> {
    try {
      const db = await DatabaseManager.getInstance().getDatabase();
      const result = await db.getAllAsync<{ integrity_check: string }>('PRAGMA integrity_check');
      const isValid = result.length > 0 && result[0].integrity_check === 'ok';
      return { success: true, data: isValid };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async healthCheck(): Promise<StorageResult<DatabaseHealth>> {
    try {
      const integrityResult = await this.checkIntegrity();
      const sizeResult = await this.getStorageSize();
      return {
        success: true,
        data: {
          isConnected: true,
          schemaVersion: 1,
          databaseSize: sizeResult.data || 0,
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async getStorageSize(): Promise<StorageResult<number>> {
    try {
      const result = await this.executor.queryOne<{ page_count: number; page_size: number }>(
        'PRAGMA page_count;'
      );
      if (result.success && result.data) {
        const pageSizeResult = await this.executor.queryOne<{ page_size: number }>('PRAGMA page_size;');
        const pageSize = pageSizeResult.data?.page_size || 4096;
        return { success: true, data: result.data.page_count * pageSize };
      }
      return { success: true, data: 0 };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}
