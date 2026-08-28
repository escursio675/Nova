"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { resolveTheme, setThemeChoice, type ThemeChoice } from "@/lib/theme";

export default function ThemeToggle() {
  // Undefined until mount, so we don't render the wrong icon before hydration.
  const [resolved, setResolved] = useState<"light" | "dark" | undefined>(
    undefined
  );

  useEffect(() => {
    // Read whatever the blocking script in layout.tsx already applied.
    const isDark = document.documentElement.classList.contains("dark");
    setResolved(isDark ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next: ThemeChoice = resolved === "dark" ? "light" : "dark";
    setThemeChoice(next); // explicit choice — overrides "system" if that was set
    setResolved(resolveTheme(next));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/60 dark:hover:text-white"
    >
      {resolved === undefined ? null : resolved === "dark" ? (
        <Sun size={18} />
      ) : (
        <Moon size={18} />
      )}
    </button>
  );
}