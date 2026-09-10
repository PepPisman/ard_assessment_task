"use client";

import { useSyncExternalStore } from "react";
import { BaseButton } from "@/theme/components/base-button/base-button";
import { BaseIcon } from "@/theme/components/base-icon/base-icon";

function subscribeToThemeClass(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => observer.disconnect();
}

function readThemeClass(): boolean {
  return document.documentElement.classList.contains("dark");
}

function readServerThemeClass(): boolean {
  return false;
}

export function ThemeToggleArea() {
  const isDark = useSyncExternalStore(subscribeToThemeClass, readThemeClass, readServerThemeClass);

  function toggleTheme(): void {
    const next = !isDark;

    document.documentElement.classList.toggle("dark", next);

    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      return;
    }
  }

  return (
    <BaseButton
      variant="ghost"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <BaseIcon name={isDark ? "sun" : "moon"} size={18} />
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
    </BaseButton>
  );
}
