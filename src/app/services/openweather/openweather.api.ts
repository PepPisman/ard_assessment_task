import { CACHE_TTL_MS, getCached, normalizeCityKey, setCached } from "@/app/helpers/cache.helper";
import type { CurrentWeather, ForecastDay, WeatherResponse } from "@/app/models/weather.models";
import type {
  OwmCurrentWeatherResponse,
  OwmForecastListItem,
  OwmForecastResponse,
  OwmWeatherCondition,
} from "@/app/services/openweather/models/openweather-response.models";

const OWM_BASE_URL = "https://api.openweathermap.org/data/2.5";
const REQUEST_TIMEOUT_MS = 8000;
const FORECAST_DAY_LIMIT = 5;

export class WeatherApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "WeatherApiError";
    this.status = status;
    this.code = code;
  }
}

function serviceUnavailable(): WeatherApiError {
  return new WeatherApiError(
    503,
    "upstream_unavailable",
    "Weather service is temporarily unavailable. Please try again.",
  );
}

function mapUpstreamStatus(status: number): WeatherApiError {
  if (status === 404) {
    return new WeatherApiError(404, "city_not_found", "We could not find that city.");
  }

  if (status === 429) {
    return new WeatherApiError(429, "rate_limited", "Too many requests. Please try again shortly.");
  }

  if (status === 401) {
    return new WeatherApiError(500, "configuration_error", "Weather service is unavailable.");
  }

  return serviceUnavailable();
}

function requireApiKey(): string {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw new WeatherApiError(500, "configuration_error", "Weather service is unavailable.");
  }

  return apiKey;
}

async function fetchOwm<T>(
  endpoint: string,
  city: string,
  apiKey: string,
  signal: AbortSignal,
): Promise<T> {
  const url = `${OWM_BASE_URL}/${endpoint}?q=${encodeURIComponent(city)}&appid=${encodeURIComponent(apiKey)}&units=metric`;

  let response: Response;

  try {
    response = await fetch(url, { signal });
  } catch {
    throw serviceUnavailable();
  }

  if (!response.ok) {
    throw mapUpstreamStatus(response.status);
  }

  return (await response.json()) as T;
}

function primaryCondition(conditions: OwmWeatherCondition[]): { description: string; icon: string } {
  const first = conditions[0];

  return first
    ? { description: first.description, icon: first.icon }
    : { description: "", icon: "" };
}

function roundTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

function toCurrentWeather(raw: OwmCurrentWeatherResponse): CurrentWeather {
  const condition = primaryCondition(raw.weather);

  return {
    city: raw.name,
    country: raw.sys.country,
    temperature: Math.round(raw.main.temp),
    feelsLike: Math.round(raw.main.feels_like),
    humidity: raw.main.humidity,
    windSpeed: roundTenth(raw.wind.speed),
    description: condition.description,
    icon: condition.icon,
    observedAt: new Date(raw.dt * 1000).toISOString(),
  };
}

function pickMiddayItem(items: OwmForecastListItem[]): OwmForecastListItem {
  let best = items[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const item of items) {
    const distance = Math.abs(Number(item.dt_txt.slice(11, 13)) - 12);

    if (distance < bestDistance) {
      best = item;
      bestDistance = distance;
    }
  }

  return best;
}

function toForecastDays(list: OwmForecastListItem[]): ForecastDay[] {
  const byDate = new Map<string, OwmForecastListItem[]>();

  for (const item of list) {
    const date = item.dt_txt.slice(0, 10);
    const bucket = byDate.get(date);

    if (bucket) {
      bucket.push(item);
    } else {
      byDate.set(date, [item]);
    }
  }

  const buckets = [...byDate.entries()];
  const firstFullDay = buckets.length > FORECAST_DAY_LIMIT ? 1 : 0;

  return buckets
    .slice(firstFullDay, firstFullDay + FORECAST_DAY_LIMIT)
    .map(([date, items]) => {
      const representative = pickMiddayItem(items);
      const condition = primaryCondition(representative.weather);

      return {
        date,
        minTemperature: Math.round(Math.min(...items.map((item) => item.main.temp_min))),
        maxTemperature: Math.round(Math.max(...items.map((item) => item.main.temp_max))),
        humidity: representative.main.humidity,
        windSpeed: roundTenth(representative.wind.speed),
        description: condition.description,
        icon: condition.icon,
      };
    });
}

export async function getWeather(city: string): Promise<WeatherResponse> {
  const cityKey = normalizeCityKey(city);

  if (!cityKey) {
    throw new WeatherApiError(400, "invalid_city", "Please enter a city name.");
  }

  const cached = getCached<WeatherResponse>(cityKey);

  if (cached) {
    return { ...cached, cached: true };
  }

  const apiKey = requireApiKey();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const [current, forecast] = await Promise.all([
      fetchOwm<OwmCurrentWeatherResponse>("weather", cityKey, apiKey, controller.signal),
      fetchOwm<OwmForecastResponse>("forecast", cityKey, apiKey, controller.signal),
    ]);

    const payload: WeatherResponse = {
      current: toCurrentWeather(current),
      forecast: toForecastDays(forecast.list),
      cached: false,
    };

    setCached(cityKey, payload, CACHE_TTL_MS);

    return payload;
  } finally {
    clearTimeout(timeout);
  }
}
