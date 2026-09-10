import { formatCityLabel } from "@/app/helpers/format.helper";
import { BaseIcon } from "@/theme/components/base-icon/base-icon";

interface SuggestionListProps {
  listboxId: string;
  suggestions: string[];
  activeIndex: number;
  buildOptionId: (index: number) => string;
  onSelect: (city: string) => void;
  onHighlight: (index: number) => void;
}

export function SuggestionList({
  listboxId,
  suggestions,
  activeIndex,
  buildOptionId,
  onSelect,
  onHighlight,
}: SuggestionListProps) {
  return (
    <ul
      id={listboxId}
      role="listbox"
      aria-label="Recent searches"
      className="glass-surface absolute z-20 mt-2 w-full overflow-hidden rounded-card border border-subtle"
    >
      {suggestions.map((city, index) => (
        <li
          key={city}
          id={buildOptionId(index)}
          role="option"
          aria-selected={index === activeIndex}
          onMouseDown={(event) => {
            event.preventDefault();
            onSelect(city);
          }}
          onMouseEnter={() => onHighlight(index)}
          className={`flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-heading transition-colors ${
            index === activeIndex ? "bg-chip" : ""
          }`}
        >
          <span className="flex text-muted">
            <BaseIcon name="clock" size={16} />
          </span>
          {formatCityLabel(city)}
        </li>
      ))}
    </ul>
  );
}
