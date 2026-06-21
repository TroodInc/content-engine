// Stub declarations for @contentengine/* workspace packages.
// These packages live in sibling repositories and are not available in CI.
// Classes accept any constructor args and expose an any-typed index signature
// so all method calls and type annotations compile without errors.

declare module '@contentengine/topic-memory-db' {
  export type ArticleExtractionJob = any;
  export type ArticleFeedback = any;
  export type ArticleInterest = any;
  export type ContentPlanItem = any;
  export type DraftArticle = any;
  export type PublishedArticle = any;
  export type StoredArticle = any;
  export type StoredEmbedding = any;
  export type StoredInterest = any;
  export type StoredPost = any;
  export type StoredSource = any;
  export type StoredTopic = any;
  export type TopicArticleLink = any;
  export declare class TopicMemoryDB {
    constructor(...args: any[]);
    [key: string]: any;
  }
}

declare module '@contentengine/telegram-channel-reader' {
  export type TelegramPost = any;
  export type TelegramReaderConfig = any;
  export declare class TelegramChannelReader {
    constructor(...args: any[]);
    [key: string]: any;
  }
  export declare function normalizeTelegramChannelReference(...args: any[]): any;
}

declare module '@contentengine/semantic-skills' {
  export type Cluster = any;
  export type EmbeddingResult = any;
  export type EmbeddingServiceConfig = any;
  export declare class EmbeddingService {
    constructor(...args: any[]);
    [key: string]: any;
  }
  export declare function clusterEmbeddings(...args: any[]): any;
  export declare function cosineSimilarity(...args: any[]): any;
}

declare module '@contentengine/discourse-api-client' {
  export type DiscourseConfig = any;
  export type DiscourseTopic = any;
  export declare class DiscourseClient {
    constructor(...args: any[]);
    [key: string]: any;
  }
}

declare module '@contentengine/article-extractor' {
  export type ExtractedArticle = any;
  export type ExtractionOptions = any;
  export declare class ArticleExtractor {
    constructor(...args: any[]);
    [key: string]: any;
  }
}
