import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import type { Note } from "@/lib/notes";
import { resolveAssetSrc } from "@/lib/vault";
import { transformHighlights } from "@/lib/highlight";
import {
  transformWikilinks,
  isWikilinkHref,
  getWikilinkTarget,
} from "@/lib/wikilinks";

interface NoteViewProps {
  note: Note;
  notes: Note[];
  onSelectNote: (id: string) => void;
  /** Maps a vault-relative file path to a browser-usable object URL (images live here). */
  assets: Record<string, string>;
}

export default function NoteView({ note, notes, onSelectNote, assets }: NoteViewProps) {
  const body = transformHighlights(transformWikilinks(note.body));

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

        <div
          className="
            prose prose-slate max-w-none font-serif
            dark:prose-invert
            prose-headings:font-serif prose-headings:font-semibold
            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
            prose-p:leading-relaxed
            prose-blockquote:border-l-4 prose-blockquote:border-slate-400 prose-blockquote:italic prose-blockquote:text-slate-500
            dark:prose-blockquote:border-slate-600 dark:prose-blockquote:text-slate-400
            prose-code:font-mono prose-code:text-sm prose-code:text-slate-800 prose-code:before:content-none prose-code:after:content-none
            dark:prose-code:text-slate-200
            prose-pre:border prose-pre:border-slate-300 prose-pre:bg-beige-200 prose-pre:text-slate-800
            dark:prose-pre:border-slate-700 dark:prose-pre:bg-slate-800 dark:prose-pre:text-slate-200
            prose-a:text-slate-700 dark:prose-a:text-slate-300
            [&_mark]:rounded-none [&_mark]:bg-amber-200/70 [&_mark]:px-0.5 [&_mark]:text-inherit
            dark:[&_mark]:bg-amber-400/20
          "
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
            components={{
              a: ({ href, children }) => {
                if (isWikilinkHref(href)) {
                  const targetTitle = getWikilinkTarget(href);
                  const targetNote = notes.find(
                    (n) => n.title.toLowerCase() === targetTitle.toLowerCase()
                  );

                  if (targetNote) {
                    return (
                      <button
                        type="button"
                        onClick={() => onSelectNote(targetNote.id)}
                        className="cursor-pointer border-b border-dotted border-slate-400 font-medium text-slate-800 no-underline hover:border-solid hover:text-slate-950 dark:text-slate-200 dark:hover:text-white"
                      >
                        {children}
                      </button>
                    );
                  }

                  return (
                    <span
                      className="cursor-not-allowed border-b border-dotted border-red-400/60 text-red-500/80 dark:text-red-400/80"
                      title={`No note titled "${targetTitle}"`}
                    >
                      {children}
                    </span>
                  );
                }

                return (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                );
              },

              img: ({ src, alt }) => {
                // react-markdown types `src` as `string | Blob`, but markdown
                // parsing only ever produces string URLs in practice — this
                // guard satisfies TypeScript and safely bails on the
                // (unreachable in normal use) Blob case.
                if (!src || typeof src !== "string") return null;

                // ![[embed.png]] arrives here as "#wikilink:embed.png" (see
                // transformWikilinks); plain markdown images arrive as
                // whatever relative path was written in the note.
                const rawTarget = isWikilinkHref(src) ? getWikilinkTarget(src) : src;
                const resolved = resolveAssetSrc(rawTarget, assets);

                if (resolved) {
                  // eslint-disable-next-line @next/next/no-img-element
                  return (
                    <img
                      src={resolved}
                      alt={alt ?? rawTarget}
                      className="max-w-full rounded border border-slate-300 dark:border-slate-700"
                    />
                  );
                }

                // Image referenced in the note but not found among uploaded
                // files — likely outside the vault folder, or not an image
                // this app recognizes yet.
                return (
                  <span className="inline-block border border-dashed border-slate-400 bg-slate-200/40 px-3 py-2 font-mono text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-400">
                    Image not found: {rawTarget}
                  </span>
                );
              },
            }}
          >
            {body}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}