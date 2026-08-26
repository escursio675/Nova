"use client";

import { useState } from "react";

/**
 * GardenNotes — Note Editor View
 *
 * Converted from static HTML to React + TypeScript + Tailwind.
 * Serif font swapped: Source Serif 4 -> Ibarra Real Nova (used for
 * headings, body copy, and the markdown editor text).
 *
 * Add this to your Next.js <head> (or _document.tsx / layout.tsx):
 *
 *   <link rel="preconnect" href="https://fonts.googleapis.com" />
 *   <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
 *   <link
 *     href="https://fonts.googleapis.com/css2?family=Ibarra+Real+Nova:ital,wght@0,400..700;1,400..700&family=Inter:wght@400;500&family=JetBrains+Mono&display=swap"
 *     rel="stylesheet"
 *   />
 *
 * Tailwind theme extension (tailwind.config.ts):
 *
 *   fontFamily: {
 *     serif: ['"Ibarra Real Nova"', 'serif'],
 *     ui: ['Inter', 'sans-serif'],
 *     mono: ['"JetBrains Mono"', 'monospace'],
 *   }
 */

interface Tag {
  label: string;
}

interface NoteData {
  title: string;
  path: string;
  tags: Tag[];
}

interface SidebarItem {
  icon: string;
  label: string;
  active?: boolean;
}

const sidebarNav: SidebarItem[] = [
  { icon: "description", label: "All Notes", active: true },
  { icon: "star", label: "Starred" },
  { icon: "folder", label: "Folders" },
];

const folderNotes = [
  { label: "On the Nature of Systems", active: true },
  { label: "Knowledge Graphs", active: false },
];

const sidebarFooter: SidebarItem[] = [
  { icon: "sell", label: "Tags" },
  { icon: "delete", label: "Trash" },
];

const note: NoteData = {
  title: "On the Nature of Systems",
  path: "/ Folders / Systems / On the Nature of Systems",
  tags: [{ label: "#systems" }, { label: "#logic" }, { label: "#dark-mode" }],
};

