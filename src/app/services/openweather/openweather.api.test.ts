import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { clearCache } from "@/app/helpers/cache.helper";
import { WeatherApiError, getWeather } from "@/app/services/openweather/openweather.api";
import {
  currentFixture,
  forecastFixtureFrom,
  installFetch,
  jsonResponse,
  restoreFetch,
  stubFetch,
  stubUpstreamStatus,
  stubUpstreamSuccess,
} from "@/test/owm-fixtures";

async function captureError(city: string): Promise<WeatherApiError> {
  try {
    await getWeather(city);
  } catch (error) {
    if (error instanceof WeatherApiError) {
      return error;
    }

    throw error;
  }

  throw new Error("expected getWeather to reject");
}

beforeEach(() => {
  clearCache();
  process.env.OPENWEATHER_API_KEY = "test-key";
});

afterEach(() => {
  restoreFetch();
});

describe("getWeather error mapping", () => {
  test("maps an unknown city to 404", async () => {
    stubUpstreamStatus(404, { cod: "404", message: "city not found" });

    const error = await captureError("atlantis");

    expect(error.status).toBe(404);
    expect(error.code).toBe("city_not_found");
  });

  test("maps an upstream rate limit to 429", async () => {
    stubUpstreamStatus(429);

    const error = await captureError("london");

    expect(error.status).toBe(429);
    expect(error.code).toBe("rate_limited");
  });

  test("maps a rejected api key to 500 without leaking key details", async () => {
    stubUpstreamStatus(401, { cod: 401, message: "Invalid API key" });

    const error = await captureError("london");

    expect(error.status).toBe(500);
    expect(error.code).toBe("configuration_error");
    expect(error.message).not.toContain("test-key");
    expect(error.message.toLowerCase()).not.toContain("api key");
  });

  test("maps a network failure to 503", async () => {
    installFetch(() => Promise.reject(new Error("socket hang up")));

    const error = await captureError("london");

    expect(error.status).toBe(503);
    expect(error.code).toBe("upstream_unavailable");
  });

  test("rejects an empty city before calling upstream", async () => {
    const callCount = stubUpstreamSuccess();

    const error = await captureError("   ");

    expect(error.status).toBe(400);
    expect(callCount()).toBe(0);
  });
});

describe("getWeather success path", () => {
  test("normalizes the raw payload into our own shape", async () => {
    stubUpstreamSuccess();

    const result = await getWeather("London");

    expect(result.cached).toBe(false);
    expect(result.current.city).toBe("London");
    expect(result.current.country).toBe("GB");
    expect(result.current.temperature).toBe(20);
    expect(result.current.windSpeed).toBe(3.6);
    expect(result.current.description).toBe("clear sky");
    expect(result.forecast).toHaveLength(2);
  });

  test("buckets three-hourly slots into days using the midday reading", async () => {
    stubUpstreamSuccess();

    const [firstDay] = (await getWeather("London")).forecast;

    expect(firstDay.date).toBe("2026-09-09");
    expect(firstDay.minTemperature).toBe(16);
    expect(firstDay.maxTemperature).toBe(24);
    expect(firstDay.description).toBe("light rain");
  });

  test("drops today's partial day so five whole days are returned", async () => {
    const sixBuckets = forecastFixtureFrom([
      { dtTxt: "2026-09-09 21:00:00", temp: 15 },
      { dtTxt: "2026-09-10 12:00:00", temp: 20 },
      { dtTxt: "2026-09-11 12:00:00", temp: 21 },
      { dtTxt: "2026-09-12 12:00:00", temp: 22 },
      { dtTxt: "2026-09-13 12:00:00", temp: 23 },
      { dtTxt: "2026-09-14 12:00:00", temp: 24 },
    ]);

    stubFetch((url) =>
      jsonResponse(url.includes("/forecast") ? sixBuckets : currentFixture, 200),
    );

    const { forecast } = await getWeather("London");

    expect(forecast).toHaveLength(5);
    expect(forecast[0].date).toBe("2026-09-10");
    expect(forecast[4].date).toBe("2026-09-14");
  });

  test("serves a repeat lookup from cache without refetching", async () => {
    const callCount = stubUpstreamSuccess();

    const first = await getWeather("London");
    const second = await getWeather("  london  ");

    expect(first.cached).toBe(false);
    expect(second.cached).toBe(true);
    expect(second.current.city).toBe("London");
    expect(callCount()).toBe(2);
  });
});
