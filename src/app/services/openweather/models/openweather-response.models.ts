export interface OwmWeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface OwmMainBlock {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  sea_level?: number;
  grnd_level?: number;
}

export interface OwmWindBlock {
  speed: number;
  deg: number;
  gust?: number;
}

export interface OwmCloudsBlock {
  all: number;
}

export interface OwmCurrentSysBlock {
  type?: number;
  id?: number;
  country: string;
  sunrise: number;
  sunset: number;
}

export interface OwmCoord {
  lon: number;
  lat: number;
}

export interface OwmCurrentWeatherResponse {
  coord: OwmCoord;
  weather: OwmWeatherCondition[];
  base: string;
  main: OwmMainBlock;
  visibility: number;
  wind: OwmWindBlock;
  clouds: OwmCloudsBlock;
  dt: number;
  sys: OwmCurrentSysBlock;
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface OwmForecastItemSysBlock {
  pod: string;
}

export interface OwmForecastListItem {
  dt: number;
  main: OwmMainBlock;
  weather: OwmWeatherCondition[];
  clouds: OwmCloudsBlock;
  wind: OwmWindBlock;
  visibility: number;
  pop: number;
  sys: OwmForecastItemSysBlock;
  dt_txt: string;
}

export interface OwmForecastCityBlock {
  id: number;
  name: string;
  coord: OwmCoord;
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}

export interface OwmForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: OwmForecastListItem[];
  city: OwmForecastCityBlock;
}
