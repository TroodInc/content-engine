import type { StoredSource } from "@contentengine/topic-memory-db";
import { createAdapter } from "../adapters/index.js";
import { TelegramAdapter } from "../adapters/telegram-adapter.js";
import type { ContentEngineRuntime } from "../runtime.js";

export interface IngestClawResult {
  sourcesProcessed: number;
  articlesInserted: number;
  duplicates: number;
  errors: string[];
}

export class IngestClaw {
  constructor(private readonly runtime: ContentEngineRuntime) {}

  async ingestAll(): Promise<IngestClawResult> {
    const sources = await this.runtime.topicMemory.getAllSources();
    const result: IngestClawResult = {
      sourcesProcessed: 0,
      articlesInserted: 0,
      duplicates: 0,
      errors: [],
    };

    for (const source of sources) {
      const r = await this.ingestSource(source);
      result.sourcesProcessed++;
      result.articlesInserted += r.inserted;
      result.duplicates += r.duplicates;
      result.errors.push(...r.errors);
    }

    return result;
  }

  async ingestSource(source: StoredSource): Promise<{ inserted: number; duplicates: number; errors: string[] }> {
    const errors: string[] = [];
    let inserted = 0;
    let duplicates = 0;

    try {
      const adapterConfig = {
        id: source.id,
        name: source.name,
        url: source.url,
        adapterType: source.adapterType,
        adapterConfig: source.adapterConfig,
      };
      const adapter = createAdapter(adapterConfig);

      // For Telegram, pass the persisted last-seen message ID
      let items;
      if (adapter instanceof TelegramAdapter) {
        const stateKey = `telegram_last_id:${source.id}`;
        const lastIdStr = await this.runtime.topicMemory.getState(stateKey);
        const sinceId = lastIdStr ? parseInt(lastIdStr, 10) : 0;
        items = await (adapter as TelegramAdapter).scrape({ sinceId });
        // Persist the highest seen ID from the new items
        const maxId = items.reduce((max, item) => {
          const msgId = parseInt(item.externalId.split(":")[0], 10);
          return msgId > max ? msgId : max;
        }, sinceId);
        if (maxId > sinceId) {
          await this.runtime.topicMemory.setState(stateKey, String(maxId));
        }
      } else {
        items = await adapter.scrape();
      }

      for (const item of items) {
        try {
          const isDup = await this.runtime.topicMemory.hasArticleByExternalId(source.id, item.externalId);
          if (isDup) {
            duplicates++;
            continue;
          }

          const article = await this.runtime.topicMemory.insertArticle({
            sourceId: source.id,
            externalId: item.externalId,
            url: item.url,
            title: item.title,
            content: item.content,
            summary: item.summary,
            wordCount: item.content.split(/\s+/).length,
            publishedAt: item.publishedAt,
          });

          if (article) {
            // Generate and store embedding
            const embeddingText = `${article.title}\n\n${article.summary ?? article.content.slice(0, 1000)}`;
            const embeddingResult = await this.runtime.semanticUtils.embed(embeddingText);
            await this.runtime.topicMemory.insertEmbedding({
              articleId: article.id,
              embedding: embeddingResult.embedding,
              model: embeddingResult.model,
            });
            inserted++;
          } else {
            duplicates++;
          }
        } catch (err) {
          errors.push(`[${source.name}] item ${item.externalId}: ${err}`);
        }
      }

      await this.runtime.topicMemory.touchSourceIngestedAt(source.id);
    } catch (err) {
      errors.push(`[${source.name}] scrape failed: ${err}`);
    }

    return { inserted, duplicates, errors };
  }
}
