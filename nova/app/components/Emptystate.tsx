"use client";

import { FileText, Plus } from "lucide-react";

interface EmptyStateProps {
  onNewNote?: () => void;
}

export default function EmptyState({ onNewNote }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200/60 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <FileText size={28} />
      </div>

      <div className="space-y-1">
        <h2 className="font-serif text-xl font-semibold text-slate-800 dark:text-slate-200">
          No note selected
        </h2>
        <p className="max-w-xs font-ui text-sm text-slate-500 dark:text-slate-400">
          Pick a note from the sidebar, or create a new one to start writing.
        </p>
      </div>

      <button
        type="button"
        onClick={onNewNote}
        className="mt-2 flex items-center gap-2 border border-slate-300 bg-beige-200 px-4 py-2 font-ui text-sm font-medium text-slate-800 transition-colors hover:bg-slate-300/60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
      >
        <Plus size={16} />
        New Note
      </button>
    </div>
  );
}