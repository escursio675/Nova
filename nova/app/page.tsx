"use client";

import { useState } from "react";
import AppShell from "./components/Appshell";
import NoteView from "./components/Noteview";
import EmptyState from "./components/Emptystate";
import { notes } from "@/lib/notes";

export default function Home() {
  // null = no note selected -> shows EmptyState.
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    notes[0]?.id ?? null
  );

  const selectedNote = notes.find((n) => n.id === selectedNoteId) ?? null;

  return (
    <AppShell
      path={selectedNote?.path}
      notes={notes}
      selectedNoteId={selectedNoteId}
      onSelectNote={setSelectedNoteId}
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
  );
}