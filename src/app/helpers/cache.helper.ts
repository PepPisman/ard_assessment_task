export const CACHE_TTL_MS = 10 * 60 * 1000;
export const MAX_CACHE_ENTRIES = 200;

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const store = new Map<string, CacheEntry>();

export function normalizeCityKey(city: string): string {
  return city.trim().toLowerCase().replace(/\s+/g, " ");
}

function dropExpiredEntries(): void {
  const now = Date.now();

  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) {
      store.delete(key);
    }
  }
}

function evictUntilUnderLimit(): void {
  while (store.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = store.keys().next().value;

    if (oldestKey === undefined) {
      return;
    }

    store.delete(oldestKey);
  }
}

export function getCached<T>(key: string): T | undefined {
  const entry = store.get(key);

  if (!entry) {
    return undefined;
  }

  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return undefined;
  }

  return entry.data as T;
}

export function setCached<T>(key: string, value: T, ttlMs: number = CACHE_TTL_MS): void {
  store.delete(key);

  if (store.size >= MAX_CACHE_ENTRIES) {
    dropExpiredEntries();
    evictUntilUnderLimit();
  }

  store.set(key, { data: value, expiresAt: Date.now() + ttlMs });
}

export function clearCache(): void {
  store.clear();
}

export function cacheSize(): number {
  return store.size;
}
