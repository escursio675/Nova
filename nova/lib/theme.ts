export type ThemeChoice = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

export function getStoredChoice(): ThemeChoice {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

export function getSystemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

/** Resolves a choice ("system" included) down to an actual light/dark value. */
export function resolveTheme(choice: ThemeChoice): "light" | "dark" {
  if (choice === "system") {
    return getSystemPrefersDark() ? "dark" : "light";
  }
  return choice;
}

/** Applies the resolved theme to <html> and persists the choice. */
export function setThemeChoice(choice: ThemeChoice) {
  localStorage.setItem(STORAGE_KEY, choice);
  const resolved = resolveTheme(choice);
  document.documentElement.classList.toggle("dark", resolved === "dark");
}