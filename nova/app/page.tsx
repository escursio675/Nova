"use client";

import { useEffect, useState } from "react";
import AppShell from "./components/Appshell";
import NoteView from "./components/Noteview";
import EmptyState from "./components/Emptystate";
import CommandPalette from "./components/Commandpalette";
import TagBrowser from "./components/Tagbrowser";
import SettingsPanel from "./components/Settingspanel";
import ShortcutsModal from "./components/Shortcutsmodal";
import type { ParsedVault } from "@/lib/vault";
import type { View } from "@/lib/view";
import { releaseVaultAssets } from "@/lib/vault";
import { setThemeChoice, type ThemeChoice } from "@/lib/theme";
import GraphView from "./components/Graphview";

interface HistoryState {
  stack: string[];
  index: number;
}

export default function Home() {
  const [vault, setVault] = useState<ParsedVault | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryState>({ stack: [], index: -1 });
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [view, setView] = useState<View>("notes");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const notes = vault?.notes ?? [];
  const selectedNote = notes.find((n) => n.id === selectedNoteId) ?? null;
  const canGoBack = history.index > 0;

  // Global shortcuts: search, back navigation, theme toggle, sidebar toggle.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      // Plain "/" (no modifier) also opens search — but only when the user
      // isn't already typing somewhere, or every "/" keystroke in a text
      // field would hijack focus into the search modal instead.
      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (!mod && key === "/" && !isTyping) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (mod && key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      } else if (mod && key === "o") {
        e.preventDefault(); // Ctrl/Cmd+O is "open file" by default in browsers
        goBack();
      } else if (mod && key === "m") {
        e.preventDefault();
        const isDark = document.documentElement.classList.contains("dark");
        const next: ThemeChoice = isDark ? "light" : "dark";
        setThemeChoice(next);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  const handleVaultLoaded = (loaded: ParsedVault) => {
    releaseVaultAssets(vault); // free the previous vault's image blob URLs
    setVault(loaded);
    const firstId = loaded.notes[0]?.id ?? null;
    setSelectedNoteId(firstId);
    setHistory(firstId ? { stack: [firstId], index: 0 } : { stack: [], index: -1 });
    setView("notes");
  };

  /**
   * Navigating "forward" — from sidebar, wikilinks, search, or tag browser.
   * Truncates any forward history past the current point (same behavior as
   * a browser tab: visiting a new page after going back clears "forward").
   */
  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
    setView("notes");
    setHistory((prev) => {
      const truncated = prev.stack.slice(0, prev.index + 1);
      // Avoid pushing a duplicate if clicking the same note that's already current.
      if (truncated[truncated.length - 1] === id) return prev;
      const stack = [...truncated, id];
      return { stack, index: stack.length - 1 };
    });
  };

  const goBack = () => {
    setHistory((prev) => {
      if (prev.index <= 0) return prev;
      const newIndex = prev.index - 1;
      setSelectedNoteId(prev.stack[newIndex]);
      setView("notes");
      return { ...prev, index: newIndex };
    });
  };

  const handleChangeView = (nextView: View) => {
    setView(nextView);
    if (nextView === "tags") setSelectedTag(null);
  };

  return (
    <>
      <AppShell
        path={view === "notes" ? selectedNote?.path : undefined}
        vault={vault}
        onVaultLoaded={handleVaultLoaded}
        selectedNoteId={selectedNoteId}
        onSelectNote={handleSelectNote}
        view={view}
        onChangeView={handleChangeView}
        canGoBack={canGoBack}
        onGoBack={goBack}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      >
        {view === "tags" ? (
          <TagBrowser
            notes={notes}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            onSelectNote={handleSelectNote}
          />
        ) : view === "graph" ? (
          <GraphView
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelectNote={handleSelectNote}
          />
        ) : selectedNote ? (
          <NoteView
            note={selectedNote}
            notes={notes}
            onSelectNote={handleSelectNote}
            assets={vault?.assets ?? {}}
          />
        ) : (
          <EmptyState vault={vault} onVaultLoaded={handleVaultLoaded} />
        )}
      </AppShell>

      <CommandPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        notes={notes}
        onSelectNote={handleSelectNote}
      />

      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <ShortcutsModal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </>
  );
}