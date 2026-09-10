import { describe, expect, test } from "bun:test";
import {
  formatCityLabel,
  formatDateLabel,
  formatDayLabel,
  formatObservedAt,
  weatherIconUrl,
} from "@/app/helpers/format.helper";

describe("formatCityLabel", () => {
  test("capitalizes a single word", () => {
    expect(formatCityLabel("london")).toBe("London");
  });

  test("capitalizes every space-separated word", () => {
    expect(formatCityLabel("new york")).toBe("New York");
  });

  test("capitalizes across hyphens rather than only the first word", () => {
    expect(formatCityLabel("stoke-on-trent")).toBe("Stoke-On-Trent");
  });

  test("preserves the original separators", () => {
    expect(formatCityLabel("san jose-del cabo")).toBe("San Jose-Del Cabo");
  });

  test("returns an empty string unchanged", () => {
    expect(formatCityLabel("")).toBe("");
  });
});

describe("weatherIconUrl", () => {
  test("builds the OpenWeatherMap icon url at 2x", () => {
    expect(weatherIconUrl("04n")).toBe("https://openweathermap.org/img/wn/04n@2x.png");
  });
});

describe("date formatting", () => {
  test("day and date labels produce something readable for a valid date", () => {
    expect(formatDayLabel("2026-09-10").length).toBeGreaterThan(0);
    expect(formatDateLabel("2026-09-10").length).toBeGreaterThan(0);
  });

  test("day and date labels fall back to the raw input when unparseable", () => {
    expect(formatDayLabel("not-a-date")).toBe("not-a-date");
    expect(formatDateLabel("not-a-date")).toBe("not-a-date");
  });

  test("observed timestamp returns an empty string when unparseable", () => {
    expect(formatObservedAt("not-a-timestamp")).toBe("");
  });

  test("observed timestamp renders a valid ISO input", () => {
    expect(formatObservedAt("2026-09-09T20:28:42.000Z").length).toBeGreaterThan(0);
  });
});
