"use client";

import { Moon, Palette, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Cn } from "@/lib/utils";

const VISUAL_THEME_STORAGE_KEY = "spotified-visual-theme";
const THEME_MODE_STORAGE_KEY = "spotified-theme";

type VisualTheme = "classic" | "redesign";
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

function getVisualTheme(): VisualTheme {
  return document.documentElement.classList.contains("redesign") ? "redesign" : "classic";
}

function getStoredMode(): ThemeMode {
  try {
    const mode = localStorage.getItem(THEME_MODE_STORAGE_KEY);
    if (mode === "light" || mode === "dark") {
      return mode;
    }
  } catch {}
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyVisualTheme(theme: VisualTheme) {
  const root = document.documentElement;
  root.classList.toggle("classic", theme === "classic");
  root.classList.toggle("redesign", theme === "redesign");
  root.classList.toggle("dark", theme === "redesign" && getStoredMode() === "dark");
  try {
    localStorage.setItem(VISUAL_THEME_STORAGE_KEY, theme);
  } catch {}
}

function applyThemeMode(mode: ThemeMode) {
  document.documentElement.classList.toggle(
    "dark",
    getVisualTheme() === "redesign" && mode === "dark",
  );
  try {
    localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
  } catch {}
}

export function useVisualTheme() {
  return useSyncExternalStore(subscribeToTheme, getVisualTheme, () => "classic" as const);
}

export function VisualThemeSelector() {
  const theme = useVisualTheme();
  const optionClass =
    "flex min-h-24 flex-col items-start justify-between gap-4 rounded-xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring redesign:rounded-[2px] redesign:border-foreground";

  return (
    <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Visual theme">
      <button
        type="button"
        aria-pressed={theme === "classic"}
        onClick={() => {
          applyVisualTheme("classic");
        }}
        className={Cn(
          optionClass,
          theme === "classic"
            ? "border-primary bg-primary/10 text-foreground redesign:bg-primary redesign:text-primary-foreground"
            : "border-border bg-background/40 text-muted-foreground hover:bg-accent",
        )}
      >
        <Palette className="size-5" aria-hidden="true" />
        <span>
          <strong className="block text-sm font-semibold redesign:font-display redesign:uppercase redesign:tracking-[0.08em]">
            Classic
          </strong>
          <span className="mt-1 block text-xs leading-5 opacity-75">
            The original violet, softly layered interface.
          </span>
        </span>
      </button>
      <button
        type="button"
        aria-pressed={theme === "redesign"}
        onClick={() => {
          applyVisualTheme("redesign");
        }}
        className={Cn(
          optionClass,
          theme === "redesign"
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background/40 text-muted-foreground hover:bg-accent",
        )}
      >
        <span className="size-5 border border-current bg-[linear-gradient(135deg,currentColor_0_35%,transparent_35%_65%,currentColor_65%)]" />
        <span>
          <strong className="block text-sm font-semibold redesign:font-display redesign:uppercase redesign:tracking-[0.08em]">
            Record press
          </strong>
          <span className="mt-1 block text-xs leading-5 opacity-75">
            The new proof-sheet and safety-orange system.
          </span>
        </span>
      </button>
    </div>
  );
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
          applyThemeMode(nextMode);
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
    <div role="group" aria-label="Proof mode" className="grid grid-cols-2 border-foreground">
      <button
        type="button"
        aria-pressed={mode === "light"}
        suppressHydrationWarning
        onClick={() => {
          applyThemeMode("light");
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
          applyThemeMode("dark");
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

export function AppearanceSettings() {
  const theme = useVisualTheme();

  return (
    <div className="space-y-5">
      <VisualThemeSelector />
      {theme === "redesign" ? (
        <div className="overflow-hidden rounded-xl border border-border redesign:rounded-[2px] redesign:border-foreground">
          <p className="border-b border-border px-4 py-3 text-xs text-muted-foreground redesign:press-label redesign:border-foreground">
            Record press mode
          </p>
          <ThemeToggle />
        </div>
      ) : null}
    </div>
  );
}
