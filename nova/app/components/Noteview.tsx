interface Tag {
  label: string;
}

interface NoteData {
  title: string;
  tags: Tag[];
}

interface NoteViewProps {
  note: NoteData;
}

export default function NoteView({ note }: NoteViewProps) {
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
          <p>
            A system is a set of interacting or interdependent components
            forming a complex or intricate whole. Every system is delineated
            by its spatial and temporal boundaries, surrounded and influenced
            by its environment, described by its structure and purpose and
            expressed in its functioning.
          </p>

          <blockquote className="border-l-4 border-slate-400 pl-4 italic text-slate-500 dark:border-slate-600 dark:text-slate-400">
            &ldquo;Systems thinking is a discipline for seeing wholes. It is a
            framework for seeing interrelationships rather than things, for
            seeing patterns of change rather than static
            &lsquo;snapshots&rsquo;.&rdquo; &mdash; Peter Senge
          </blockquote>

          <h2 className="mt-8 mb-4 inline-block border-b border-slate-300/50 pb-2 font-serif text-2xl font-semibold text-slate-900 dark:border-slate-700 dark:text-white">
            Structural Integrity
          </h2>

          <p>
            In designing software, we often encounter the friction between
            localized optimization and systemic coherence. The architecture
            of a system dictates not just how it functions, but how it
            evolves.
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
  );
}