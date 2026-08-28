"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FileText } from "lucide-react";
import type { VaultNode } from "@/lib/vault";

interface FileTreeProps {
  nodes: VaultNode[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  depth?: number;
}

export default function FileTree({
  nodes,
  selectedNoteId,
  onSelectNote,
  depth = 0,
}: FileTreeProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {nodes.map((node) =>
        node.type === "folder" ? (
          <FolderRow
            key={node.path}
            node={node}
            selectedNoteId={selectedNoteId}
            onSelectNote={onSelectNote}
            depth={depth}
          />
        ) : (
          <button
            key={node.path}
            type="button"
            onClick={() => onSelectNote(node.noteId)}
            style={{ paddingLeft: `${12 + depth * 14}px` }}
            className={`flex items-center gap-2 py-1 pr-2 text-left text-sm transition-colors ${
              node.noteId === selectedNoteId
                ? "bg-slate-300/20 text-slate-800 dark:bg-slate-700/30 dark:text-slate-200"
                : "text-slate-500 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/60"
            }`}
          >
            <FileText size={14} className="shrink-0" />
            <span className="truncate">{node.name}</span>
          </button>
        )
      )}
    </div>
  );
}

function FolderRow({
  node,
  selectedNoteId,
  onSelectNote,
  depth,
}: {
  node: Extract<VaultNode, { type: "folder" }>;
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  depth: number;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ paddingLeft: `${4 + depth * 14}px` }}
        className="flex w-full items-center gap-1.5 py-1 pr-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/60"
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <Folder size={14} className="shrink-0" />
        <span className="truncate font-medium">{node.name}</span>
      </button>
      {open && node.children.length > 0 && (
        <FileTree
          nodes={node.children}
          selectedNoteId={selectedNoteId}
          onSelectNote={onSelectNote}
          depth={depth + 1}
        />
      )}
    </div>
  );
}