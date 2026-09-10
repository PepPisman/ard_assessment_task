import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { normalizeCityKey } from "@/app/helpers/cache.helper";

const MAX_RECENT = 5;
const BUN_SQLITE_SPECIFIER: string = "bun:sqlite";

const CREATE_TABLE =
  "CREATE TABLE IF NOT EXISTS recent_searches (city TEXT PRIMARY KEY, searched_at INTEGER NOT NULL)";
const UPSERT_SEARCH =
  "INSERT INTO recent_searches (city, searched_at) VALUES (?, ?) ON CONFLICT(city) DO UPDATE SET searched_at = excluded.searched_at";
const TRIM_TO_LIMIT =
  "DELETE FROM recent_searches WHERE city NOT IN (SELECT city FROM recent_searches ORDER BY searched_at DESC LIMIT ?)";
const SELECT_RECENT = "SELECT city FROM recent_searches ORDER BY searched_at DESC LIMIT ?";

interface SqliteRow {
  city: string;
}

interface SqliteStatement {
  all(...params: unknown[]): SqliteRow[];
}

interface SqliteDatabase {
  run(sql: string, ...params: unknown[]): void;
  query(sql: string): SqliteStatement;
}

type DatabaseConstructor = new (path: string) => SqliteDatabase;

const memoryFallback: string[] = [];

let initPromise: Promise<SqliteDatabase | null> | null = null;
let fallbackActive = false;
let lastTimestamp = 0;

function databasePath(): string {
  const override = process.env.RECENT_SEARCHES_DB_PATH;

  if (override) {
    return override;
  }

  return process.env.VERCEL ? "/tmp/recent.db" : "./data/recent.db";
}

function hasBunRuntime(): boolean {
  return typeof (globalThis as { Bun?: unknown }).Bun !== "undefined";
}

function nextTimestamp(): number {
  const now = Date.now();

  lastTimestamp = now > lastTimestamp ? now : lastTimestamp + 1;

  return lastTimestamp;
}

async function initializeDatabase(): Promise<SqliteDatabase | null> {
  if (!hasBunRuntime()) {
    fallbackActive = true;
    return null;
  }

  try {
    const loaded = (await import(BUN_SQLITE_SPECIFIER)) as { Database: DatabaseConstructor };
    const path = databasePath();

    mkdirSync(dirname(path), { recursive: true });

    const instance = new loaded.Database(path);
    instance.run(CREATE_TABLE);

    return instance;
  } catch {
    fallbackActive = true;

    return null;
  }
}

function ensureDatabase(): Promise<SqliteDatabase | null> {
  if (!initPromise) {
    initPromise = initializeDatabase();
  }

  return initPromise;
}

function rememberInMemory(city: string): void {
  const existing = memoryFallback.indexOf(city);

  if (existing !== -1) {
    memoryFallback.splice(existing, 1);
  }

  memoryFallback.unshift(city);
  memoryFallback.length = Math.min(memoryFallback.length, MAX_RECENT);
}

export async function recordSearch(city: string): Promise<void> {
  const normalized = normalizeCityKey(city);

  if (!normalized) {
    return;
  }

  const db = await ensureDatabase();

  if (!db) {
    rememberInMemory(normalized);
    return;
  }

  try {
    db.run(UPSERT_SEARCH, normalized, nextTimestamp());
    db.run(TRIM_TO_LIMIT, MAX_RECENT);
  } catch {
    fallbackActive = true;
    rememberInMemory(normalized);
  }
}

export async function getRecentSearches(limit: number = MAX_RECENT): Promise<string[]> {
  const db = await ensureDatabase();

  if (!db) {
    return memoryFallback.slice(0, limit);
  }

  try {
    return db
      .query(SELECT_RECENT)
      .all(limit)
      .map((row) => row.city);
  } catch {
    fallbackActive = true;
    return memoryFallback.slice(0, limit);
  }
}

export function isUsingFallbackStore(): boolean {
  return fallbackActive;
}
