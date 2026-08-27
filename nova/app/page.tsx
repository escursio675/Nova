"use client";

import { useEffect, useState } from "react";
import AppShell from "./components/Appshell";
import NoteView from "./components/Noteview";
import EmptyState from "./components/Emptystate";
import CommandPalette from "./components/Commandpalette";
import { notes } from "@/lib/notes";

export default function Home() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    notes[0]?.id ?? null
  );
  const [searchOpen, setSearchOpen] = useState(false);

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

  return (
    <>
      <AppShell
        path={selectedNote?.path}
        notes={notes}
        selectedNoteId={selectedNoteId}
        onSelectNote={setSelectedNoteId}
        onOpenSearch={() => setSearchOpen(true)}
        onNewNote={() => {
          // TODO: create a real note via API, push it into `notes`,
          // then setSelectedNoteId(newNote.id)
          console.log("New note requested");
        }}
      >
        {selectedNote ? (
          <NoteView note={selectedNote} />
        ) : (
          <EmptyState onNewNote={() => console.log("New note requested")} />
        )}
      </AppShell>

      <CommandPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        notes={notes}
        onSelectNote={setSelectedNoteId}
      />
    </>
  );
}
