import mongoose from "mongoose";

/**
 * Connects to MongoDB once and reuses the connection across the app.
 */
export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to your .env file — see .env.example."
    );
  }

  try {
    await mongoose.connect(uri);
    console.log("[db] Connected to MongoDB");
  } catch (err) {
    console.error("[db] Failed to connect to MongoDB:", err);
    // Exit rather than let the server run with a broken DB connection —
    // every route depends on it, so there's no useful degraded mode here.
    process.exit(1);
  }
}