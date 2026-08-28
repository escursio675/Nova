"use client";

import { FolderOpen, FileText } from "lucide-react";
import VaultUpload from "./Vaultupload";
import type { ParsedVault } from "@/lib/vault";

interface EmptyStateProps {
  vault: ParsedVault | null;
  onVaultLoaded: (vault: ParsedVault) => void;
}

export default function EmptyState({ vault, onVaultLoaded }: EmptyStateProps) {
  const hasVault = Boolean(vault);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200/60 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        {hasVault ? <FileText size={28} /> : <FolderOpen size={28} />}
      </div>

      <div className="space-y-1">
        <h2 className="font-serif text-xl font-semibold text-slate-800 dark:text-slate-200">
          {hasVault ? "No note selected" : "No vault loaded"}
        </h2>
        <p className="max-w-xs font-ui text-sm text-slate-500 dark:text-slate-400">
          {hasVault
            ? "Pick a note from the sidebar to start reading."
            : "Open a folder containing your Obsidian markdown files to get started."}
        </p>
      </div>

      {!hasVault && (
        <div className="mt-2">
          <VaultUpload onLoaded={onVaultLoaded} variant="dropzone" />
        </div>
      )}
    </div>
  );
}