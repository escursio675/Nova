import "dotenv/config";
import { connectDB } from "./db.js";
import { syncVaultFromGithub } from "./services/githubImport.js";

async function main() {
  await connectDB();
  await syncVaultFromGithub();
  process.exit(0);
}

main();