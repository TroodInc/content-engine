import { RssAdapter } from "./rss-adapter.js";
import type { AdapterConfig, BaseAdapter } from "./types.js";

export function createAdapter(config: AdapterConfig): BaseAdapter {
  switch (config.adapterType) {
    case "rss":
      return new RssAdapter(config);
    default:
      throw new Error(`Unknown adapter type: ${config.adapterType}`);
  }
}

export type { BaseAdapter, AdapterConfig, ScrapedItem, IngestResult } from "./types.js";
