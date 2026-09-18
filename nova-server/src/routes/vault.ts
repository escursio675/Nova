import { Router } from "express";
import { Vault, SINGLETON_VAULT_ID } from "../models/Vault.js";

export const vaultRouter = Router();

vaultRouter.get("/vault", async (_req, res) => {
  const vault = await Vault.findById(SINGLETON_VAULT_ID);

  if (!vault) {
    // Nothing has ever been synced yet — distinct from a server error,
    // so the frontend can show "not synced yet" rather than a generic failure.
    res.status(404).json({ error: "No vault has been synced yet." });
    return;
  }

  res.json({
    vaultName: vault.vaultName,
    tree: vault.tree,
    notes: vault.notes,
    assets: vault.assets,
    updatedAt: vault.updatedAt,
  });
});