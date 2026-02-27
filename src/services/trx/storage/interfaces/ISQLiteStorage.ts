/**
 * ISQLiteStorage.ts - Interface for SQLite storage operations
 */

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  message?: string;
}

export interface DatabaseHealth {
  isConnected: boolean;
  schemaVersion: number;
  databaseSize: number;
  lastVacuum?: string;
  lastAnalyze?: string;
}

export interface SQLOperation {
  sql: string;
  params?: unknown[];
}

export interface ISQLiteStorage {
  query<T>(sql: string, params?: unknown[]): Promise<StorageResult<T[]>>;
  queryOne<T>(sql: string, params?: unknown[]): Promise<StorageResult<T | null>>;
  execute(sql: string, params?: unknown[]): Promise<StorageResult<void>>;
  executeBatch(operations: SQLOperation[]): Promise<StorageResult<void>>;
  transaction<T>(operations: () => Promise<T>): Promise<StorageResult<T>>;
  vacuum(): Promise<StorageResult<void>>;
  analyze(): Promise<StorageResult<void>>;
  checkIntegrity(): Promise<StorageResult<boolean>>;
  healthCheck(): Promise<StorageResult<DatabaseHealth>>;
  getStorageSize(): Promise<StorageResult<number>>;
  initialize(): Promise<StorageResult<void>>;
}
