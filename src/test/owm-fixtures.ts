import type {
  OwmCurrentWeatherResponse,
  OwmForecastListItem,
  OwmForecastResponse,
} from "@/app/services/openweather/models/openweather-response.models";

const originalFetch = globalThis.fetch;

export const currentFixture: OwmCurrentWeatherResponse = {
  coord: { lon: -0.1257, lat: 51.5085 },
  weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
  base: "stations",
  main: {
    temp: 20.4,
    feels_like: 19.8,
    temp_min: 18.2,
    temp_max: 22.6,
    pressure: 1012,
    humidity: 55,
  },
  visibility: 10000,
  wind: { speed: 3.647, deg: 250 },
  clouds: { all: 0 },
  dt: 1700000000,
  sys: { country: "GB", sunrise: 1699950000, sunset: 1699990000 },
  timezone: 0,
  id: 2643743,
  name: "London",
  cod: 200,
};

function forecastItem(dtTxt: string, temp: number): OwmForecastListItem {
  return {
    dt: Math.floor(Date.parse(`${dtTxt.replace(" ", "T")}Z`) / 1000),
    main: {
      temp,
      feels_like: temp,
      temp_min: temp - 2,
      temp_max: temp + 2,
      pressure: 1012,
      humidity: 60,
    },
    weather: [{ id: 500, main: "Rain", description: "light rain", icon: "10d" }],
    clouds: { all: 40 },
    wind: { speed: 4.12, deg: 200 },
    visibility: 10000,
    pop: 0.2,
    sys: { pod: "d" },
    dt_txt: dtTxt,
  };
}

export const forecastFixture: OwmForecastResponse = {
  cod: "200",
  message: 0,
  cnt: 3,
  list: [
    forecastItem("2026-09-09 09:00:00", 18),
    forecastItem("2026-09-09 12:00:00", 22),
    forecastItem("2026-09-10 12:00:00", 25),
  ],
  city: {
    id: 2643743,
    name: "London",
    coord: { lon: -0.1257, lat: 51.5085 },
    country: "GB",
    population: 8908081,
    timezone: 0,
    sunrise: 1699950000,
    sunset: 1699990000,
  },
};

export function forecastFixtureFrom(
  entries: Array<{ dtTxt: string; temp: number }>,
): OwmForecastResponse {
  return {
    ...forecastFixture,
    cnt: entries.length,
    list: entries.map((entry) => forecastItem(entry.dtTxt, entry.temp)),
  };
}

export function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function installFetch(
  implementation: (input: RequestInfo | URL) => Promise<Response>,
): void {
  globalThis.fetch = implementation as unknown as typeof fetch;
}

export function stubFetch(handler: (url: string) => Response): void {
  installFetch((input) => Promise.resolve(handler(String(input))));
}

export function stubUpstreamStatus(status: number, body: unknown = { cod: status }): void {
  stubFetch(() => jsonResponse(body, status));
}

export function stubUpstreamSuccess(): () => number {
  let calls = 0;

  stubFetch((url) => {
    calls += 1;
    return jsonResponse(url.includes("/forecast") ? forecastFixture : currentFixture, 200);
  });

  return () => calls;
}

export function restoreFetch(): void {
  globalThis.fetch = originalFetch;
}
