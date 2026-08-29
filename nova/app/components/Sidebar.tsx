"use client";

import { useState } from "react";
import { FileText, Tag, ChevronsDownUp } from "lucide-react";
import FileTree from "./Filetree";
import VaultUpload from "./Vaultupload";
import type { ParsedVault, FolderNode } from "@/lib/vault";
import { getAllFolderPaths } from "@/lib/vault";
import type { View } from "@/lib/view";

interface SidebarProps {
  /** Whether the sidebar is visible as a mobile overlay (below the md breakpoint). */
  mobileOpen: boolean;
  /** Whether the sidebar is visible in the desktop push-layout (md and above). */
  desktopOpen: boolean;
  onCloseMobile: () => void;
  vault: ParsedVault | null;
  onVaultLoaded: (vault: ParsedVault) => void;
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  view: View;
  onChangeView: (view: View) => void;
}

export default function Sidebar({
  mobileOpen,
  desktopOpen,
  onCloseMobile,
  vault,
  onVaultLoaded,
  selectedNoteId,
  onSelectNote,
  view,
  onChangeView,
}: SidebarProps) {
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    setCollapsedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const collapseAll = () => {
  if (!vault) return;
  const paths = getAllFolderPaths(vault.tree as FolderNode);
  setCollapsedPaths(new Set(paths));
};

  return (
    <>
      <aside
        className={`
          fixed left-0 top-0 z-40 flex h-full w-[260px] flex-col
          border-r border-slate-300 bg-beige-50 py-4
          dark:border-slate-700 dark:bg-slate-800
          transition-transform duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          ${desktopOpen ? "md:translate-x-0" : "md:-translate-x-full"}
        `}
      >
        <div className="mb-6 px-4">
          <h1 className="truncate font-serif text-xl font-semibold text-slate-800 dark:text-slate-300">
            {vault ? vault.vaultName : "Digital Garden"}
          </h1>
          <p className="mt-1 font-ui text-xs text-slate-500 dark:text-slate-400">
            {vault ? "Vault loaded" : "No vault loaded"}
          </p>
        </div>

        <VaultUpload onLoaded={onVaultLoaded} />

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2">
          <button
            type="button"
            onClick={() => onChangeView("notes")}
            className={`flex items-center gap-3 px-3 py-2 text-left font-ui text-sm transition-colors ${
              view === "notes"
                ? "border-l-2 border-slate-700 bg-slate-300/20 font-bold text-slate-800 dark:border-slate-300 dark:bg-slate-700/30 dark:text-slate-200"
                : "text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/60"
            }`}
          >
            <FileText size={18} />
            <span>All Notes</span>
          </button>

          {view === "notes" && vault && (
            <>
              <div className="mt-2 flex items-center justify-between border-t border-slate-300/50 px-3 pt-2 dark:border-slate-700/50">
                <span className="font-ui text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Files
                </span>
                <button
                  type="button"
                  onClick={collapseAll}
                  title="Collapse all folders"
                  className="flex items-center gap-1 text-slate-400 transition-colors hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
                >
                  <ChevronsDownUp size={14} />
                </button>
              </div>
              <div className="flex flex-col gap-0.5 pt-1">
                <FileTree
                  nodes={(vault.tree as FolderNode).children}
                  selectedNoteId={selectedNoteId}
                  onSelectNote={(id) => {
                    onSelectNote(id);
                    onCloseMobile();
                  }}
                  collapsedPaths={collapsedPaths}
                  onToggleFolder={toggleFolder}
                />
              </div>
            </>
          )}

          {!vault && (
            <p className="px-3 py-2 font-ui text-xs text-slate-400 dark:text-slate-500">
              Open a vault folder to see your notes here.
            </p>
          )}
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-slate-300 px-2 pt-4 dark:border-slate-700">
          <button
            type="button"
            onClick={() => {
              onChangeView("tags");
              onCloseMobile();
            }}
            className={`flex items-center gap-3 px-3 py-2 text-left font-ui text-sm transition-colors ${
              view === "tags"
                ? "border-l-2 border-slate-700 bg-slate-300/20 font-bold text-slate-800 dark:border-slate-300 dark:bg-slate-700/30 dark:text-slate-200"
                : "text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/60"
            }`}
          >
            <Tag size={18} />
            <span>Tags</span>
          </button>
        </div>
      </aside>

      {/* Mobile-only backdrop — desktop collapse never shows this */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onCloseMobile}
        />
      )}
    </>
  );
}