import { Vault, SINGLETON_VAULT_ID } from "../models/Vault.js";

const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

if (!GITHUB_OWNER || !GITHUB_REPO) {
  throw new Error(
    "GITHUB_OWNER and GITHUB_REPO must be set in .env — see .env.example."
  );
}

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp"];

interface GithubTreeItem {
  path: string;
  type: "blob" | "tree";
}

interface FolderNode {
  type: "folder";
  name: string;
  path: string;
  children: (FolderNode | FileNode)[];
}

interface FileNode {
  type: "file";
  name: string;
  path: string;
  noteId: string;
}

function isIgnoredPath(path: string): boolean {
  return path.split("/").some((segment) => segment.startsWith("."));
}

function isImage(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

// Matches "#tag" but not "## Heading" — same logic as the frontend's
// extractTags in lib/vault.ts.
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

function sortTree(node: FolderNode) {
  node.children.sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  for (const child of node.children) {
    if (child.type === "folder") sortTree(child);
  }
}

async function fetchDefaultBranch(): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`);
  if (!res.ok) {
    throw new Error(
      `Couldn't reach the repository (${res.status}). Make sure it's public and the name is correct.`
    );
  }
  const data = (await res.json()) as { default_branch: string };
  return data.default_branch;
}

async function fetchTree(branch: string): Promise<GithubTreeItem[]> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/trees/${branch}?recursive=1`
  );
  if (!res.ok) {
    throw new Error(`Couldn't read the repository's contents (${res.status}).`);
  }
  const data = (await res.json()) as { tree: GithubTreeItem[]; truncated: boolean };
  if (data.truncated) {
    console.warn(
      "[githubImport] GitHub tree response was truncated — some files may be missing."
    );
  }
  return data.tree;
}

function rawUrl(branch: string, path: string): string {
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${branch}/${path}`;
}

/**
 * Fetches the full repo (tree + markdown content) from GitHub and writes it
 * into the singleton Vault document. Called by the webhook route on every
 * push, and can also be triggered manually (e.g. from a one-off script or
 * an admin "sync now" endpoint).
 */
export async function syncVaultFromGithub(): Promise<void> {
  console.log(`[githubImport] Syncing ${GITHUB_OWNER}/${GITHUB_REPO}...`);

  const branch = await fetchDefaultBranch();
  const tree = await fetchTree(branch);

  const blobs = tree.filter((item) => item.type === "blob" && !isIgnoredPath(item.path));
  const markdownBlobs = blobs.filter((item) => item.path.endsWith(".md"));
  const imageBlobs = blobs.filter((item) => isImage(item.path));

  if (markdownBlobs.length === 0) {
    throw new Error("No markdown files found in that repository.");
  }

  const root: FolderNode = { type: "folder", name: GITHUB_REPO!, path: "", children: [] };
  const notes: {
    id: string;
    title: string;
    path: string;
    tags: { label: string }[];
    body: string;
  }[] = [];
  const assets: Record<string, string> = {};

  for (const item of imageBlobs) {
    assets[item.path] = rawUrl(branch, item.path);
  }

  const markdownContents = await Promise.all(
    markdownBlobs.map(async (item) => {
      const res = await fetch(rawUrl(branch, item.path));
      if (!res.ok) throw new Error(`Failed to fetch ${item.path} (${res.status})`);
      return { path: item.path, content: await res.text() };
    })
  );

  for (const { path, content } of markdownContents) {
    const segments = path.split("/");
    const fileName = segments[segments.length - 1].replace(/\.md$/, "");
    const folderSegments = segments.slice(0, -1);

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

    cursor.children.push({
      type: "file",
      name: fileName,
      path,
      noteId: path,
    });

    notes.push({
      id: path,
      title: fileName,
      path: `/ ${GITHUB_REPO}${folderSegments.length ? " / " + folderSegments.join(" / ") : ""} / ${fileName}`,
      tags: extractTags(content),
      body: content,
    });
  }

  sortTree(root);

  await Vault.findByIdAndUpdate(
    SINGLETON_VAULT_ID,
    { vaultName: GITHUB_REPO, tree: root, notes, assets, updatedAt: new Date() },
    { upsert: true }
  );

  console.log(`[githubImport] Synced ${notes.length} notes, ${imageBlobs.length} images.`);
}