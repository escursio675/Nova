import type { Note } from "./notes";

export interface FolderNode {
  type: "folder";
  name: string;
  path: string; // full path from vault root, e.g. "Projects/Ideas"
  children: VaultNode[];
}

export interface FileNode {
  type: "file";
  name: string; // filename without .md
  path: string; // full path from vault root, e.g. "Projects/Ideas/My Note.md"
  noteId: string; // key into the notes map, same as `path`
}

export type VaultNode = FolderNode | FileNode;

export interface ParsedVault {
  vaultName: string;
  tree: FolderNode;
  notes: Note[];
}

// Matches "#tag" but not "## Heading" — requires no space between # and the
// tag text, and requires the # itself to be at the start of a line or
// preceded by whitespace (so it doesn't match mid-word).
const HASHTAG_REGEX = /(^|\s)#([^\s#]+)/g;

function extractTags(content: string): { label: string }[] {
  const found = new Set<string>();
  let match: RegExpExecArray | null;
  HASHTAG_REGEX.lastIndex = 0;
  while ((match = HASHTAG_REGEX.exec(content)) !== null) {
    found.add(`#${match[2]}`);
  }
  return Array.from(found).map((label) => ({ label }));
}

function isIgnored(relativePath: string): boolean {
  // Skip Obsidian's internal config folder and hidden files/folders.
  return relativePath.split("/").some((segment) => segment.startsWith("."));
}

/**
 * Reads an uploaded folder (via <input webkitdirectory>) and builds:
 * - a folder tree for the sidebar file browser
 * - a flat notes array (for search, tags, and note lookup)
 */
export async function parseVaultFiles(fileList: FileList): Promise<ParsedVault> {
  const files = Array.from(fileList).filter(
    (f) => f.name.endsWith(".md") && !isIgnored(f.webkitRelativePath)
  );

  if (files.length === 0) {
    throw new Error("No markdown files found in that folder.");
  }

  // webkitRelativePath looks like "VaultName/Folder/Sub/Note.md"
  const vaultName = files[0].webkitRelativePath.split("/")[0];

  const root: FolderNode = { type: "folder", name: vaultName, path: "", children: [] };
  const notes: Note[] = [];

  for (const file of files) {
    const content = await file.text();
    const relativePath = file.webkitRelativePath; // includes vault root segment
    const segments = relativePath.split("/").slice(1); // drop the vault root segment
    const fileName = segments[segments.length - 1].replace(/\.md$/, "");
    const folderSegments = segments.slice(0, -1);

    // Walk/create folder nodes down to this file's parent.
    let cursor = root;
    let pathSoFar = "";
    for (const segment of folderSegments) {
      pathSoFar = pathSoFar ? `${pathSoFar}/${segment}` : segment;
      let next = cursor.children.find(
        (c) => c.type === "folder" && c.name === segment
      ) as FolderNode | undefined;
      if (!next) {
        next = { type: "folder", name: segment, path: pathSoFar, children: [] };
        cursor.children.push(next);
      }
      cursor = next;
    }

    const notePath = folderSegments.length
      ? `${folderSegments.join("/")}/${fileName}.md`
      : `${fileName}.md`;

    cursor.children.push({
      type: "file",
      name: fileName,
      path: notePath,
      noteId: notePath,
    });

    notes.push({
      id: notePath,
      title: fileName,
      path: `/ ${vaultName}${folderSegments.length ? " / " + folderSegments.join(" / ") : ""} / ${fileName}`,
      tags: extractTags(content),
      body: content,
    });
  }

  sortTree(root);

  return { vaultName, tree: root, notes };
}

// Folders first, then files, both alphabetical — matches Obsidian's default sort.
function sortTree(node: FolderNode) {
  node.children.sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  for (const child of node.children) {
    if (child.type === "folder") sortTree(child);
  }
}