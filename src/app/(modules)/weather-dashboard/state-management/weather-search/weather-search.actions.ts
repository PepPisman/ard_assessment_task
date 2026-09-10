import type { WeatherResponse } from "@/app/models/weather.models";
import type { WeatherSearchAction } from "@/app/(modules)/weather-dashboard/state-management/weather-search/weather-search.models";

export function searchStarted(city: string): WeatherSearchAction {
  return { type: "search-started", city };
}

export function searchSucceeded(weather: WeatherResponse): WeatherSearchAction {
  return { type: "search-succeeded", weather };
}

export function searchFailed(message: string): WeatherSearchAction {
  return { type: "search-failed", message };
}

export function recentSearchesLoaded(searches: string[]): WeatherSearchAction {
  return { type: "recent-searches-loaded", searches };
}
