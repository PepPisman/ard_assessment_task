import type { WeatherResponse } from "@/app/models/weather.models";

export type WeatherSearchStatus = "idle" | "loading" | "success" | "error";

export interface WeatherSearchState {
  status: WeatherSearchStatus;
  city: string;
  weather: WeatherResponse | null;
  errorMessage: string;
  recentSearches: string[];
}

export type WeatherSearchAction =
  | { type: "search-started"; city: string }
  | { type: "search-succeeded"; weather: WeatherResponse }
  | { type: "search-failed"; message: string }
  | { type: "recent-searches-loaded"; searches: string[] };

export const initialWeatherSearchState: WeatherSearchState = {
  status: "idle",
  city: "",
  weather: null,
  errorMessage: "",
  recentSearches: [],
};
