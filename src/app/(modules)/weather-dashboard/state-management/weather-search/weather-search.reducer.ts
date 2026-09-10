import type {
  WeatherSearchAction,
  WeatherSearchState,
} from "@/app/(modules)/weather-dashboard/state-management/weather-search/weather-search.models";

export function weatherSearchReducer(
  state: WeatherSearchState,
  action: WeatherSearchAction,
): WeatherSearchState {
  switch (action.type) {
    case "search-started":
      return { ...state, status: "loading", city: action.city, errorMessage: "" };

    case "search-succeeded":
      return { ...state, status: "success", weather: action.weather, errorMessage: "" };

    case "search-failed":
      return { ...state, status: "error", weather: null, errorMessage: action.message };

    case "recent-searches-loaded":
      return { ...state, recentSearches: action.searches };

    default:
      return state;
  }
}
