import type { Note } from "@/lib/notes";

interface NoteViewProps {
  note: Note;
}

/**
 * Renders note.body as plain paragraphs for now, splitting on blank lines.
 * This is a placeholder — swap for a real markdown renderer (e.g.
 * react-markdown) in the "wire in real markdown rendering" step.
 */
export default function NoteView({ note }: NoteViewProps) {
  const paragraphs = note.body.split("\n\n").filter(Boolean);

  return (
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
          {paragraphs.map((para, i) => {
            if (para.startsWith("## ")) {
              return (
                <h2
                  key={i}
                  className="mt-8 mb-4 inline-block border-b border-slate-300/50 pb-2 font-serif text-2xl font-semibold text-slate-900 dark:border-slate-700 dark:text-white"
                >
                  {para.replace("## ", "")}
                </h2>
              );
            }
            if (para.startsWith("> ")) {
              return (
                <blockquote
                  key={i}
                  className="border-l-4 border-slate-400 pl-4 italic text-slate-500 dark:border-slate-600 dark:text-slate-400"
                >
                  {para.replace("> ", "")}
                </blockquote>
              );
            }
            return <p key={i}>{para}</p>;
          })}
        </div>
      </article>
    </div>
  );
}