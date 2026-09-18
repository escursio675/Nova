import express, { Router } from "express";
import crypto from "node:crypto";
import { syncVaultFromGithub } from "../services/githubImport.js";

export const webhookRouter = Router();

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

if (!WEBHOOK_SECRET) {
  throw new Error(
    "GITHUB_WEBHOOK_SECRET must be set in .env — see .env.example."
  );
}

/**
 * Recomputes GitHub's HMAC-SHA256 signature over the raw request body and
 * compares it to the one GitHub sent. Uses a timing-safe comparison so an
 * attacker can't infer the correct signature byte-by-byte via response
 * timing differences.
 */
function isValidSignature(rawBody: Buffer, signatureHeader: string | undefined): boolean {
  if (!signatureHeader) return false;

  const expected =
    "sha256=" + crypto.createHmac("sha256", WEBHOOK_SECRET!).update(rawBody).digest("hex");

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signatureHeader);

  // Buffers of different lengths would make timingSafeEqual throw, so bail
  // out early rather than let that become an unhandled error.
  if (expectedBuffer.length !== receivedBuffer.length) return false;

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

interface GithubPushPayload {
  ref: string;
  repository: { full_name: string };
}

// express.raw() (not express.json()) preserves the exact raw bytes needed
// for signature verification — see the explanation in chat. This is scoped
// to just this one route via a route-level middleware argument, so it has
// no effect on any other route in the app regardless of what global body
// parsers are set up in index.ts.
webhookRouter.post(
  "/webhooks/github",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const rawBody = req.body as Buffer;
    const signature = req.header("X-Hub-Signature-256");

    if (!isValidSignature(rawBody, signature)) {
      console.warn("[webhook] Rejected request with invalid signature.");
      res.status(401).json({ error: "Invalid signature." });
      return;
    }

    const event = req.header("X-GitHub-Event");

    // GitHub sends a "ping" event once, right when the webhook is first
    // created, just to confirm the endpoint is reachable — no payload to act on.
    if (event === "ping") {
      res.status(200).json({ message: "pong" });
      return;
    }

    if (event !== "push") {
      // Not an error — just an event type we don't care about. Acknowledge
      // it so GitHub doesn't retry, but do nothing further.
      res.status(200).json({ message: `Ignored event: ${event}` });
      return;
    }

    const payload = JSON.parse(rawBody.toString()) as GithubPushPayload;

    const expectedRepo = `${GITHUB_OWNER}/${GITHUB_REPO}`;
    if (payload.repository.full_name !== expectedRepo) {
      console.warn(
        `[webhook] Ignored push from unexpected repo: ${payload.repository.full_name}`
      );
      res.status(200).json({ message: "Ignored: unexpected repository." });
      return;
    }

    // Respond to GitHub immediately — it expects a fast response and will
    // treat a timeout as a delivery failure. The actual sync can take a few
    // seconds (fetching every markdown file), so it runs after responding
    // rather than making GitHub wait for it.
    res.status(202).json({ message: "Sync started." });

    try {
      await syncVaultFromGithub();
    } catch (err) {
      console.error("[webhook] Sync failed:", err);
    }
  }
);