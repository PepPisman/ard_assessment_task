import { LogoArea } from "@/app/(shared)/header/sections/header-main/areas/logo/logo.area";
import { ThemeToggleArea } from "@/app/(shared)/header/sections/header-main/areas/theme-toggle/theme-toggle.area";

export function HeaderMainSection() {
  return (
    <div className="glass-surface flex min-h-[4.6875rem] items-center justify-between gap-4 rounded-shell border border-subtle px-4 py-2">
      <LogoArea />
      <ThemeToggleArea />
    </div>
  );
}
