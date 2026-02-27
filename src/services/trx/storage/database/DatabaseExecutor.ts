/**
 * DatabaseExecutor.ts - Handles database query execution for TRX
 */

import { LoggingService } from '../../logging/LoggingService';
import { DatabaseManager } from './DatabaseManager';

export interface QueryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  rowsAffected?: number;
}

export interface SQLOperation {
  sql: string;
  params?: unknown[];
}

export class DatabaseExecutor {
  private static instance: DatabaseExecutor;
  private dbManager: DatabaseManager;
  private logger: LoggingService;

  private constructor() {
    this.dbManager = DatabaseManager.getInstance();
    this.logger = LoggingService.getInstance();
  }

  public static getInstance(): DatabaseExecutor {
    if (!DatabaseExecutor.instance) {
      DatabaseExecutor.instance = new DatabaseExecutor();
    }
    return DatabaseExecutor.instance;
  }

  public async query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T[]>> {
    try {
      const db = await this.dbManager.getDatabase();
      this.logQuery(sql, params);
      const result = await db.getAllAsync<T>(sql, (params || []) as never[]);
      return { success: true, data: result };
    } catch (error) {
      this.logger.error(
        `Query failed: ${sql}`,
        error instanceof Error ? error : new Error(String(error)),
        'DatabaseExecutor.query'
      );
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async queryOne<T>(sql: string, params?: unknown[]): Promise<QueryResult<T | null>> {
    try {
      const db = await this.dbManager.getDatabase();
      this.logQuery(sql, params);
      const result = await db.getFirstAsync<T>(sql, (params || []) as never[]);
      return { success: true, data: result ?? null };
    } catch (error) {
      this.logger.error(
        `Query failed: ${sql}`,
        error instanceof Error ? error : new Error(String(error)),
        'DatabaseExecutor.queryOne'
      );
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async execute(sql: string, params?: unknown[]): Promise<QueryResult<void>> {
    try {
      const db = await this.dbManager.getDatabase();
      this.logQuery(sql, params);
      const result = await db.runAsync(sql, (params || []) as never[]);
      return { success: true, rowsAffected: result.changes };
    } catch (error) {
      this.logger.error(
        `Execute failed: ${sql}`,
        error instanceof Error ? error : new Error(String(error)),
        'DatabaseExecutor.execute'
      );
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async transaction<T>(operations: () => Promise<T>): Promise<QueryResult<T>> {
    const db = await this.dbManager.getDatabase();
    try {
      this.logger.debug('BEGIN TRANSACTION', 'DatabaseExecutor.transaction');
      await db.execAsync('BEGIN TRANSACTION;');
      const result = await operations();
      await db.execAsync('COMMIT;');
      this.logger.debug('COMMIT TRANSACTION', 'DatabaseExecutor.transaction');
      return { success: true, data: result };
    } catch (error) {
      this.logger.error(
        'Transaction failed, rolling back',
        error instanceof Error ? error : new Error(String(error)),
        'DatabaseExecutor.transaction'
      );
      try {
        await db.execAsync('ROLLBACK;');
      } catch (rollbackError) {
        this.logger.error('Rollback failed', rollbackError instanceof Error ? rollbackError : new Error(String(rollbackError)), 'DatabaseExecutor.transaction');
      }
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async executeBatch(operations: SQLOperation[]): Promise<QueryResult<void>> {
    return this.transaction(async () => {
      const db = await this.dbManager.getDatabase();
      for (const operation of operations) {
        this.logQuery(operation.sql, operation.params);
        await db.runAsync(operation.sql, (operation.params || []) as never[]);
      }
    });
  }

  public async execRaw(sql: string): Promise<QueryResult<void>> {
    try {
      const db = await this.dbManager.getDatabase();
      await db.execAsync(sql);
      return { success: true };
    } catch (error) {
      this.logger.error(
        `Raw execution failed: ${sql}`,
        error instanceof Error ? error : new Error(String(error)),
        'DatabaseExecutor.execRaw'
      );
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async vacuum(): Promise<QueryResult<void>> {
    try {
      const db = await this.dbManager.getDatabase();
      await db.execAsync('VACUUM;');
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  public async analyze(): Promise<QueryResult<void>> {
    try {
      const db = await this.dbManager.getDatabase();
      await db.execAsync('ANALYZE;');
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  private logQuery(sql: string, params?: unknown[]): void {
    if (params && params.length > 0) {
      this.logger.debug(`SQL: ${sql} | Params: ${JSON.stringify(params)}`, 'DatabaseExecutor');
    } else {
      this.logger.debug(`SQL: ${sql}`, 'DatabaseExecutor');
    }
  }
}
