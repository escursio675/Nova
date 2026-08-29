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
  /** Maps a file's relative path (from vault root) to a browser-usable object URL. */
  assets: Record<string, string>;
}

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp"];

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

function isImage(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/**
 * Reads an uploaded folder (via <input webkitdirectory>) and builds:
 * - a folder tree for the sidebar file browser
 * - a flat notes array (for search, tags, and note lookup)
 * - an assets map of image files, so embedded images can actually render
 */
export async function parseVaultFiles(fileList: FileList): Promise<ParsedVault> {
  const allFiles = Array.from(fileList).filter(
    (f) => !isIgnored(f.webkitRelativePath)
  );
  const markdownFiles = allFiles.filter((f) => f.name.endsWith(".md"));
  const imageFiles = allFiles.filter((f) => isImage(f.name));

  if (markdownFiles.length === 0) {
    throw new Error("No markdown files found in that folder.");
  }

  // webkitRelativePath looks like "VaultName/Folder/Sub/Note.md"
  const vaultName = markdownFiles[0].webkitRelativePath.split("/")[0];

  const root: FolderNode = { type: "folder", name: vaultName, path: "", children: [] };
  const notes: Note[] = [];
  const assets: Record<string, string> = {};

  // Images: just need a relative-path -> blob URL map, no tree entry needed
  // since they're not browsable/selectable content, only referenced from notes.
  for (const file of imageFiles) {
    const relativePath = file.webkitRelativePath.split("/").slice(1).join("/");
    assets[relativePath] = URL.createObjectURL(file);
  }

  for (const file of markdownFiles) {
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

  return { vaultName, tree: root, notes, assets };
}

/** Releases all blob URLs for a vault — call before loading a new one to avoid leaking memory. */
export function releaseVaultAssets(vault: ParsedVault | null) {
  if (!vault) return;
  for (const url of Object.values(vault.assets)) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Resolves an image reference (from either ![[wikilink]] embeds or standard
 * ![alt](path) markdown) to an actual object URL. Tries an exact relative
 * path match first, then falls back to matching by filename alone, since
 * Obsidian often references images by bare filename regardless of which
 * subfolder they actually live in.
 */
export function resolveAssetSrc(
  target: string,
  assets: Record<string, string>
): string | null {
  if (!target) return null;
  const decoded = decodeURIComponent(target);

  if (assets[decoded]) return assets[decoded];

  const basename = decoded.split("/").pop()?.toLowerCase();
  if (!basename) return null;

  const matchKey = Object.keys(assets).find(
    (key) => key.split("/").pop()?.toLowerCase() === basename
  );

  return matchKey ? assets[matchKey] : null;
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

/** Collects every folder path in the tree — used to implement "Collapse All". */
export function getAllFolderPaths(node: FolderNode): string[] {
  const paths: string[] = [];
  for (const child of node.children) {
    if (child.type === "folder") {
      paths.push(child.path);
      paths.push(...getAllFolderPaths(child));
    }
  }
  return paths;
}