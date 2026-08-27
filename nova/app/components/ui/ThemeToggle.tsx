"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export default function ThemeToggle() {
  // Start undefined so we don't render the wrong icon before mount.
  const [theme, setTheme] = useState<Theme | undefined>(undefined);

  useEffect(() => {
    // On mount, read whatever the blocking script already applied to <html>.
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex h-8 w-8 items-center justify-center rounded-full
      text-slate-600 transition-colors hover:bg-slate-200/60 hover:text-slate-900
      dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-white"
    >
      {/* Render nothing until mounted to avoid a hydration mismatch. */}
      {theme === undefined ? null : theme === "dark" ? (
        <Sun size={18} />
      ) : (
        <Moon size={18} />
      )}
    </button>
  );
}