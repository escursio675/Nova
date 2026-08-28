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

  // Global shortcuts: Cmd/Ctrl+K for search, Cmd/Ctrl+O for back navigation.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      } else if (mod && e.key.toLowerCase() === "o") {
        e.preventDefault(); // Ctrl/Cmd+O is "open file" by default in browsers
        goBack();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  const handleVaultLoaded = (loaded: ParsedVault) => {
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
        ) : selectedNote ? (
          <NoteView
            note={selectedNote}
            notes={notes}
            onSelectNote={handleSelectNote}
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