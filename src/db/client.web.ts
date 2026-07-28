/**
 * Database Client — Web fallback (in-memory store for dev preview)
 * This file is loaded on web platform via .web.ts extension.
 */

import type { DatabaseInterface } from './client.types';

export { generateId } from './client.types';

type Row = Record<string, any>;

class InMemoryDatabase implements DatabaseInterface {
  private tables: Record<string, Row[]> = {};

  constructor() {
    this.tables = {
      categories: [],
      habits: [],
      habit_completions: [],
      tasks: [],
      goals: [],
      journal_entries: [],
    };
  }

  async execAsync(_sql: string): Promise<void> {}

  async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
    const tableName = this.extractTableName(sql);
    if (!tableName || !this.tables[tableName]) return [];

    let rows = [...this.tables[tableName]];

    const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+LIMIT|\s*$)/i);
    if (whereMatch) {
      rows = this.applyWhere(rows, whereMatch[1], params);
    }

    const orderMatch = sql.match(/ORDER BY\s+(\w+)\s+(ASC|DESC)?/i);
    if (orderMatch) {
      const field = orderMatch[1];
      const dir = (orderMatch[2] || 'ASC').toUpperCase();
      rows.sort((a, b) => {
        if (a[field] < b[field]) return dir === 'ASC' ? -1 : 1;
        if (a[field] > b[field]) return dir === 'ASC' ? 1 : -1;
        return 0;
      });
    }

    return rows as T[];
  }

  async getFirstAsync<T>(sql: string, params: any[] = []): Promise<T | null> {
    const results = await this.getAllAsync<T>(sql, params);
    return results[0] || null;
  }

  async runAsync(sql: string, params: any[] = []): Promise<void> {
    const sqlUpper = sql.trim().toUpperCase();
    if (sqlUpper.startsWith('INSERT')) this.handleInsert(sql, params);
    else if (sqlUpper.startsWith('UPDATE')) this.handleUpdate(sql, params);
    else if (sqlUpper.startsWith('DELETE')) this.handleDelete(sql, params);
  }

  private extractTableName(sql: string): string | null {
    const fromMatch = sql.match(/FROM\s+(\w+)/i);
    if (fromMatch) return fromMatch[1];
    const intoMatch = sql.match(/INTO\s+(\w+)/i);
    if (intoMatch) return intoMatch[1];
    const updateMatch = sql.match(/UPDATE\s+(\w+)/i);
    if (updateMatch) return updateMatch[1];
    return null;
  }

  private applyWhere(rows: Row[], whereClause: string, params: any[]): Row[] {
    const conditions = whereClause.split(/\s+AND\s+/i);
    let paramIndex = 0;

    return rows.filter((row) => {
      return conditions.every((cond) => {
        const eqMatch = cond.trim().match(/(\w+)\s*=\s*\?/);
        if (eqMatch) {
          const field = eqMatch[1];
          const value = params[paramIndex++];
          return row[field] == value;
        }
        return true;
      });
    });
  }

  private handleInsert(sql: string, params: any[]) {
    const tableName = this.extractTableName(sql);
    if (!tableName || !this.tables[tableName]) return;

    const colMatch = sql.match(/\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (!colMatch) return;

    const columns = colMatch[1].split(',').map((c) => c.trim());
    const valueTokens = colMatch[2].split(',').map((v) => v.trim());
    const row: Row = {};
    let paramIndex = 0;

    columns.forEach((col, i) => {
      const valToken = valueTokens[i];
      if (valToken === '?') {
        row[col] = params[paramIndex++] ?? null;
      } else if (valToken === '0') {
        row[col] = 0;
      } else if (valToken === '1') {
        row[col] = 1;
      } else if (valToken?.toUpperCase() === 'NULL') {
        row[col] = null;
      } else {
        row[col] = params[paramIndex++] ?? null;
      }
    });

    this.tables[tableName].push(row);
  }

  private handleUpdate(sql: string, params: any[]) {
    const tableName = this.extractTableName(sql);
    if (!tableName || !this.tables[tableName]) return;

    const setMatch = sql.match(/SET\s+(.+?)\s+WHERE/i);
    if (!setMatch) return;

    const setClauses = setMatch[1].split(',').map((c) => c.trim());
    const setFields: { field: string; paramIndex: number }[] = [];
    let paramIdx = 0;

    setClauses.forEach((clause) => {
      const m = clause.match(/(\w+)\s*=\s*\?/);
      if (m) {
        setFields.push({ field: m[1], paramIndex: paramIdx++ });
      } else {
        const nullMatch = clause.match(/(\w+)\s*=\s*NULL/i);
        if (nullMatch) setFields.push({ field: nullMatch[1], paramIndex: -1 });
      }
    });

    const whereMatch = sql.match(/WHERE\s+(.+)$/i);
    if (!whereMatch) return;

    const whereParams = params.slice(paramIdx);
    const rows = this.applyWhere(this.tables[tableName], whereMatch[1], whereParams);

    rows.forEach((row) => {
      setFields.forEach((sf) => {
        row[sf.field] = sf.paramIndex === -1 ? null : params[sf.paramIndex];
      });
    });
  }

  private handleDelete(sql: string, params: any[]) {
    const tableName = this.extractTableName(sql);
    if (!tableName || !this.tables[tableName]) return;

    const whereMatch = sql.match(/WHERE\s+(.+)$/i);
    if (!whereMatch) { this.tables[tableName] = []; return; }

    const toDelete = new Set(this.applyWhere(this.tables[tableName], whereMatch[1], params));
    this.tables[tableName] = this.tables[tableName].filter((r) => !toDelete.has(r));
  }
}

let db: DatabaseInterface | null = null;

export async function getDatabase(): Promise<DatabaseInterface> {
  if (db) return db;
  db = new InMemoryDatabase();
  return db;
}
 // LocalStorage fallback sync
