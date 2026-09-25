"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Cn } from "@/lib/utils";

const THEME_STORAGE_KEY = "spotified-theme";

type ThemeMode = "light" | "dark";

function subscribeToTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => {
    observer.disconnect();
  };
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {}
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const isDark = useSyncExternalStore(
    subscribeToTheme,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
  const mode: ThemeMode = isDark ? "dark" : "light";

  if (compact) {
    const nextMode: ThemeMode = isDark ? "light" : "dark";
    return (
      <button
        type="button"
        aria-label={`Switch to ${nextMode} proof`}
        suppressHydrationWarning
        onClick={() => {
          applyTheme(nextMode);
        }}
        className="inline-flex size-10 items-center justify-center border border-transparent text-muted-foreground transition hover:border-foreground hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring"
      >
        <Sun className="size-4 dark:hidden" aria-hidden="true" />
        <Moon className="hidden size-4 dark:block" aria-hidden="true" />
      </button>
    );
  }

  const cellClass =
    "press-label flex h-12 items-center justify-center gap-2 transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-inset";

  return (
    <div
      role="group"
      aria-label="Proof mode"
      className="grid grid-cols-2 border-b border-foreground"
    >
      <button
        type="button"
        aria-pressed={mode === "light"}
        suppressHydrationWarning
        onClick={() => {
          applyTheme("light");
        }}
        className={Cn(
          cellClass,
          "border-r border-foreground bg-foreground text-background dark:bg-transparent dark:text-muted-foreground dark:hover:bg-accent dark:hover:text-foreground",
        )}
      >
        <Sun className="size-3.5" aria-hidden="true" />
        Light
      </button>
      <button
        type="button"
        aria-pressed={mode === "dark"}
        suppressHydrationWarning
        onClick={() => {
          applyTheme("dark");
        }}
        className={Cn(
          cellClass,
          "text-muted-foreground hover:bg-accent hover:text-foreground dark:bg-foreground dark:text-background",
        )}
      >
        <Moon className="size-3.5" aria-hidden="true" />
        Dark
      </button>
    </div>
  );
}
