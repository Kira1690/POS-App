/**
 * Customer Storage Service — minimal SQLite cache for offline customer lookup.
 * Stores customers pulled from the backend as a JSON blob.
 */

import { databaseService } from '@/services/database/DatabaseService';

class CustomerStorageService {
  private get db() {
    return databaseService.getDatabase();
  }

  async ensureTable(): Promise<void> {
    try {
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS customers_cache (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    } catch (err) {
      if (__DEV__) console.error('[CustomerStorageService] ensureTable:', err);
    }
  }

  async upsertAll(customers: unknown[]): Promise<void> {
    await this.ensureTable();
    if (!Array.isArray(customers) || customers.length === 0) return;
    for (const c of customers) {
      const customer = c as Record<string, unknown>;
      const id = String(customer['id'] ?? '');
      if (!id) continue;
      await this.db.runAsync(
        `INSERT INTO customers_cache (id, data, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at;`,
        [id, JSON.stringify(customer), new Date().toISOString()]
      );
    }
  }

  async getAll(): Promise<unknown[]> {
    await this.ensureTable();
    const rows = await this.db.getAllAsync<{ data: string }>('SELECT data FROM customers_cache;');
    return rows.map(r => {
      try { return JSON.parse(r.data); } catch { return null; }
    }).filter(Boolean);
  }
}

export const customerStorageService = new CustomerStorageService();
