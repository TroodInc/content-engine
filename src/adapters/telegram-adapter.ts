import { TelegramChannelReader, normalizeTelegramChannelReference } from "@contentengine/telegram-channel-reader";
import { ArticleExtractor } from "@contentengine/article-extractor";
import type { BaseAdapter, AdapterConfig, ScrapedItem } from "./types.js";

export interface TelegramAdapterConfig {
  apiId: number;
  apiHash: string;
  session?: string;
  channel: string;
  sinceStateKey?: string;   // key used to persist last-seen message ID
  limit?: number;
  extractionTimeoutMs?: number;
}

/**
 * Telegram channel adapter.
 *
 * Reads posts from a Telegram channel, extracts URLs from each post,
 * fetches full article content via ArticleExtractor, and returns one
 * ScrapedItem per successfully extracted URL.
 *
 * State (last-seen message ID) must be managed externally via the
 * sinceId option passed to scrape().
 */
export class TelegramAdapter implements BaseAdapter {
  private readonly telegramConfig: TelegramAdapterConfig;
  private reader: TelegramChannelReader | null = null;
  private extractor: ArticleExtractor;

  constructor(config: AdapterConfig) {
    this.telegramConfig = config.adapterConfig as unknown as TelegramAdapterConfig;
    this.extractor = new ArticleExtractor({
      timeout: this.telegramConfig.extractionTimeoutMs ?? 20_000,
      maxLength: 50_000,
    });
  }

  async scrape(options: { sinceId?: number } = {}): Promise<ScrapedItem[]> {
    const cfg = this.telegramConfig;
    const channel = normalizeTelegramChannelReference(cfg.channel);
    const sinceId = options.sinceId ?? 0;

    this.reader = new TelegramChannelReader({
      apiId: cfg.apiId,
      apiHash: cfg.apiHash,
      session: cfg.session,
      channel,
    });

    let posts;
    try {
      const result = await this.reader.fetchPosts(sinceId, cfg.limit ?? 100);
      posts = result.posts;
    } finally {
      await this.reader.disconnect().catch(() => {});
    }

    const items: ScrapedItem[] = [];

    for (const post of posts) {
      for (const url of post.urls) {
        try {
          const extracted = await this.extractor.run({ url });
          if (!extracted) continue;

          items.push({
            externalId: `${post.telegramId}:${url}`,
            url,
            title: extracted.title,
            content: extracted.content,
            summary: extracted.description,
            publishedAt: post.date * 1000,
          });
        } catch {
          // skip unextractable URLs silently
        }
      }
    }

    return items;
  }
}
