import type { Note } from "./notes";
import type { ParsedVault, FolderNode } from "./vault";
import { extractTags, sortTree, isImage } from "./vault";

// Hardcoded — this app currently points at one specific notes repo.
// Change these two values if the repo ever moves.
const GITHUB_OWNER = "escursio675";
const GITHUB_REPO = "deez-notes";

interface GithubTreeItem {
  path: string;
  type: "blob" | "tree";
}

function isIgnoredPath(path: string): boolean {
  return path.split("/").some((segment) => segment.startsWith("."));
}

async function fetchDefaultBranch(): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`);
  if (!res.ok) {
    throw new Error(
      `Couldn't reach the repository (${res.status}). Make sure it's public and the name is correct.`
    );
  }
  const data = await res.json();
  return data.default_branch as string;
}

async function fetchTree(branch: string): Promise<GithubTreeItem[]> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/trees/${branch}?recursive=1`
  );
  if (!res.ok) {
    throw new Error(`Couldn't read the repository's contents (${res.status}).`);
  }
  const data = await res.json();
  if (data.truncated) {
    // GitHub caps how much a single tree response can return — an
    // extremely large repo would need paginated fetching, not implemented here.
    console.warn("GitHub tree response was truncated — some files may be missing.");
  }
  return data.tree as GithubTreeItem[];
}

function rawUrl(branch: string, path: string): string {
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${branch}/${path}`;
}

/**
 * Imports the hardcoded GitHub repo as a vault — same ParsedVault shape as
 * a locally uploaded folder (see parseVaultFiles in vault.ts), just sourced
 * from GitHub's API and raw content CDN instead of the File System APIs.
 *
 * Images point directly at raw.githubusercontent.com URLs rather than blob
 * URLs, since the repo is public — no need to download and re-host them.
 */
export async function importFromGithub(): Promise<ParsedVault> {
  const branch = await fetchDefaultBranch();
  const tree = await fetchTree(branch);

  const blobs = tree.filter((item) => item.type === "blob" && !isIgnoredPath(item.path));
  const markdownBlobs = blobs.filter((item) => item.path.endsWith(".md"));
  const imageBlobs = blobs.filter((item) => isImage(item.path));

  if (markdownBlobs.length === 0) {
    throw new Error("No markdown files found in that repository.");
  }

  const root: FolderNode = { type: "folder", name: GITHUB_REPO, path: "", children: [] };
  const notes: Note[] = [];
  const assets: Record<string, string> = {};

  for (const item of imageBlobs) {
    assets[item.path] = rawUrl(branch, item.path);
  }

  // raw.githubusercontent.com isn't subject to the GitHub API's strict rate
  // limit, so fetching every markdown file in parallel is safe even for
  // vaults with a few hundred notes.
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

  return { vaultName: GITHUB_REPO, tree: root, notes, assets };
}