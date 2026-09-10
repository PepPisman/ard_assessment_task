import { SearchInputArea } from "@/app/(modules)/weather-dashboard/sections/city-search/areas/search-input/search-input.area";

export function CitySearchSection() {
  return (
    <section aria-labelledby="city-search-heading" className="w-full">
      <h2 id="city-search-heading" className="sr-only">
        Search for a city
      </h2>
      <SearchInputArea />
    </section>
  );
}
