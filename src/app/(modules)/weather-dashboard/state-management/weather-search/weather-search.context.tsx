"use client";

import { createStateContext } from "@/state-management/context-creator";
import { initialWeatherSearchState } from "@/app/(modules)/weather-dashboard/state-management/weather-search/weather-search.models";
import { weatherSearchReducer } from "@/app/(modules)/weather-dashboard/state-management/weather-search/weather-search.reducer";

export const {
  Provider: WeatherSearchProvider,
  useStateContext: useWeatherSearchState,
  useDispatchContext: useWeatherSearchDispatch,
} = createStateContext(weatherSearchReducer, initialWeatherSearchState);
