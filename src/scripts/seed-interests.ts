/**
 * Seed interests into the database.
 *
 * Usage:
 *   node dist/scripts/seed-interests.js
 *
 * Reads OPENAI_API_KEY and DATABASE_URL from environment.
 * Each interest gets an embedding generated from its name + description.
 * Safe to re-run — uses upsert on slug.
 */

import "dotenv/config";
import OpenAI from "openai";
import { TopicMemoryDB } from "@contentengine/topic-memory-db";

const INTERESTS: Array<{ slug: string; name: string; description: string }> = [
  {
    slug: "sales-growth",
    name: "Sales Growth",
    description: "Strategies for increasing revenue, closing deals, B2B and B2C sales techniques, sales funnel optimization, CRM, cold outreach, and enterprise sales.",
  },
  {
    slug: "ai-agents",
    name: "AI Agents",
    description: "Autonomous AI agents, multi-agent systems, LLM tool use, agent frameworks, orchestration, AI automation pipelines, and agentic workflows.",
  },
  {
    slug: "startup-growth",
    name: "Startup Growth",
    description: "Product-market fit, fundraising, go-to-market strategy, early-stage growth, founder learnings, startup metrics, and scaling from zero to one.",
  },
  {
    slug: "developer-tools",
    name: "Developer Tools",
    description: "Software development tooling, IDEs, CI/CD, code review, developer productivity, APIs, SDKs, and engineering infrastructure.",
  },
  {
    slug: "product-management",
    name: "Product Management",
    description: "Product strategy, roadmap planning, user research, feature prioritization, PRDs, OKRs, and product-led growth.",
  },
  {
    slug: "community-building",
    name: "Community Building",
    description: "Online and offline community management, engagement strategies, Discourse, Discord, Telegram communities, and community-led growth.",
  },
  {
    slug: "hiring-talent",
    name: "Hiring & Talent",
    description: "Recruiting, talent acquisition, building engineering teams, compensation, onboarding, and remote work culture.",
  },
  {
    slug: "no-code-lowcode",
    name: "No-Code / Low-Code",
    description: "Visual development platforms, automation tools, no-code app builders, workflow automation, and Zapier-style integrations.",
  },
];

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  const dbUrl = process.env.DATABASE_URL;

  if (!apiKey) throw new Error("OPENAI_API_KEY required");
  if (!dbUrl) throw new Error("DATABASE_URL required");

  const db = new TopicMemoryDB(dbUrl);
  await db.init();

  // Skip if already seeded — avoids OpenAI calls on every restart
  const existing = await db.getAllInterests();
  const existingSlugs = new Set(existing.map((i: { slug: string }) => i.slug));
  const toSeed = INTERESTS.filter((i) => !existingSlugs.has(i.slug));

  if (toSeed.length === 0) {
    console.log("[seed:interests] Already seeded, skipping.");
    await db.close();
    return;
  }

  const openai = new OpenAI({ apiKey });
  console.log(`[seed:interests] Seeding ${toSeed.length} new interests…`);

  for (const interest of toSeed) {
    const input = `${interest.name}: ${interest.description}`;
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input,
    });
    const embedding = res.data[0].embedding;
    await db.upsertInterest({ ...interest, embedding });
    console.log(`  ✓ ${interest.slug}`);
  }

  await db.close();
  console.log("[seed:interests] Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
