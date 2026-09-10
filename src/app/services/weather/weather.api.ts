import type { ApiErrorBody, GeoResponse, RecentSearchesResponse } from "@/app/models/api.models";
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

export async function fetchWeather(city: string, record = true): Promise<WeatherResponse> {
  let response: Response;
  const recordParam = record ? "" : "&record=false";

  try {
    response = await fetch(`/api/weather?city=${encodeURIComponent(city)}${recordParam}`);
  } catch {
    throw new Error("Could not reach the server. Check your connection and try again.");
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return (await response.json()) as WeatherResponse;
}

export async function fetchDetectedCity(): Promise<string | null> {
  try {
    const response = await fetch("/api/geo");

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as GeoResponse;

    return body.city;
  } catch {
    return null;
  }
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
