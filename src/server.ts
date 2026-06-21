import "dotenv/config";
import express from "express";
import cors from "cors";
import cron from "node-cron";
// normalizeTelegramChannelReference inlined from telegram-channel-reader (not exported in standalone pkg)
function normalizeTelegramChannelReference(channel: string): string {
  const trimmed = channel.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.hostname !== "t.me" && parsed.hostname !== "telegram.me") return trimmed;
      const segments = parsed.pathname.split("/").filter(Boolean);
      if (segments.length === 0) return trimmed;
      if (segments[0] === "c" && segments.length >= 2) {
        const id = segments[1];
        return /^\d+$/.test(id) ? `-100${id}` : id;
      }
      return segments[0];
    } catch { return trimmed; }
  }
  return trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
}
import { TopicMemoryDB } from "@contentengine/topic-memory-db";
import { loadConfig } from "./config.js";
import {
  ArticlePublisherClaw,
  ArticleWriterClaw,
  PublicationSchedulerClaw,
  TelegramAnalyzerClaw,
  IngestClaw,
  InterestMatcherClaw,
} from "./claws/index.js";
import { createRuntime } from "./runtime.js";

const PORT = Number(process.env.API_PORT) || 3001;

async function start() {
  const config = loadConfig();

  const db = new TopicMemoryDB(config.db.connectionString);
  await db.init();

  const persistedSession = await db.getState("telegram_session");
  if (persistedSession && !config.telegram.session) {
    config.telegram.session = persistedSession;
  }

  const channel = normalizeTelegramChannelReference(config.telegram.channel);
  const runtime = createRuntime(config, db);

  const analyzerClaw = new TelegramAnalyzerClaw(runtime, channel);
  const schedulerClaw = new PublicationSchedulerClaw(runtime);
  const writerClaw = new ArticleWriterClaw(runtime);
  const publisherClaw = new ArticlePublisherClaw(runtime, config.discourse.categoryId);
  const ingestClaw = new IngestClaw(runtime);
  const matcherClaw = new InterestMatcherClaw(runtime);

  const app = express();
  app.use(cors());
  app.use(express.json());

  // --- Pipeline action endpoints ---

  app.post("/api/analyze", async (_req, res) => {
    try {
      const result = await analyzerClaw.analyze();
      res.json({
        posts_read: result.newPosts,
        signals_extracted: result.newArticles,
      });
    } catch (err) {
      res.status(500).json({ error: true, message: String(err) });
    }
  });

  app.post("/api/schedule", async (_req, res) => {
    try {
      const result = await schedulerClaw.schedule();
      res.json({
        topics_reviewed: result.totalDraft,
        articles_planned: result.scheduled.length,
      });
    } catch (err) {
      res.status(500).json({ error: true, message: String(err) });
    }
  });

  app.post("/api/write", async (req, res) => {
    try {
      const query: string | undefined =
        typeof req.body?.query === "string" ? req.body.query.trim() || undefined : undefined;
      const result = await writerClaw.write(query ? { topicQuery: query } : undefined);
      const first = result.drafts[0];
      res.json({
        draft_id: first?.id ?? null,
        title: first?.title ?? null,
        drafts_written: result.drafts.length,
      });
    } catch (err) {
      res.status(500).json({ error: true, message: String(err) });
    }
  });

  app.post("/api/publish", async (_req, res) => {
    try {
      const result = await publisherClaw.publish();
      res.json({ published: result.published, failed: result.failed });
    } catch (err) {
      res.status(500).json({ error: true, message: String(err) });
    }
  });

  // --- Ingest & match endpoints ---

  app.post("/api/ingest", async (_req, res) => {
    try {
      const result = await ingestClaw.ingestAll();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: true, message: String(err) });
    }
  });

  app.post("/api/match", async (_req, res) => {
    try {
      const result = await matcherClaw.matchAll();
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: true, message: String(err) });
    }
  });

  // --- Feed API ---

  app.get("/api/interests", async (_req, res) => {
    try {
      const interests = await runtime.topicMemory.getAllInterests();
      res.json(interests.map((i) => ({ id: i.id, slug: i.slug, name: i.name, description: i.description })));
    } catch (err) {
      res.status(500).json({ error: true, message: String(err) });
    }
  });

  app.get("/api/feed", async (req, res) => {
    try {
      const slug = typeof req.query.interest === "string" ? req.query.interest : undefined;
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
      const offset = Math.max(0, Number(req.query.offset) || 0);
      const userId = typeof req.query.user_id === "string" ? req.query.user_id : undefined;

      if (!slug) {
        res.status(400).json({ error: true, message: "interest param required" });
        return;
      }

      const interest = await runtime.topicMemory.getInterestBySlug(slug);
      if (!interest) {
        res.status(404).json({ error: true, message: `Interest not found: ${slug}` });
        return;
      }

      const articles = await runtime.topicMemory.getFeedForInterest(interest.id, { limit, offset, userId });
      res.json(articles.map((a) => ({
        id: a.id,
        title: a.title,
        summary: a.summary ?? null,
        url: a.url,
        published_at: a.publishedAt ?? null,
        score: a.score,
      })));
    } catch (err) {
      res.status(500).json({ error: true, message: String(err) });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      const { user_id, article_id, interest_id, signal } = req.body as Record<string, unknown>;
      if (typeof user_id !== "string" || typeof article_id !== "string") {
        res.status(400).json({ error: true, message: "user_id and article_id required" });
        return;
      }
      if (!["like", "less", "skip"].includes(signal as string)) {
        res.status(400).json({ error: true, message: "signal must be like, less, or skip" });
        return;
      }
      await runtime.topicMemory.insertFeedback({
        userId: user_id,
        articleId: article_id,
        interestId: typeof interest_id === "string" ? interest_id : undefined,
        signal: signal as "like" | "less" | "skip",
      });
      res.json({ ok: true });
    } catch (err) {
      res.status(500).json({ error: true, message: String(err) });
    }
  });

  // --- Sources admin ---

  app.get("/api/sources", async (_req, res) => {
    try {
      const sources = await runtime.topicMemory.getAllSources();
      res.json(sources.map((s) => ({
        id: s.id,
        name: s.name,
        url: s.url,
        adapter_type: s.adapterType,
        interest_ids: s.interestIds,
        last_ingested_at: s.lastIngestedAt ?? null,
      })));
    } catch (err) {
      res.status(500).json({ error: true, message: String(err) });
    }
  });

  app.post("/api/sources", async (req, res) => {
    try {
      const { name, url, adapter_type, adapter_config, interest_ids } = req.body as Record<string, unknown>;
      if (typeof name !== "string" || typeof url !== "string" || typeof adapter_type !== "string") {
        res.status(400).json({ error: true, message: "name, url, adapter_type required" });
        return;
      }
      const source = await runtime.topicMemory.upsertSource({
        name,
        url,
        adapterType: adapter_type,
        adapterConfig: (adapter_config as Record<string, unknown>) ?? {},
        interestIds: Array.isArray(interest_ids) ? (interest_ids as string[]) : [],
      });
      res.json(source);
    } catch (err) {
      res.status(500).json({ error: true, message: String(err) });
    }
  });

  // --- Data read endpoints ---

  app.get("/api/topics", async (_req, res) => {
    try {
      const topics = await runtime.topicMemory.getAllTopics();
      const articleIds = await Promise.all(
        topics.map((t) => runtime.topicMemory.getTopicArticleIds(t.id))
      );
      res.json(
        topics.map((t, i) => ({
          id: t.id,
          name: t.name ?? "",
          description: t.description ?? "",
          article_count: articleIds[i].length,
          created_at: (t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt))
            .toISOString()
            .slice(0, 10),
        }))
      );
    } catch (err) {
      res.status(500).json({ error: true, message: String(err) });
    }
  });

  app.get("/api/drafts", async (_req, res) => {
    try {
      const [draftItems, readyItems, publishedItems] = await Promise.all([
        runtime.topicMemory.getDraftArticlesByStatus("draft"),
        runtime.topicMemory.getDraftArticlesByStatus("ready"),
        runtime.topicMemory.getDraftArticlesByStatus("published"),
      ]);
      const all = [...draftItems, ...readyItems, ...publishedItems].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      res.json(
        all.map((d) => ({
          id: d.id,
          title: d.title,
          status: d.status,
          created_at: (d.createdAt instanceof Date ? d.createdAt : new Date(d.createdAt))
            .toISOString()
            .slice(0, 10),
          topic_name: d.topicName ?? "",
        }))
      );
    } catch (err) {
      res.status(500).json({ error: true, message: String(err) });
    }
  });

  app.listen(PORT, () => {
    console.log(`Content Engine API listening on http://localhost:${PORT}`);
  });

  // Daily pipeline: ingest all sources then match interests (midnight UTC)
  cron.schedule("0 0 * * *", async () => {
    console.log(`[cron] ${new Date().toISOString()} — starting daily pipeline`);
    try {
      const ingestResult = await ingestClaw.ingestAll();
      console.log(`[cron] ingest: ${ingestResult.articlesInserted} new, ${ingestResult.duplicates} dupes`);
      if (ingestResult.errors.length) ingestResult.errors.forEach(e => console.warn("[cron]", e));

      const matchResult = await matcherClaw.matchAll();
      console.log(`[cron] match: ${matchResult.articlesScored} scored, ${matchResult.linksCreated} links`);
      if (matchResult.errors.length) matchResult.errors.forEach(e => console.warn("[cron]", e));
    } catch (err) {
      console.error("[cron] pipeline failed:", err);
    }
  });

  // Graceful shutdown
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, async () => {
      console.log(`\nShutting down (${signal})…`);
      await analyzerClaw.close();
      await db.close();
      process.exit(0);
    });
  }
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
