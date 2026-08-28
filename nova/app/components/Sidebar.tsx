"use client";

import {
  FileText,
  Star,
  Folder,
  FileSymlink,
  Archive,
  Tag,
  Trash2,
  Plus,
} from "lucide-react";
import type { Note } from "@/lib/notes";
import type { View } from "@/lib/view";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onNewNote?: () => void;
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  view: View;
  onChangeView: (view: View) => void;
}

export default function Sidebar({
  open,
  onClose,
  onNewNote,
  notes,
  selectedNoteId,
  onSelectNote,
  view,
  onChangeView,
}: SidebarProps) {
  return (
    <>
      <aside
        className={`
          fixed left-0 top-0 z-40 flex h-full w-[260px] flex-col
          border-r border-slate-300 bg-beige-50 py-4
          dark:border-slate-700 dark:bg-slate-800
          transition-transform duration-200
          md:static md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="mb-6 px-4">
          <h1 className="font-serif text-xl font-semibold text-slate-800 dark:text-slate-300">
            Digital Garden
          </h1>
          <p className="mt-1 font-ui text-xs text-slate-500 dark:text-slate-400">
            Local Vault
          </p>
        </div>

        <button
          type="button"
          onClick={onNewNote}
          className="mx-4 mb-6 flex items-center justify-center gap-2 border border-slate-300 bg-beige-200 px-4 py-2 font-ui text-sm font-medium text-slate-800 transition-colors hover:bg-slate-300/60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
        >
          <Plus size={18} />
          New Note
        </button>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2">
          <button
            type="button"
            onClick={() => onChangeView("notes")}
            className={`flex items-center gap-3 px-3 py-2 text-left font-ui text-sm transition-colors ${
              view === "notes"
                ? "border-l-2 border-slate-700 bg-slate-300/20 font-bold text-slate-800 dark:border-slate-300 dark:bg-slate-700/30 dark:text-slate-200"
                : "text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/60"
            }`}
          >
            <FileText size={18} />
            <span>All Notes</span>
          </button>

          <div className="flex cursor-pointer items-center gap-3 px-3 py-2 font-ui text-sm text-slate-600 transition-colors hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/60">
            <Star size={18} />
            <span>Starred</span>
          </div>

          <div className="flex cursor-pointer items-center gap-3 px-3 py-2 font-ui text-sm text-slate-600 transition-colors hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/60">
            <Folder size={18} />
            <span>Folders</span>
          </div>

          {/* Note list — only shown while browsing notes, not while in the tag view */}
          {view === "notes" && (
            <div className="my-1 ml-8 flex flex-col gap-1">
              {notes.map((note) => {
                const isActive = note.id === selectedNoteId;
                return (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => {
                      onSelectNote(note.id);
                      onClose();
                    }}
                    className={`flex items-center gap-2 px-2 py-1 text-left text-sm transition-colors ${
                      isActive
                        ? "text-slate-800 dark:text-slate-200"
                        : "text-slate-500 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/60"
                    }`}
                  >
                    <FileSymlink size={14} className="shrink-0" />
                    <span className="truncate">{note.title}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex cursor-pointer items-center gap-3 px-3 py-2 font-ui text-sm text-slate-600 transition-colors hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/60">
            <Archive size={18} />
            <span>Archive</span>
          </div>
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-slate-300 px-2 pt-4 dark:border-slate-700">
          <button
            type="button"
            onClick={() => {
              onChangeView("tags");
              onClose();
            }}
            className={`flex items-center gap-3 px-3 py-2 text-left font-ui text-sm transition-colors ${
              view === "tags"
                ? "border-l-2 border-slate-700 bg-slate-300/20 font-bold text-slate-800 dark:border-slate-300 dark:bg-slate-700/30 dark:text-slate-200"
                : "text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/60"
            }`}
          >
            <Tag size={18} />
            <span>Tags</span>
          </button>

          <div className="flex cursor-pointer items-center gap-3 px-3 py-2 font-ui text-sm text-slate-600 transition-colors hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/60">
            <Trash2 size={18} />
            <span>Trash</span>
          </div>
        </div>
      </aside>

      {/* Mobile overlay — closes sidebar on outside click */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}