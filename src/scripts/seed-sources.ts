/**
 * Seed content sources into the database.
 *
 * Usage:
 *   node dist/scripts/seed-sources.js
 *
 * Reads DATABASE_URL, and Telegram credentials from environment.
 * Safe to re-run — uses upsert on URL.
 *
 * interest_ids must match slugs already seeded by seed-interests.ts.
 * This script resolves slugs → UUIDs at runtime.
 */

import "dotenv/config";
import { TopicMemoryDB } from "@contentengine/topic-memory-db";

interface SourceSeed {
  name: string;
  url: string;
  adapterType: "rss" | "telegram";
  adapterConfig: Record<string, unknown>;
  interestSlugs: string[];
}

function getSources(): SourceSeed[] {
  const telegramApiId = process.env.TELEGRAM_API_ID;
  const telegramApiHash = process.env.TELEGRAM_API_HASH;
  const telegramSession = process.env.TELEGRAM_SESSION;
  const communityChannel = process.env.TELEGRAM_COMMUNITY_CHANNEL ?? process.env.TELEGRAM_CHANNEL;

  const sources: SourceSeed[] = [
    // --- RSS sources ---
    {
      name: "Hacker News (Show HN & Ask HN)",
      url: "https://hnrss.org/newest?q=startup+OR+AI+OR+developer",
      adapterType: "rss",
      adapterConfig: {},
      interestSlugs: ["ai-agents", "startup-growth", "developer-tools"],
    },
    {
      name: "Product Hunt Daily",
      url: "https://www.producthunt.com/feed?category=undefined",
      adapterType: "rss",
      adapterConfig: {},
      interestSlugs: ["startup-growth", "developer-tools", "no-code-lowcode", "product-management"],
    },
    {
      name: "First Round Review",
      url: "https://review.firstround.com/rss.xml",
      adapterType: "rss",
      adapterConfig: {},
      interestSlugs: ["startup-growth", "hiring-talent", "product-management", "sales-growth"],
    },
    {
      name: "Lenny's Newsletter",
      url: "https://www.lennysnewsletter.com/feed",
      adapterType: "rss",
      adapterConfig: {},
      interestSlugs: ["product-management", "startup-growth", "community-building"],
    },
    {
      name: "SaaStr Blog",
      url: "https://www.saastr.com/feed/",
      adapterType: "rss",
      adapterConfig: {},
      interestSlugs: ["sales-growth", "startup-growth"],
    },
    {
      name: "Simon Willison's Blog (AI)",
      url: "https://simonwillison.net/atom/everything/",
      adapterType: "rss",
      adapterConfig: {},
      interestSlugs: ["ai-agents", "developer-tools"],
    },
  ];

  // Telegram community feed — only add if credentials are present
  if (telegramApiId && telegramApiHash && communityChannel) {
    sources.push({
      name: "Trood Community Telegram",
      url: `telegram://${communityChannel}`,
      adapterType: "telegram",
      adapterConfig: {
        apiId: parseInt(telegramApiId, 10),
        apiHash: telegramApiHash,
        session: telegramSession ?? "",
        channel: communityChannel,
        limit: 200,
        extractionTimeoutMs: 20000,
      },
      interestSlugs: [
        "ai-agents",
        "startup-growth",
        "developer-tools",
        "community-building",
        "sales-growth",
        "product-management",
      ],
    });
  } else {
    console.warn(
      "Skipping Telegram community source — set TELEGRAM_API_ID, TELEGRAM_API_HASH, and TELEGRAM_COMMUNITY_CHANNEL to include it."
    );
  }

  return sources;
}

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL required");

  const db = new TopicMemoryDB(dbUrl);
  await db.init();

  const allInterests = await db.getAllInterests();

  // Can't seed sources without interests — interests must be seeded first
  if (allInterests.length === 0) {
    console.warn("[seed:sources] No interests found — run seed:interests first.");
    await db.close();
    return;
  }

  const slugToId = new Map(allInterests.map((i: { slug: string; id: string }) => [i.slug, i.id]));
  const existingSources = await db.getAllSources();
  const existingUrls = new Set(existingSources.map((s: { url: string }) => s.url));

  const sources = getSources();
  const toSeed = sources.filter((s) => !existingUrls.has(s.url));

  if (toSeed.length === 0) {
    console.log("[seed:sources] Already seeded, skipping.");
    await db.close();
    return;
  }

  console.log(`[seed:sources] Seeding ${toSeed.length} new sources…`);

  for (const src of toSeed) {
    const interestIds = src.interestSlugs
      .map((s) => slugToId.get(s))
      .filter((id): id is string => {
        if (!id) console.warn(`  ! Unknown interest slug: ${src.interestSlugs.find(sl => !slugToId.has(sl))}`);
        return !!id;
      });

    await db.upsertSource({
      name: src.name,
      url: src.url,
      adapterType: src.adapterType,
      adapterConfig: src.adapterConfig,
      interestIds,
    });
    console.log(`  ✓ ${src.name} [${interestIds.length} interests]`);
  }

  await db.close();
  console.log("[seed:sources] Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
