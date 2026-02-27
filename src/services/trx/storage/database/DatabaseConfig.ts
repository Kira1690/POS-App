/**
 * DatabaseConfig.ts - Configuration for TRX SQLite database
 */

export interface DatabaseConfig {
  databaseName: string;
  version: number;
  enableWAL: boolean;
  enableForeignKeys: boolean;
  busyTimeout: number;
}

export const DEFAULT_DATABASE_CONFIG: DatabaseConfig = {
  databaseName: 'trx_payment_processor.db',
  version: 1,
  enableWAL: true,
  enableForeignKeys: true,
  busyTimeout: 10000,
};

export function getDatabaseConfig(): DatabaseConfig {
  return { ...DEFAULT_DATABASE_CONFIG };
}
