import mongoose, { Schema, type Document } from "mongoose";

interface NoteDoc {
  id: string;
  title: string;
  path: string;
  tags: { label: string }[];
  body: string;
}

export interface VaultDoc extends Document {
  vaultName: string;
  // `tree` is a recursive folder/file structure (see lib/vault.ts's
  // FolderNode type on the frontend).
  tree: Record<string, unknown>;
  notes: NoteDoc[];
  // path -> raw.githubusercontent.com URL
  assets: Record<string, string>;
  updatedAt: Date;
}

const NoteSchema = new Schema<NoteDoc>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    path: { type: String, required: true },
    tags: [{ label: { type: String, required: true } }],
    body: { type: String, required: true },
  },
  { _id: false }
);

const VaultSchema = new Schema<VaultDoc>({
  vaultName: { type: String, required: true },
  tree: { type: Schema.Types.Mixed, required: true },
  notes: { type: [NoteSchema], default: [] },
  assets: { type: Schema.Types.Mixed, default: {} },
  updatedAt: { type: Date, default: Date.now },
});

export const Vault = mongoose.model<VaultDoc>("Vault", VaultSchema);

// This app only ever tracks one vault so
// rather than querying by some key, we always read/write the same fixed
// document ID. This turns "get the vault" and "update the vault" into
// simple, unambiguous operations with no risk of accidentally creating
// duplicates.
export const SINGLETON_VAULT_ID = new mongoose.Types.ObjectId(
  "000000000000000000000001"
);