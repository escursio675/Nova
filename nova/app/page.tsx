"use client";

import { useEffect, useState } from "react";
import AppShell from "./components/Appshell";
import NoteView from "./components/Noteview";
import EmptyState from "./components/Emptystate";
import CommandPalette from "./components/Commandpalette";
import TagBrowser from "./components/Tagbrowser";
import { notes } from "@/lib/notes";
import type { View } from "@/lib/view";
import SettingsPanel from "./components/Settingspanel";

export default function Home() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    notes[0]?.id ?? null
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [view, setView] = useState<View>("notes");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const selectedNote = notes.find((n) => n.id === selectedNoteId) ?? null;

  // Global Cmd/Ctrl+K shortcut to open the command palette from anywhere.
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
        notes={notes}
        selectedNoteId={selectedNoteId}
        onSelectNote={handleSelectNote}
        view={view}
        onChangeView={handleChangeView}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onNewNote={() => {
          // TODO: create a real note via API, push it into `notes`,
          // then setSelectedNoteId(newNote.id)
          console.log("New note requested");
        }}
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
          <EmptyState onNewNote={() => console.log("New note requested")} />
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