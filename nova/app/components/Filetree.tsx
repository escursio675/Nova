"use client";

import { ChevronRight, ChevronDown, Folder, FileText } from "lucide-react";
import type { VaultNode } from "@/lib/vault";

interface FileTreeProps {
  nodes: VaultNode[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  /** Paths of folders that are currently collapsed. Everything not in here is open. */
  collapsedPaths: Set<string>;
  onToggleFolder: (path: string) => void;
  depth?: number;
}

export default function FileTree({
  nodes,
  selectedNoteId,
  onSelectNote,
  collapsedPaths,
  onToggleFolder,
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
            collapsedPaths={collapsedPaths}
            onToggleFolder={onToggleFolder}
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
                ? "border-l-2 border-accent bg-accent/15 text-slate-800 dark:text-slate-200"
                : "text-slate-500 hover:bg-accent/10 hover:text-accent dark:text-slate-400"
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
  collapsedPaths,
  onToggleFolder,
  depth,
}: {
  node: Extract<VaultNode, { type: "folder" }>;
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  collapsedPaths: Set<string>;
  onToggleFolder: (path: string) => void;
  depth: number;
}) {
  const isOpen = !collapsedPaths.has(node.path);

  return (
    <div>
      <button
        type="button"
        onClick={() => onToggleFolder(node.path)}
        style={{ paddingLeft: `${4 + depth * 14}px` }}
        className="flex w-full items-center gap-1.5 py-1 pr-2 text-left text-sm text-slate-600 transition-colors hover:bg-accent/10 hover:text-accent dark:text-slate-400"
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <Folder size={14} className="shrink-0" />
        <span className="truncate font-medium">{node.name}</span>
      </button>
      {isOpen && node.children.length > 0 && (
        <FileTree
          nodes={node.children}
          selectedNoteId={selectedNoteId}
          onSelectNote={onSelectNote}
          collapsedPaths={collapsedPaths}
          onToggleFolder={onToggleFolder}
          depth={depth + 1}
        />
      )}
    </div>
  );
}