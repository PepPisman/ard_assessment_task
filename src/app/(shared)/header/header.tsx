import { HeaderMainSection } from "@/app/(shared)/header/sections/header-main/header-main.section";

export function Header() {
  return (
    <header className="sticky top-3 z-30 mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      <HeaderMainSection />
    </header>
  );
}
