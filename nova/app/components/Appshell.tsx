"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PanelLeft, Search, Settings, Keyboard, ArrowLeft } from "lucide-react";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ui/ThemeToggle";
import type { ParsedVault } from "@/lib/vault";
import type { View } from "@/lib/view";

interface AppShellProps {
  /** Breadcrumb-style path shown in the header, e.g. "/ VaultName / Folder / Note" */
  path?: string;
  vault: ParsedVault | null;
  onVaultLoaded: (vault: ParsedVault) => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  canGoBack: boolean;
  onGoBack: () => void;
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
  vault,
  onVaultLoaded,
  onOpenSearch,
  onOpenSettings,
  onOpenShortcuts,
  canGoBack,
  onGoBack,
  selectedNoteId,
  onSelectNote,
  view,
  onChangeView,
  children,
}: AppShellProps) {
  // Two independent states because the sidebar behaves differently per
  // breakpoint: on mobile it's a full overlay (default closed), on desktop
  // it pushes the content over (default open). One button toggles whichever
  // is relevant based on the viewport width at the moment it's clicked.
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  const toggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileOpen((v) => !v);
    } else {
      setDesktopOpen((v) => !v);
    }
  };

  // Ctrl/Cmd+B toggles the sidebar. This lives here rather than in page.tsx
  // since sidebar visibility state is local to AppShell.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault(); // Ctrl/Cmd+B opens the bookmarks sidebar in some browsers
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-beige-100 text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-50">
      <Sidebar
        mobileOpen={mobileOpen}
        desktopOpen={desktopOpen}
        onCloseMobile={() => setMobileOpen(false)}
        vault={vault}
        onVaultLoaded={onVaultLoaded}
        selectedNoteId={selectedNoteId}
        onSelectNote={onSelectNote}
        view={view}
        onChangeView={onChangeView}
      />

      <main
        className={`flex h-full flex-1 flex-col bg-beige-100 transition-[margin-left] duration-200 dark:bg-slate-900 ${
          desktopOpen ? "md:ml-[260px]" : "md:ml-0"
        }`}
      >
        <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-slate-300 bg-beige-100 px-4 dark:border-slate-700 dark:bg-slate-900 md:px-6">
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
              className="flex items-center justify-center rounded-full p-1 transition-colors hover:bg-slate-200/60 hover:text-slate-900 dark:hover:bg-slate-700/60 dark:hover:text-white"
            >
              <PanelLeft size={20} />
            </button>
            <button
              type="button"
              onClick={onGoBack}
              disabled={!canGoBack}
              aria-label="Go back"
              className="flex items-center justify-center rounded-full p-1 text-slate-500 transition-colors enabled:hover:bg-slate-200/60 enabled:hover:text-slate-900 disabled:opacity-30 dark:text-slate-400 dark:enabled:hover:bg-slate-700/60 dark:enabled:hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>
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
            <Keyboard
              size={20}
              className="cursor-pointer transition-colors hover:text-slate-900 dark:hover:text-white"
              onClick={onOpenShortcuts}
            />
            <ThemeToggle />
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}