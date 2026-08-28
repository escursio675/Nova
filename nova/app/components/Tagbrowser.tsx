"use client";

import { Tag as TagIcon, FileText, ArrowLeft } from "lucide-react";
import type { Note } from "@/lib/notes";

interface TagBrowserProps {
  notes: Note[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  onSelectNote: (id: string) => void;
}

interface TagCount {
  label: string;
  count: number;
}

function getAllTags(notes: Note[]): TagCount[] {
  const counts = new Map<string, number>();
  for (const note of notes) {
    for (const tag of note.tags) {
      counts.set(tag.label, (counts.get(tag.label) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export default function TagBrowser({
  notes,
  selectedTag,
  onSelectTag,
  onSelectNote,
}: TagBrowserProps) {
  const allTags = getAllTags(notes);
  const filteredNotes = selectedTag
    ? notes.filter((n) => n.tags.some((t) => t.label === selectedTag))
    : [];

  return (
    <div className="flex w-full flex-1 justify-center overflow-y-auto py-8 sm:py-10">
      <div className="w-full max-w-[800px] px-4 sm:px-6">
        {selectedTag ? (
          <>
            <button
              type="button"
              onClick={() => onSelectTag(null)}
              className="mb-6 flex items-center gap-2 font-ui text-sm text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <ArrowLeft size={16} />
              All tags
            </button>

            <h1 className="mb-6 flex items-center gap-2 font-serif text-3xl font-bold text-slate-900 dark:text-white">
              <TagIcon size={24} className="text-slate-400" />
              {selectedTag}
            </h1>

            <div className="flex flex-col divide-y divide-slate-300 border-t border-b border-slate-300 dark:divide-slate-700 dark:border-slate-700">
              {filteredNotes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => onSelectNote(note.id)}
                  className="flex items-center gap-3 py-3 text-left transition-colors hover:bg-slate-200/40 dark:hover:bg-slate-800/40"
                >
                  <FileText size={16} className="shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-ui text-sm font-medium text-slate-800 dark:text-slate-200">
                      {note.title}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {note.tags.map((t) => (
                        <span
                          key={t.label}
                          className="font-mono text-xs text-slate-400 dark:text-slate-500"
                        >
                          {t.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h1 className="mb-6 font-serif text-3xl font-bold text-slate-900 dark:text-white">
              Tags
            </h1>

            {allTags.length === 0 ? (
              <p className="font-ui text-sm text-slate-400">
                No tags yet. Add tags to your notes to see them here.
              </p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {allTags.map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => onSelectTag(tag.label)}
                    className="flex items-center gap-2 border border-slate-300 bg-beige-200 px-3 py-2 font-mono text-sm text-slate-700 transition-colors hover:bg-slate-300/60 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-600/60"
                  >
                    {tag.label}
                    <span className="rounded-full bg-slate-300/60 px-1.5 text-xs text-slate-600 dark:bg-slate-600/60 dark:text-slate-300">
                      {tag.count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}