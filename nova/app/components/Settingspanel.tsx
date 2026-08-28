"use client";

import { useEffect, useState } from "react";
import { X, Sun, Moon, Monitor } from "lucide-react";
import { getStoredChoice, setThemeChoice, type ThemeChoice } from "@/lib/theme";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const themeOptions: { value: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const [choice, setChoice] = useState<ThemeChoice>("system");

  // Sync with whatever's actually stored whenever the panel opens.
  useEffect(() => {
    if (open) setChoice(getStoredChoice());
  }, [open]);

  const handleSelect = (value: ThemeChoice) => {
    setChoice(value);
    setThemeChoice(value);
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
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                      ? "border-slate-700 bg-slate-300/30 text-slate-800 dark:border-slate-300 dark:bg-slate-700/40 dark:text-slate-100"
                      : "border-slate-300 text-slate-500 hover:bg-slate-200/50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700/40"
                  }`}
                >
                  <opt.icon size={18} />
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Room for future sections — Editor, Account, Sync, etc. */}
        </div>
      </div>
    </div>
  );
}