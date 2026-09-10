/**
 * SQLite Database Client — Native Platform (iOS / Android)
 * Loaded by Metro on native devices. Uses real expo-sqlite.
 */

import type { DatabaseInterface } from './client.types';
import type { SQLiteDatabase } from 'expo-sqlite';
import { InMemoryDatabase } from './client.web';

export { generateId } from './client.types';



const INIT_SQL = `
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY NOT NULL,
    label TEXT NOT NULL,
    emoji TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    isDefault INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'specific_days')),
    specificDays TEXT,
    createdAt TEXT NOT NULL,
    isArchived INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS habit_completions (
    id TEXT PRIMARY KEY NOT NULL,
    habitId TEXT NOT NULL,
    completedAt TEXT NOT NULL,
    FOREIGN KEY (habitId) REFERENCES habits(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_habit_completions_habitId ON habit_completions(habitId);
  CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(completedAt);

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    isDailyMission INTEGER NOT NULL DEFAULT 0,
    isCompleted INTEGER NOT NULL DEFAULT 0,
    dueDate TEXT NOT NULL,
    goalId TEXT,
    createdAt TEXT NOT NULL,
    completedAt TEXT,
    requireProof INTEGER NOT NULL DEFAULT 0,
    proofImageUri TEXT,
    proofAudioUri TEXT,
    proofFileUri TEXT,
    proofNote TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_tasks_dueDate ON tasks(dueDate);
  CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);

  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    targetValue REAL NOT NULL,
    currentValue REAL NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    weekStartDate TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY NOT NULL,
    content TEXT NOT NULL,
    mood TEXT CHECK(mood IN ('great', 'good', 'neutral', 'bad', 'terrible')),
    date TEXT NOT NULL UNIQUE,
    createdAt TEXT NOT NULL
  );
`;

async function migrateTasksTable(sqliteDb: SQLiteDatabase) {
  try {
    const tableInfo = await sqliteDb.getAllAsync<{ name: string }>('PRAGMA table_info(tasks);');
    const existingCols = new Set(tableInfo.map((c) => c.name));

    const columnsToAdd = [
      { name: 'requireProof', type: 'INTEGER NOT NULL DEFAULT 0' },
      { name: 'proofImageUri', type: 'TEXT' },
      { name: 'proofAudioUri', type: 'TEXT' },
      { name: 'proofFileUri', type: 'TEXT' },
      { name: 'proofNote', type: 'TEXT' },
    ];

    for (const col of columnsToAdd) {
      if (!existingCols.has(col.name)) {
        try {
          await sqliteDb.execAsync(`ALTER TABLE tasks ADD COLUMN ${col.name} ${col.type};`);
        } catch (e) {
          // Column already exists or table locked, safely continue
        }
      }
    }
  } catch (e) {
    console.warn('Task migration check error:', e);
  }
}

let sqliteModule: any = null;

function loadSQLiteModule() {
  if (!sqliteModule) {
    try {
      sqliteModule = require('expo-sqlite');
    } catch (e) {
      console.warn('Native expo-sqlite is not available in this client environment:', e);
      return null;
    }
  }
  return sqliteModule;
}

let dbPromise: Promise<DatabaseInterface> | null = null;
let retryCount = 0;
const MAX_RETRIES = 3;

export async function getDatabase(): Promise<DatabaseInterface> {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    try {
      const SQLite = loadSQLiteModule();
      if (!SQLite || !SQLite.openDatabaseAsync) {
        console.warn('Native SQLite module not found, using InMemoryDatabase fallback');
        return new InMemoryDatabase();
      }

      const sqliteDb: SQLiteDatabase = await SQLite.openDatabaseAsync('growthOS.db');

      // PRAGMA statements executed safely and independently
      try {
        await sqliteDb.execAsync('PRAGMA journal_mode = WAL;');
      } catch (e) {
        console.warn('PRAGMA journal_mode error:', e);
      }
      try {
        await sqliteDb.execAsync('PRAGMA busy_timeout = 5000;');
      } catch (e) {
        console.warn('PRAGMA busy_timeout error:', e);
      }
      try {
        await sqliteDb.execAsync('PRAGMA synchronous = NORMAL;');
      } catch (e) {
        console.warn('PRAGMA synchronous error:', e);
      }
      try {
        await sqliteDb.execAsync('PRAGMA foreign_keys = ON;');
      } catch (e) {
        console.warn('PRAGMA foreign_keys error:', e);
      }

      await sqliteDb.execAsync(INIT_SQL);
      await migrateTasksTable(sqliteDb);
      retryCount = 0; // Reset retry count on success

      return {
        getAllAsync: async <T>(sql: string, params?: any[]): Promise<T[]> => {
          try {
            return await sqliteDb.getAllAsync<T>(sql, params || []);
          } catch (e) {
            console.error('DB getAllAsync error:', e);
            return [];
          }
        },
        getFirstAsync: async <T>(sql: string, params?: any[]): Promise<T | null> => {
          try {
            return await sqliteDb.getFirstAsync<T>(sql, params || []);
          } catch (e) {
            console.error('DB getFirstAsync error:', e);
            return null;
          }
        },
        runAsync: async (sql: string, params?: any[]) => {
          try {
            await sqliteDb.runAsync(sql, params || []);
          } catch (e) {
            console.error('DB runAsync error:', e);
          }
        },
        execAsync: async (sql: string) => {
          try {
            await sqliteDb.execAsync(sql);
          } catch (e) {
            console.error('DB execAsync error:', e);
          }
        },
      };
    } catch (error) {
      dbPromise = null;
      console.error('Failed to initialize SQLite database:', error);

      // Retry logic for transient initialization failures
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.warn(`Retrying database initialization (attempt ${retryCount}/${MAX_RETRIES})...`);
        // Small delay before retry
        await new Promise((resolve) => setTimeout(resolve, 500 * retryCount));
        return getDatabase();
      }

      // Fallback safe in-memory database to prevent app crash if SQLite fails
      console.error('Database initialization failed after retries, returning safe InMemoryDatabase fallback');
      return new InMemoryDatabase();
    }
  })();

  return dbPromise;
}


 // Native sqlite connection
