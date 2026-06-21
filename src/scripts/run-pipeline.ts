/**
 * Full pipeline runner — ingest all sources, then match interests.
 *
 * Designed to be called by a cron job or process manager every N hours.
 *
 * Usage:
 *   node dist/scripts/run-pipeline.js
 *
 * Exit codes:
 *   0 — success (partial errors are logged but don't fail the run)
 *   1 — fatal error (DB unreachable, config missing)
 */

import "dotenv/config";
import { TopicMemoryDB } from "@contentengine/topic-memory-db";
import { loadConfig } from "../config.js";
import { createRuntime } from "../runtime.js";
import { IngestClaw } from "../claws/ingest-claw.js";
import { InterestMatcherClaw } from "../claws/interest-matcher-claw.js";

async function main() {
  const config = loadConfig();
  const db = new TopicMemoryDB(config.db.connectionString);
  await db.init();

  const persistedSession = await db.getState("telegram_session");
  if (persistedSession && !config.telegram.session) {
    config.telegram.session = persistedSession;
  }

  const runtime = createRuntime(config, db);
  const ingestClaw = new IngestClaw(runtime);
  const matcherClaw = new InterestMatcherClaw(runtime);

  console.log(`[pipeline] ${new Date().toISOString()} — starting`);

  // Step 1: Ingest
  console.log("[pipeline] Ingesting sources…");
  const ingestResult = await ingestClaw.ingestAll();
  console.log(
    `[pipeline] Ingest complete: ${ingestResult.sourcesProcessed} sources, ` +
    `${ingestResult.articlesInserted} new articles, ` +
    `${ingestResult.duplicates} duplicates`
  );
  if (ingestResult.errors.length > 0) {
    console.warn("[pipeline] Ingest errors:");
    ingestResult.errors.forEach((e) => console.warn("  ", e));
  }

  // Step 2: Match interests
  console.log("[pipeline] Matching interests…");
  const matchResult = await matcherClaw.matchAll();
  console.log(
    `[pipeline] Match complete: ${matchResult.articlesScored} articles scored, ` +
    `${matchResult.linksCreated} interest links created`
  );
  if (matchResult.errors.length > 0) {
    console.warn("[pipeline] Match errors:");
    matchResult.errors.forEach((e) => console.warn("  ", e));
  }

  await db.close();
  console.log(`[pipeline] ${new Date().toISOString()} — done`);
}

main().catch((err) => {
  console.error("[pipeline] Fatal error:", err);
  process.exit(1);
});
