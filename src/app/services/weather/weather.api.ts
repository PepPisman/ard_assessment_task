import type { ApiErrorBody, RecentSearchesResponse } from "@/app/models/api.models";
import type { WeatherResponse } from "@/app/models/weather.models";

const GENERIC_FAILURE = "Something went wrong. Please try again.";

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;

    return body.error || GENERIC_FAILURE;
  } catch {
    return GENERIC_FAILURE;
  }
}

export async function fetchWeather(city: string): Promise<WeatherResponse> {
  let response: Response;

  try {
    response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
  } catch {
    throw new Error("Could not reach the server. Check your connection and try again.");
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as WeatherResponse;
}

export async function fetchRecentSearches(): Promise<string[]> {
  try {
    const response = await fetch("/api/recent-searches");

    if (!response.ok) {
      return [];
    }

    const body = (await response.json()) as RecentSearchesResponse;

    return body.searches;
  } catch {
    return [];
  }
}
