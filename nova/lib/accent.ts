export const DEFAULT_ACCENT = "#f5c2e7";

const STORAGE_KEY = "accentColor";

export function getStoredAccent(): string {
  if (typeof window === "undefined") return DEFAULT_ACCENT;
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_ACCENT;
}

/** Applies a hex color to the --color-accent CSS variable and persists it. */
export function setAccentColor(hex: string) {
  localStorage.setItem(STORAGE_KEY, hex);
  document.documentElement.style.setProperty("--color-accent", hex);
}

/** Re-applies whatever accent is already stored — used on mount, since the
 * blocking init script in layout.tsx only prevents flash, it doesn't run
 * through this module. */
export function applyStoredAccent() {
  document.documentElement.style.setProperty("--color-accent", getStoredAccent());
}