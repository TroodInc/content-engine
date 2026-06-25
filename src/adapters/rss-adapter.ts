import { randomUUID } from "node:crypto";
import type { BaseAdapter, AdapterConfig, ScrapedItem } from "./types.js";

interface RssItem {
  title?: string;
  link?: string;
  guid?: string;
  description?: string;
  content?: string;
  pubDate?: string;
  "content:encoded"?: string;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function parseRssDate(dateStr: string | undefined): number | undefined {
  if (!dateStr) return undefined;
  const ts = Date.parse(dateStr);
  return Number.isNaN(ts) ? undefined : ts;
}

export class RssAdapter implements BaseAdapter {
  constructor(private readonly config: AdapterConfig) {}

  async scrape(): Promise<ScrapedItem[]> {
    const res = await fetch(this.config.url, {
      headers: { "User-Agent": "content-engine/1.0 (RSS reader)" },
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) {
      throw new Error(`RSS fetch failed: ${res.status} ${res.statusText}`);
    }

    const xml = await res.text();
    const items = this.parseItems(xml);

    return items.map((item): ScrapedItem => {
      const url = item.link?.trim() ?? "";
      const rawContent = item["content:encoded"] ?? item.content ?? item.description ?? "";
      const content = stripHtml(rawContent);
      const summary = content.slice(0, 500) || undefined;

      return {
        externalId: (item.guid?.trim() ?? item.link?.trim()) ?? randomUUID(),
        url,
        title: stripHtml(item.title ?? url),
        content: content || (item.title ?? ""),
        summary,
        publishedAt: parseRssDate(item.pubDate),
      };
    }).filter((item) => item.url && item.title);
  }

  private parseItems(xml: string): RssItem[] {
    const items: RssItem[] = [];
    const itemMatches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);

    for (const match of itemMatches) {
      const block = match[1];
      items.push({
        title: this.extractTag(block, "title"),
        link: this.extractTag(block, "link"),
        guid: this.extractTag(block, "guid"),
        description: this.extractTag(block, "description"),
        "content:encoded": this.extractTag(block, "content:encoded"),
        pubDate: this.extractTag(block, "pubDate"),
      });
    }

    return items;
  }

  private extractTag(xml: string, tag: string): string | undefined {
    const escaped = tag.replace(":", "\\:");
    const cdataMatch = xml.match(new RegExp(`<${escaped}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${escaped}>`));
    if (cdataMatch) return cdataMatch[1].trim();
    const plainMatch = xml.match(new RegExp(`<${escaped}[^>]*>([\\s\\S]*?)</${escaped}>`));
    if (plainMatch) return plainMatch[1].trim();
    return undefined;
  }
}
