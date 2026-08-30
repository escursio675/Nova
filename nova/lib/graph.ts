import type { Note } from "./notes";

export interface GraphNode {
  id: string;
  name: string;
  /** Connection count — used to size nodes, more-linked notes appear bigger. */
  val: number;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Only need the raw target name here (not alias/heading handling like the
// full wikilink renderer does) — just enough to resolve a link's destination.
const LINK_REGEX = /\[\[([^\]|#]+)/g;

/**
 * Scans every note's raw markdown for [[wikilinks]] and builds a graph:
 * one node per note, one edge per resolved link between two notes.
 * Broken links (pointing at a note that doesn't exist) are skipped, since
 * there's nothing to draw an edge to.
 */
export function buildGraphData(notes: Note[]): GraphData {
  const titleToId = new Map<string, string>();
  for (const note of notes) {
    titleToId.set(note.title.toLowerCase(), note.id);
  }

  const degree = new Map<string, number>();
  const links: GraphLink[] = [];
  const seenLinks = new Set<string>(); // dedupe repeated links to the same note

  for (const note of notes) {
    LINK_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = LINK_REGEX.exec(note.body)) !== null) {
      const targetTitle = match[1].trim().toLowerCase();
      const targetId = titleToId.get(targetTitle);
      if (!targetId || targetId === note.id) continue; // skip broken links & self-links

      const linkKey = [note.id, targetId].sort().join("::");
      if (seenLinks.has(linkKey)) continue;
      seenLinks.add(linkKey);

      links.push({ source: note.id, target: targetId });
      degree.set(note.id, (degree.get(note.id) ?? 0) + 1);
      degree.set(targetId, (degree.get(targetId) ?? 0) + 1);
    }
  }

  const nodes: GraphNode[] = notes.map((note) => ({
    id: note.id,
    name: note.title,
    val: Math.max(1, degree.get(note.id) ?? 0),
  }));

  return { nodes, links };
}