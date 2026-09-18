import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import { vaultRouter } from "./routes/vault.js";
import { webhookRouter } from "./routes/webhook.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// IMPORTANT: mounted before app.use(express.json()) below. The webhook
// route defines its own express.raw() middleware (see routes/webhook.ts)
// specifically so it can verify GitHub's signature against the exact raw
// request bytes. If a global JSON parser ran first, it would consume and
// parse the body before the webhook route ever saw it, breaking signature
// verification. Route order matters here — don't reorder these two lines.
app.use("/api", webhookRouter);

// Applies to every route mounted after this point.
app.use(express.json());

app.use("/api", vaultRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] Listening on port ${PORT}`);
  });
}

start();