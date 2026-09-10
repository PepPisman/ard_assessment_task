import { BaseIcon } from "@/theme/components/base-icon/base-icon";
import { BaseIconTile } from "@/theme/components/base-icon-tile/base-icon-tile";

export function LogoArea() {
  return (
    <div className="flex items-center gap-3">
      <BaseIconTile label="Weather dashboard">
        <BaseIcon name="cloud-sun" size={26} />
      </BaseIconTile>
      <span className="flex flex-col">
        <span className="text-base font-semibold text-heading">Weather Dashboard</span>
        <span className="hidden text-xs text-muted sm:block">
          Current conditions and a five-day forecast
        </span>
      </span>
    </div>
  );
}
