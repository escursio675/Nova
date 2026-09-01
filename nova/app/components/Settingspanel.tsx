"use client";

import { useEffect, useState } from "react";
import { X, Sun, Moon, Monitor } from "lucide-react";
import { getStoredChoice, setThemeChoice, type ThemeChoice } from "@/lib/theme";
import { getStoredAccent, setAccentColor, DEFAULT_ACCENT } from "@/lib/accent";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const themeOptions: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

// A small starting palette alongside the free-form picker — quick options
// without forcing the user into the native color dialog every time.
const ACCENT_PRESETS = [
  "#f5c2e7", // pink (default)
  "#94e2d5", // teal
  "#f9e2af", // yellow
  "#89b4fa", // blue
  "#a6e3a1", // green
  "#fab387", // orange
];

export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  const [accent, setAccent] = useState<string>(DEFAULT_ACCENT);

  // Sync with whatever's actually stored whenever the panel opens.
  useEffect(() => {
    if (open) {
      setChoice(getStoredChoice());
      setAccent(getStoredAccent());
    }
  }, [open]);

  const handleSelect = (value: ThemeChoice) => {
    setChoice(value);
    setThemeChoice(value);
  };

  const handleAccentChange = (hex: string) => {
    setAccent(hex);
    setAccentColor(hex);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md border border-slate-300 bg-beige-50 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between border-b border-slate-300 px-5 py-4 dark:border-slate-700">
          <h2 className="font-serif text-lg font-semibold text-slate-800 dark:text-slate-200">
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="text-slate-400 transition-colors hover:text-accent"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-5">
          <h3 className="mb-3 font-ui text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Appearance
          </h3>

          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((opt) => {
              const isActive = choice === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`flex flex-col items-center gap-2 border px-3 py-3 font-ui text-xs transition-colors ${
                    isActive
                      ? "border-accent bg-accent/15 text-slate-800 dark:text-slate-100"
                      : "border-slate-300 text-slate-500 hover:border-accent hover:text-accent dark:border-slate-600 dark:text-slate-400"
                  }`}
                >
                  <opt.icon size={18} />
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Room for future sections — Editor, Account, Sync, etc. */}

          <h3 className="mb-3 mt-6 font-ui text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Accent Color
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            {ACCENT_PRESETS.map((hex) => {
              const isActive = accent.toLowerCase() === hex.toLowerCase();
              return (
                <button
                  key={hex}
                  type="button"
                  onClick={() => handleAccentChange(hex)}
                  aria-label={`Use accent color ${hex}`}
                  style={{ backgroundColor: hex }}
                  className={`h-8 w-8 border-2 transition-transform ${
                    isActive
                      ? "scale-110 border-slate-700 dark:border-white"
                      : "border-transparent hover:scale-105"
                  }`}
                />
              );
            })}

            {/* Native color input — free-form choice beyond the presets */}
            <label className="relative flex h-8 w-8 cursor-pointer items-center justify-center border border-dashed border-slate-400 text-slate-400 transition-colors hover:border-accent hover:text-accent dark:border-slate-500">
              <span className="text-xs">+</span>
              <input
                type="color"
                value={accent}
                onChange={(e) => handleAccentChange(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="Pick a custom accent color"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}