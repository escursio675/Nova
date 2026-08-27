"use client";

import { useState } from "react";
import AppShell from "./components/Appshell";
import NoteView from "./components/Noteview";
import EmptyState from "./components/Emptystate";

// Placeholder note data — replace with a real fetch (Mongo/API) once wired up.
const sampleNote = {
  title: "On the Nature of Systems",
  tags: [{ label: "#systems" }, { label: "#logic" }, { label: "#dark-mode" }],
};

const samplePath = "/ Folders / Systems / On the Nature of Systems";

export default function Home() {
  // null = no note selected -> shows EmptyState.
  // Swap this for real selection state once the sidebar is wired to real data.
  const [selectedNote, setSelectedNote] = useState<typeof sampleNote | null>(
    sampleNote
  );

  return (
    <AppShell
      path={selectedNote ? samplePath : undefined}
      onNewNote={() => {
        // TODO: create a real note via API, then setSelectedNote(newNote)
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