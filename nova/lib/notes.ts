export interface NoteTag {
  label: string;
}

export interface Note {
  id: string;
  title: string;
  path: string;
  tags: NoteTag[];
  body: string; // markdown-ish placeholder content for now
}

// Placeholder data — replace with a real fetch (MongoDB/API) once the
// backend is wired up. Keeping this in one file means Sidebar and the
// page component both read from the same source, so they never drift.
export const notes: Note[] = [
  {
    id: "on-the-nature-of-systems",
    title: "On the Nature of Systems",
    path: "/ Folders / Systems / On the Nature of Systems",
    tags: [{ label: "#systems" }, { label: "#logic" }, { label: "#dark-mode" }],
    body: `A system is a set of interacting or interdependent components forming a complex or intricate whole. Every system is delineated by its spatial and temporal boundaries, surrounded and influenced by its environment, described by its structure and purpose and expressed in its functioning.

> "Systems thinking is a discipline for seeing wholes. It is a framework for seeing interrelationships rather than things, for seeing patterns of change rather than static 'snapshots'." — Peter Senge

## Structural Integrity

In designing software, we often encounter the friction between localized optimization and systemic coherence. The architecture of a system dictates not just how it functions, but how it evolves.

Consider the feedback loops. Positive feedback amplifies variation, driving the system away from equilibrium, while negative feedback dampens it, maintaining stability. A robust design balances these forces.`,
  },
  {
    id: "knowledge-graphs",
    title: "Knowledge Graphs",
    path: "/ Folders / Systems / Knowledge Graphs",
    tags: [{ label: "#graphs" }, { label: "#data" }],
    body: `A knowledge graph represents a network of real-world entities and illustrates the relationship between them. This information is usually stored in a graph database and visualized as a graph structure.

## Nodes and Edges

Every entity becomes a node; every relationship becomes an edge. This structure makes it possible to traverse connections that would be difficult to express in a purely tabular schema.

The real power emerges when graphs are queried for indirect relationships — connections several hops removed from the original entity.`,
  },
];