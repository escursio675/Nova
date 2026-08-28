"use client";

import { useRef, useState } from "react";
import { FolderOpen, Loader2 } from "lucide-react";
import { parseVaultFiles, type ParsedVault } from "@/lib/vault";

// TypeScript doesn't know about the non-standard webkitdirectory attribute.
declare module "react" {
  interface InputHTMLAttributes<T> extends React.HTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

interface VaultUploadProps {
  onLoaded: (vault: ParsedVault) => void;
  /** "button" for a compact sidebar trigger, "dropzone" for the big empty-state prompt */
  variant?: "button" | "dropzone";
}

export default function VaultUpload({
  onLoaded,
  variant = "button",
}: VaultUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const vault = await parseVaultFiles(files);
      onLoaded(vault);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that folder.");
    } finally {
      setLoading(false);
      // Reset so selecting the same folder again still fires onChange.
      e.target.value = "";
    }
  };

  const hiddenInput = (
    <input
      ref={inputRef}
      type="file"
      webkitdirectory=""
      directory=""
      multiple
      className="hidden"
      onChange={handleChange}
    />
  );

  if (variant === "dropzone") {
    return (
      <div className="flex flex-col items-center gap-3">
        {hiddenInput}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="flex items-center gap-2 border border-slate-300 bg-beige-200 px-4 py-2 font-ui text-sm font-medium text-slate-800 transition-colors hover:bg-slate-300/60 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FolderOpen size={16} />
          )}
          {loading ? "Reading vault..." : "Open Vault Folder"}
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
    <div className="mx-4 mb-6">
      {hiddenInput}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 border border-slate-300 bg-beige-200 px-4 py-2 font-ui text-sm font-medium text-slate-800 transition-colors hover:bg-slate-300/60 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <FolderOpen size={18} />
        )}
        {loading ? "Reading..." : "Open Vault"}
      </button>
      {error && (
        <p className="mt-2 font-ui text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}