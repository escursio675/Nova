import type { ParsedVault } from "./vault";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Fetches the already-synced vault from your own backend (nova-server),
 * rather than talking to GitHub directly. The backend stays in sync via a
 * GitHub webhook, so this is typically instant and doesn't depend on
 * GitHub's API being reachable/rate-limited at request time.
 */
export async function importFromBackend(): Promise<ParsedVault> {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set — add it to .env.local (see chat for the value)."
    );
  }

  const res = await fetch(`${API_URL}/api/vault`);

  if (res.status === 404) {
    throw new Error(
      "No vault has been synced on the server yet. Push a commit to trigger a sync, or run it manually."
    );
  }

  if (!res.ok) {
    throw new Error(`Server responded with an error (${res.status}).`);
  }

  const data = (await res.json()) as ParsedVault & { updatedAt?: string };

  return {
    vaultName: data.vaultName,
    tree: data.tree,
    notes: data.notes,
    assets: data.assets,
  };
}