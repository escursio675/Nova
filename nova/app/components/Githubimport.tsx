"use client";

import { useState } from "react";
import { GitBranch, Loader2 } from "lucide-react";
import { importFromGithub } from "@/lib/github";
import type { ParsedVault } from "@/lib/vault";

interface GithubImportProps {
  onLoaded: (vault: ParsedVault) => void;
  /** "button" for a compact sidebar trigger, "dropzone" for the big empty-state prompt */
  variant?: "button" | "dropzone";
}

export default function GithubImport({ onLoaded, variant = "button" }: GithubImportProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const vault = await importFromGithub();
      onLoaded(vault);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't import from GitHub.");
    } finally {
      setLoading(false);
    }
  };

  const baseClasses =
    "flex items-center justify-center gap-2 border border-slate-300 px-4 py-2 font-ui text-sm font-medium text-slate-800 transition-colors hover:border-accent hover:bg-accent/15 disabled:opacity-60 dark:border-slate-600 dark:text-slate-300";

  if (variant === "dropzone") {
    return (
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className={baseClasses}
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <GitBranch size={16} />
          )}
          {loading ? "Importing..." : "Import from GitHub"}
        </button>
        {error && (
          <p className="max-w-xs text-center font-ui text-xs text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`w-full ${baseClasses}`}
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <GitBranch size={18} />
        )}
        {loading ? "Importing..." : "Import from GitHub"}
      </button>
      {error && <p className="mt-2 font-ui text-xs text-red-500">{error}</p>}
    </div>
  );
}