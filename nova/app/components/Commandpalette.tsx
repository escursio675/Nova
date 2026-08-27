"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, FileText, X } from "lucide-react";
import type { Note } from "@/lib/notes";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  notes: Note[];
  onSelectNote: (id: string) => void;
}

export default function CommandPalette({
  open,
  onClose,
  notes,
  onSelectNote,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset query + focus input every time the palette opens.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      // Slight delay avoids fighting the modal's own mount animation/focus trap.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((note) => {
      const inTitle = note.title.toLowerCase().includes(q);
      const inTags = note.tags.some((t) =>
        t.label.toLowerCase().includes(q)
      );
      return inTitle || inTags;
    });
  }, [query, notes]);

  const selectAndClose = (id: string) => {
    onSelectNote(id);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const note = results[activeIndex];
      if (note) selectAndClose(note.id);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[15vh]">
      {/* Backdrop click closes */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg border border-slate-300 bg-beige-50 shadow-lg dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3 border-b border-slate-300 px-4 py-3 dark:border-slate-700">
          <Search size={18} className="shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search notes and tags..."
            className="w-full bg-transparent font-ui text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-200"
          />
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close search"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center font-ui text-sm text-slate-400">
              No notes match &ldquo;{query}&rdquo;
            </p>
          ) : (
            results.map((note, i) => (
              <button
                key={note.id}
                type="button"
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => selectAndClose(note.id)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-left transition-colors ${
                  i === activeIndex
                    ? "bg-slate-200/60 dark:bg-slate-700/60"
                    : "hover:bg-slate-200/40 dark:hover:bg-slate-700/40"
                }`}
              >
                <FileText size={16} className="shrink-0 text-slate-400" />
                <span className="flex-1 truncate font-ui text-sm text-slate-800 dark:text-slate-200">
                  {note.title}
                </span>
                <div className="flex shrink-0 gap-1">
                  {note.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag.label}
                      className="font-mono text-xs text-slate-400 dark:text-slate-500"
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-slate-300 px-4 py-2 font-ui text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
          <span>↑↓ Navigate</span>
          <span>↵ Open</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}