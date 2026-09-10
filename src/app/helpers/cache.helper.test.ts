import { beforeEach, describe, expect, test } from "bun:test";
import {
  MAX_CACHE_ENTRIES,
  cacheSize,
  clearCache,
  getCached,
  normalizeCityKey,
  setCached,
} from "@/app/helpers/cache.helper";

describe("normalizeCityKey", () => {
  test("ignores surrounding padding and casing", () => {
    expect(normalizeCityKey("  London  ")).toBe("london");
    expect(normalizeCityKey("LONDON")).toBe(normalizeCityKey("london"));
  });

  test("collapses repeated inner whitespace", () => {
    expect(normalizeCityKey("New   York")).toBe("new york");
  });
});

describe("cache", () => {
  beforeEach(() => {
    clearCache();
  });

  test("returns a stored value before it expires", () => {
    setCached("london", { temperature: 21 });

    expect(getCached<{ temperature: number }>("london")).toEqual({ temperature: 21 });
  });

  test("returns undefined once the entry has expired", () => {
    setCached("london", { temperature: 21 }, -1);

    expect(getCached("london")).toBeUndefined();
  });

  test("returns undefined for a key that was never stored", () => {
    expect(getCached("nowhere")).toBeUndefined();
  });

  test("caps stored entries and evicts the oldest first", () => {
    for (let index = 0; index < MAX_CACHE_ENTRIES + 10; index += 1) {
      setCached(`city-${index}`, index);
    }

    expect(cacheSize()).toBe(MAX_CACHE_ENTRIES);
    expect(getCached("city-0")).toBeUndefined();
    expect(getCached<number>(`city-${MAX_CACHE_ENTRIES + 9}`)).toBe(MAX_CACHE_ENTRIES + 9);
  });

  test("re-setting a key refreshes its position so it is not evicted first", () => {
    setCached("keep-me", "original");

    for (let index = 0; index < MAX_CACHE_ENTRIES - 1; index += 1) {
      setCached(`filler-${index}`, index);
    }

    setCached("keep-me", "refreshed");

    for (let index = 0; index < 5; index += 1) {
      setCached(`extra-${index}`, index);
    }

    expect(getCached<string>("keep-me")).toBe("refreshed");
    expect(getCached("filler-0")).toBeUndefined();
  });

  test("reclaims expired entries instead of evicting live ones", () => {
    for (let index = 0; index < MAX_CACHE_ENTRIES; index += 1) {
      setCached(`stale-${index}`, index, -1);
    }

    setCached("fresh", "value");

    expect(getCached<string>("fresh")).toBe("value");
    expect(cacheSize()).toBe(1);
  });
});
