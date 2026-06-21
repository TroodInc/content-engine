export interface ScrapedItem {
  externalId: string;
  url: string;
  title: string;
  content: string;
  summary?: string;
  publishedAt?: number;
}

export interface AdapterConfig {
  id: string;
  name: string;
  url: string;
  adapterType: string;
  adapterConfig: Record<string, unknown>;
}

export interface IngestResult {
  sourceId: string;
  sourceName: string;
  fetched: number;
  inserted: number;
  duplicates: number;
  errors: string[];
}

export interface BaseAdapter {
  scrape(): Promise<ScrapedItem[]>;
}
