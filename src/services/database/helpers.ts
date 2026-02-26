/**
 * Database Helpers - SQL utility functions for common operations
 */

/**
 * Convert a TypeScript object to SQL column-value pairs for INSERT.
 * Handles JSON serialization for objects/arrays.
 */
export function toSqlValues(
  data: Record<string, unknown>,
  columns: string[]
): unknown[] {
  return columns.map((col) => {
    const value = data[col];
    if (value === undefined || value === null) return null;
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? 1 : 0;
    return value;
  });
}

/**
 * Build an INSERT OR REPLACE statement with parameter placeholders.
 */
export function buildUpsert(
  table: string,
  columns: string[]
): string {
  const placeholders = columns.map(() => '?').join(', ');
  return `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
}

/**
 * Build a WHERE clause from a filter object.
 * Returns { clause: string, params: unknown[] }
 */
export function buildWhere(
  filters: Record<string, unknown>
): { clause: string; params: unknown[] } {
  const conditions: string[] = [];
  const params: unknown[] = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'boolean') {
      conditions.push(`${key} = ?`);
      params.push(value ? 1 : 0);
    } else {
      conditions.push(`${key} = ?`);
      params.push(value);
    }
  }

  if (conditions.length === 0) {
    return { clause: '', params: [] };
  }

  return {
    clause: `WHERE ${conditions.join(' AND ')}`,
    params,
  };
}

/**
 * Parse a JSON string column, returning the parsed value or a default.
 */
export function parseJsonColumn<T>(value: string | null | undefined, defaultValue: T): T {
  if (!value) return defaultValue;
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Convert a boolean SQLite integer (0/1) to TypeScript boolean.
 */
export function fromSqlBool(value: number | null | undefined): boolean {
  return value === 1;
}

/**
 * Convert a TypeScript boolean to SQLite integer (0/1).
 */
export function toSqlBool(value: boolean | undefined): number {
  return value ? 1 : 0;
}

/**
 * Get current ISO timestamp string.
 */
export function now(): string {
  return new Date().toISOString();
}
