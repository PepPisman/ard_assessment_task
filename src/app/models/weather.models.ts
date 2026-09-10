export interface CurrentWeather {
  city: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  observedAt: string;
}

export interface ForecastDay {
  date: string;
  minTemperature: number;
  maxTemperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
}

export interface WeatherResponse {
  current: CurrentWeather;
  forecast: ForecastDay[];
  cached: boolean;
}
