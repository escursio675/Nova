"use client";

import { useState, type ReactNode } from "react";
import { Menu, Search, Settings, RefreshCw, UserCircle } from "lucide-react";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ui/ThemeToggle";
import type { Note } from "@/lib/notes";
import type { View } from "@/lib/view";

interface AppShellProps {
  /** Breadcrumb-style path shown in the header, e.g. "/ Folders / Systems / ..." */
  path?: string;
  onNewNote?: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  view: View;
  onChangeView: (view: View) => void;
  children: ReactNode;
}

/**
 * Shared layout: sidebar + top header. Drop either <NoteView />,
 * <EmptyState />, or <TagBrowser /> into `children`.
 */
export default function AppShell({
  path,
  onNewNote,
  onOpenSearch,
  onOpenSettings,
  notes,
  selectedNoteId,
  onSelectNote,
  view,
  onChangeView,
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-beige-100 text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-50">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewNote={onNewNote}
        notes={notes}
        selectedNoteId={selectedNoteId}
        onSelectNote={onSelectNote}
        view={view}
        onChangeView={onChangeView}
      />

      <main className="flex h-full flex-1 flex-col bg-beige-100 dark:bg-slate-900">
        <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-slate-300 bg-beige-100 px-4 dark:border-slate-700 dark:bg-slate-900 md:px-6">
          <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
            <Menu
              size={20}
              className="cursor-pointer transition-colors hover:text-slate-900 dark:hover:text-white md:hidden"
              onClick={() => setSidebarOpen((v) => !v)}
            />
            {path && (
              <span className="hidden font-ui text-sm text-slate-500 dark:text-slate-400 sm:inline">
                {path}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
            <button
              type="button"
              onClick={onOpenSearch}
              className="flex items-center gap-2 border border-slate-300 px-2.5 py-1 font-ui text-xs text-slate-500 transition-colors hover:bg-slate-200/60 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700/60"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden rounded-none border border-slate-300 px-1 font-mono text-[10px] dark:border-slate-600 sm:inline">
                ⌘K
              </kbd>
            </button>
            <Settings
              size={20}
              className="cursor-pointer transition-colors hover:text-slate-900 dark:hover:text-white"
              onClick={onOpenSettings}
            />
            <RefreshCw
              size={20}
              className="cursor-pointer transition-colors hover:text-slate-900 dark:hover:text-white"
            />
            <UserCircle
              size={20}
              className="cursor-pointer transition-colors hover:text-slate-900 dark:hover:text-white"
            />
            <ThemeToggle />
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}