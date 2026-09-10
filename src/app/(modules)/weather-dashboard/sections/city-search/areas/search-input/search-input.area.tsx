"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  recentSearchesLoaded,
  searchFailed,
  searchStarted,
  searchSucceeded,
} from "@/app/(modules)/weather-dashboard/state-management/weather-search/weather-search.actions";
import {
  useWeatherSearchDispatch,
  useWeatherSearchState,
} from "@/app/(modules)/weather-dashboard/state-management/weather-search/weather-search.context";
import { SuggestionList } from "@/app/(modules)/weather-dashboard/sections/city-search/areas/search-input/components/suggestion-list/suggestion-list.component";
import { formatCityLabel } from "@/app/helpers/format.helper";
import { fetchRecentSearches, fetchWeather } from "@/app/services/weather/weather.api";
import { BaseButton } from "@/theme/components/base-button/base-button";
import { BaseCard } from "@/theme/components/base-card/base-card";
import { BaseIcon } from "@/theme/components/base-icon/base-icon";
import { BaseInput } from "@/theme/components/base-input/base-input";

const LISTBOX_ID = "city-suggestions";

function buildOptionId(index: number): string {
  return `${LISTBOX_ID}-option-${index}`;
}

export function SearchInputArea() {
  const { status, recentSearches } = useWeatherSearchState();
  const dispatch = useWeatherSearchDispatch();
  const [query, setQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let active = true;

    fetchRecentSearches().then((searches) => {
      if (active) {
        dispatch(recentSearchesLoaded(searches));
      }
    });

    return () => {
      active = false;
    };
  }, [dispatch]);

  const isLoading = status === "loading";
  const normalizedQuery = query.trim().toLowerCase();
  const suggestions = recentSearches.filter((city) =>
    normalizedQuery ? city.includes(normalizedQuery) : true,
  );
  const isListOpen = suggestionsOpen && suggestions.length > 0;

  async function runSearch(city: string): Promise<void> {
    const trimmed = city.trim();

    if (!trimmed) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setSuggestionsOpen(false);
    setActiveIndex(-1);
    dispatch(searchStarted(trimmed));

    try {
      const weather = await fetchWeather(trimmed);

      if (requestIdRef.current !== requestId) {
        return;
      }

      dispatch(searchSucceeded(weather));

      const searches = await fetchRecentSearches();

      if (requestIdRef.current !== requestId) {
        return;
      }

      dispatch(recentSearchesLoaded(searches));
    } catch (error) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      dispatch(searchFailed(error instanceof Error ? error.message : "Something went wrong."));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (isListOpen && activeIndex >= 0) {
      void runSearch(suggestions[activeIndex]);
      setQuery(suggestions[activeIndex]);
      return;
    }

    void runSearch(query);
  }

  function handleSuggestionSelect(city: string): void {
    setQuery(city);
    void runSearch(city);
  }

  function handleChipSelect(city: string): void {
    setQuery(city);
    void runSearch(city);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Escape") {
      setSuggestionsOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === "ArrowDown" && !isListOpen) {
      setSuggestionsOpen(true);
      return;
    }

    if (!isListOpen) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex(activeIndex + 1 >= suggestions.length ? 0 : activeIndex + 1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(activeIndex <= 0 ? suggestions.length - 1 : activeIndex - 1);
    }
  }

  return (
    <BaseCard className="flex flex-col gap-3.5">
      <form onSubmit={handleSubmit} className="relative flex w-full flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="city" className="sr-only">
            City name
          </label>
          <span className="pointer-events-none absolute left-3.5 top-1/2 flex -translate-y-1/2 text-muted">
            <BaseIcon name="search" />
          </span>
          <BaseInput
            id="city"
            name="city"
            className="pl-11"
            value={query}
            role="combobox"
            autoComplete="off"
            placeholder="Search a city, e.g. London"
            aria-autocomplete="list"
            aria-expanded={isListOpen}
            aria-controls={isListOpen ? LISTBOX_ID : undefined}
            aria-activedescendant={
              isListOpen && activeIndex >= 0 ? buildOptionId(activeIndex) : undefined
            }
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(-1);
            }}
            onFocus={() => setSuggestionsOpen(true)}
            onBlur={() => setSuggestionsOpen(false)}
            onKeyDown={handleKeyDown}
          />
          {isListOpen ? (
            <SuggestionList
              listboxId={LISTBOX_ID}
              suggestions={suggestions}
              activeIndex={activeIndex}
              buildOptionId={buildOptionId}
              onSelect={handleSuggestionSelect}
              onHighlight={setActiveIndex}
            />
          ) : null}
        </div>

        <BaseButton
          type="submit"
          className="px-7"
          disabled={isLoading || query.trim().length === 0}
        >
          {isLoading ? "Searching…" : "Search"}
        </BaseButton>
      </form>

      {recentSearches.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-eyebrow mr-1">Recent</span>
          {recentSearches.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => handleChipSelect(city)}
              className="rounded-full border border-chip-edge bg-chip px-3 py-1.5 text-[0.8125rem] text-heading transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {formatCityLabel(city)}
            </button>
          ))}
        </div>
      ) : null}
    </BaseCard>
  );
}
