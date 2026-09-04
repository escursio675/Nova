export type NoteFont = "serif" | "sans" | "mono";

export const DEFAULT_NOTE_FONT: NoteFont = "serif";

const STORAGE_KEY = "noteFont";

// These map onto the font variables already loaded via next/font/google in
// layout.tsx — no new fonts to load, just pointing --font-note at a
// different existing one.
const FONT_VAR_MAP: Record<NoteFont, string> = {
  serif: "var(--font-serif)", // Ibarra Real Nova — the current default
  sans: "var(--font-ui)", // Inter
  mono: "var(--font-mono)", // JetBrains Mono
};

export function getStoredNoteFont(): NoteFont {
  if (typeof window === "undefined") return DEFAULT_NOTE_FONT;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "serif" || stored === "sans" || stored === "mono") return stored;
  return DEFAULT_NOTE_FONT;
}

export function setNoteFont(font: NoteFont) {
  localStorage.setItem(STORAGE_KEY, font);
  document.documentElement.style.setProperty("--font-note", FONT_VAR_MAP[font]);
}

/** Re-applies whatever font is already stored — used on mount, since the
 * blocking init script in layout.tsx only prevents flash, it doesn't run
 * through this module. */
export function applyStoredNoteFont() {
  const font = getStoredNoteFont();
  document.documentElement.style.setProperty("--font-note", FONT_VAR_MAP[font]);
}