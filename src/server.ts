import "dotenv/config";
import express from "express";
import cors from "cors";
import { normalizeTelegramChannelReference } from "@contentengine/telegram-channel-reader";
import { TopicMemoryDB } from "@contentengine/topic-memory-db";
import { loadConfig } from "./config.js";
import {
  ArticlePublisherClaw,
  ArticleWriterClaw,
  PublicationSchedulerClaw,
  TelegramAnalyzerClaw,
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
