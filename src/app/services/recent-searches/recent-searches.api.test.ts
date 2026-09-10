import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  getRecentSearches,
  recordSearch,
} from "@/app/services/recent-searches/recent-searches.api";

let temporaryDirectory = "";

beforeAll(() => {
  temporaryDirectory = mkdtempSync(join(tmpdir(), "recent-searches-"));
  process.env.RECENT_SEARCHES_DB_PATH = join(temporaryDirectory, "recent.db");
});

afterAll(() => {
  delete process.env.RECENT_SEARCHES_DB_PATH;

  try {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  } catch {
    return;
  }
});

describe("recent searches", () => {
  test("keeps only the five most recent cities, newest first", async () => {
    const cities = ["amman", "berlin", "cairo", "dublin", "edinburgh", "florence", "geneva"];

    for (const city of cities) {
      await recordSearch(city);
    }

    const stored = await getRecentSearches();

    expect(stored).toHaveLength(5);
    expect(stored).toEqual(["geneva", "florence", "edinburgh", "dublin", "cairo"]);
  });

  test("moves a repeated city back to the front instead of duplicating it", async () => {
    await recordSearch("xanthi");
    await recordSearch("yerevan");
    await recordSearch("xanthi");

    const stored = await getRecentSearches();

    expect(stored[0]).toBe("xanthi");
    expect(stored.filter((city) => city === "xanthi")).toHaveLength(1);
    expect(stored).toHaveLength(5);
  });

  test("normalizes before storing so casing and padding do not duplicate", async () => {
    await recordSearch("  ReykjavIk  ");
    await recordSearch("reykjavik");

    const stored = await getRecentSearches();

    expect(stored[0]).toBe("reykjavik");
    expect(stored.filter((city) => city === "reykjavik")).toHaveLength(1);
  });

  test("ignores a blank city", async () => {
    const before = await getRecentSearches();

    await recordSearch("   ");

    expect(await getRecentSearches()).toEqual(before);
  });
});
