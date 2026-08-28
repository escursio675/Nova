"use client";

import { useEffect, useState } from "react";
import AppShell from "./components/Appshell";
import NoteView from "./components/Noteview";
import EmptyState from "./components/Emptystate";
import CommandPalette from "./components/Commandpalette";
import TagBrowser from "./components/Tagbrowser";
import SettingsPanel from "./components/Settingspanel";
import type { ParsedVault } from "@/lib/vault";
import type { View } from "@/lib/view";

export default function Home() {
  const [vault, setVault] = useState<ParsedVault | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [view, setView] = useState<View>("notes");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const notes = vault?.notes ?? [];
  const selectedNote = notes.find((n) => n.id === selectedNoteId) ?? null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleVaultLoaded = (loaded: ParsedVault) => {
    setVault(loaded);
    setSelectedNoteId(loaded.notes[0]?.id ?? null);
    setView("notes");
  };

  const handleSelectNote = (id: string) => {
    setSelectedNoteId(id);
    setView("notes");
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
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      >
        {view === "tags" ? (
          <TagBrowser
            notes={notes}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            onSelectNote={handleSelectNote}
          />
        ) : selectedNote ? (
          <NoteView note={selectedNote} />
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
    </>
  );
}