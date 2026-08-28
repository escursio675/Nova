"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface Shortcut {
  keys: string[];
  description: string;
}

// Add new shortcuts here as they're built — this list is the single
// source of truth for what shows up in the modal.
const shortcuts: Shortcut[] = [
  { keys: ["⌘ / Ctrl", "K"], description: "Open search" },
  { keys: ["⌘ / Ctrl", "O"], description: "Go back to the previous note" },
  { keys: ["Esc"], description: "Close the open modal" },
];

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
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
            Keyboard Shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col divide-y divide-slate-300/60 px-5 dark:divide-slate-700/60">
          {shortcuts.map((s) => (
            <div
              key={s.description}
              className="flex items-center justify-between py-3"
            >
              <span className="font-ui text-sm text-slate-600 dark:text-slate-400">
                {s.description}
              </span>
              <div className="flex items-center gap-1">
                {s.keys.map((key) => (
                  <kbd
                    key={key}
                    className="rounded-none border border-slate-300 bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-3" />
      </div>
    </div>
  );
}