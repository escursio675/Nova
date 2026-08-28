"use client";

import { FileText, Star, Folder as FolderIcon, Tag, Trash2 } from "lucide-react";
import FileTree from "./Filetree";
import VaultUpload from "./Vaultupload";
import type { ParsedVault, FolderNode } from "@/lib/vault";
import type { View } from "@/lib/view";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  vault: ParsedVault | null;
  onVaultLoaded: (vault: ParsedVault) => void;
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  view: View;
  onChangeView: (view: View) => void;
}

export default function Sidebar({
  open,
  onClose,
  vault,
  onVaultLoaded,
  selectedNoteId,
  onSelectNote,
  view,
  onChangeView,
}: SidebarProps) {
  return (
    <>
      <aside
        className={`
          fixed left-0 top-0 z-40 flex h-full w-[260px] flex-col
          border-r border-slate-300 bg-beige-50 py-4
          dark:border-slate-700 dark:bg-slate-800
          transition-transform duration-200
          md:static md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
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

          <div className="flex cursor-pointer items-center gap-3 px-3 py-2 font-ui text-sm text-slate-600 transition-colors hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/60">
            <Star size={18} />
            <span>Starred</span>
          </div>

          {/* Real file tree, once a vault's been loaded */}
          {view === "notes" && vault && (
            <div className="my-2 flex flex-col gap-0.5 border-t border-slate-300/50 pt-2 dark:border-slate-700/50">
              <FileTree
                nodes={(vault.tree as FolderNode).children}
                selectedNoteId={selectedNoteId}
                onSelectNote={(id) => {
                  onSelectNote(id);
                  onClose();
                }}
              />
            </div>
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
              onClose();
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

          <div className="flex cursor-pointer items-center gap-3 px-3 py-2 font-ui text-sm text-slate-600 transition-colors hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/60">
            <Trash2 size={18} />
            <span>Trash</span>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}