export default function NoteEditorView() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-beige-100 text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-50">
      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40 flex h-full w-[260px] flex-col
          border-r border-slate-300 bg-beige-50 py-4
          dark:border-slate-700 dark:bg-slate-800
          transition-transform duration-200
          md:static md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="mb-6 px-4">
          <h1 className="font-serif text-xl font-semibold text-slate-800 dark:text-slate-300">
            Digital Garden
          </h1>
          <p className="mt-1 font-ui text-xs text-slate-500 dark:text-slate-400">
            Local Vault
          </p>
        </div>

        <button
          type="button"
          className="mx-4 mb-6 flex items-center justify-center gap-2 border border-slate-300 bg-beige-200 px-4 py-2 font-ui text-sm font-medium text-slate-800 transition-colors hover:bg-slate-300/60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Note
        </button>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2">
          {sidebarNav.map((item) => (
            <div
              key={item.label}
              className={`flex cursor-pointer items-center gap-3 px-3 py-2 font-ui text-sm transition-colors ${
                item.active
                  ? "border-l-2 border-slate-700 bg-slate-300/20 font-bold text-slate-800 dark:border-slate-300 dark:bg-slate-700/30 dark:text-slate-200"
                  : "text-slate-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/60"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
          ))}

          <div className="my-1 ml-8 flex flex-col gap-1">
            {folderNotes.map((n) => (
              <div
                key={n.label}
                className={`flex cursor-pointer items-center gap-2 px-2 py-1 text-sm transition-colors ${
                  n.active
                    ? "text-slate-800 dark:text-slate-200"
                    : "text-slate-500 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/60"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  article
                </span>
                <span>{n.label}</span>
              </div>
            ))}
          </div>

          <div className="flex cursor-pointer items-center gap-3 px-3 py-2 font-ui text-sm text-slate-600 transition-colors hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/60">
            <span className="material-symbols-outlined text-[18px]">
              inventory_2
            </span>
            <span>Archive</span>
          </div>
        </nav>

        <div className="mt-auto flex flex-col gap-1 border-t border-slate-300 px-2 pt-4 dark:border-slate-700">
          {sidebarFooter.map((item) => (
            <div
              key={item.label}
              className="flex cursor-pointer items-center gap-3 px-3 py-2 font-ui text-sm text-slate-600 transition-colors hover:bg-slate-200/60 dark:text-slate-400 dark:hover:bg-slate-700/60"
            >
              <span className="material-symbols-outlined text-[18px]">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex h-full flex-1 flex-col bg-beige-100 dark:bg-slate-900">
        <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-slate-300 bg-beige-100 px-4 dark:border-slate-700 dark:bg-slate-900 md:px-6">
          <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
            <span
              className="material-symbols-outlined cursor-pointer transition-colors hover:text-slate-900 dark:hover:text-white md:hidden"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              menu
            </span>
            <span className="hidden font-ui text-sm text-slate-500 dark:text-slate-400 sm:inline">
              {note.path}
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
            <span className="material-symbols-outlined cursor-pointer transition-colors hover:text-slate-900 dark:hover:text-white">
              settings
            </span>
            <span className="material-symbols-outlined cursor-pointer transition-colors hover:text-slate-900 dark:hover:text-white">
              sync
            </span>
            <span className="material-symbols-outlined cursor-pointer transition-colors hover:text-slate-900 dark:hover:text-white">
              account_circle
            </span>
          </div>
        </header>

        <div className="flex w-full flex-1 justify-center overflow-y-auto py-8 sm:py-10">
          <article className="w-full max-w-[800px] px-4 sm:px-6">
            <header className="mb-6 border-b border-slate-300 pb-4 dark:border-slate-700">
              <h1 className="mb-4 font-serif text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
                {note.title}
              </h1>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag.label}
                    className="rounded-none border border-slate-400/60 bg-slate-200/60 px-2 py-1 font-mono text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-300"
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </header>

            <div className="space-y-6 font-serif text-base leading-relaxed text-slate-700 dark:text-slate-300 sm:text-lg">
              <p>
                A system is a set of interacting or interdependent components
                forming a complex or intricate whole. Every system is
                delineated by its spatial and temporal boundaries, surrounded
                and influenced by its environment, described by its structure
                and purpose and expressed in its functioning.
              </p>

              <blockquote className="border-l-4 border-slate-400 pl-4 italic text-slate-500 dark:border-slate-600 dark:text-slate-400">
                &ldquo;Systems thinking is a discipline for seeing wholes. It
                is a framework for seeing interrelationships rather than
                things, for seeing patterns of change rather than static
                &lsquo;snapshots&rsquo;.&rdquo; &mdash; Peter Senge
              </blockquote>

              <h2 className="mt-8 mb-4 inline-block border-b border-slate-300/50 pb-2 font-serif text-2xl font-semibold text-slate-900 dark:border-slate-700 dark:text-white">
                Structural Integrity
              </h2>

              <p>
                In designing software, we often encounter the friction
                between localized optimization and systemic coherence. The
                architecture of a system dictates not just how it functions,
                but how it evolves.
              </p>

              <div className="my-6 border border-slate-300 bg-beige-200 p-4 dark:border-slate-700 dark:bg-slate-800">
                <pre className="overflow-x-auto font-mono text-sm text-slate-600 dark:text-slate-400">
                  <code>{`function evaluateSystem(components) {
    let coherence = 0;
    for (let c of components) {
        coherence += calculateInterdependencies(c);
    }
    return coherence > THRESHOLD;
}`}</code>
                </pre>
              </div>

              <p>
                Consider the feedback loops. Positive feedback amplifies
                variation, driving the system away from equilibrium, while
                negative feedback dampens it, maintaining stability. A robust
                design balances these forces.
              </p>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}