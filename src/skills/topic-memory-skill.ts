import { TopicMemoryDB } from "@contentengine/topic-memory-db";
import type {
  ArticleExtractionJob,
  ArticleFeedback,
  ArticleInterest,
  ContentPlanItem,
  DraftArticle,
  PublishedArticle,
  StoredArticle,
  StoredEmbedding,
  StoredInterest,
  StoredPost,
  StoredSource,
  StoredTopic,
  TopicArticleLink,
} from "@contentengine/topic-memory-db";
import type { ContentEngineSkill } from "./skill.js";

export interface TopicMemorySkillInput {
  operation: string;
}

export class TopicMemorySkill implements ContentEngineSkill<TopicMemorySkillInput, unknown> {
  readonly name = "topic_memory";
  readonly description = "Persist and retrieve semantic knowledge, plans, drafts, and publication state.";

  constructor(private readonly db: TopicMemoryDB) {}

  async run(): Promise<unknown> {
    return null;
  }

  async hasPost(telegramId: number, channelId: string): Promise<boolean> {
    return this.db.hasPost(telegramId, channelId);
  }

  async insertPost(post: Omit<StoredPost, "id" | "processedAt">): Promise<StoredPost | null> {
    return this.db.insertPost(post);
  }

  async getPostByTelegramId(telegramId: number, channelId: string): Promise<StoredPost | null> {
    return this.db.getPostByTelegramId(telegramId, channelId);
  }

  async hasArticle(url: string): Promise<boolean> {
    return this.db.hasArticle(url);
  }

  async insertArticle(article: Omit<StoredArticle, "id" | "processedAt">): Promise<StoredArticle | null> {
    return this.db.insertArticle(article);
  }

  async getArticleById(id: string): Promise<StoredArticle | null> {
    return this.db.getArticleById(id);
  }

  async getAllArticles(): Promise<StoredArticle[]> {
    return this.db.getAllArticles();
  }

  async enqueueArticleExtractionJob(job: Pick<ArticleExtractionJob, "url" | "postId">): Promise<void> {
    await this.db.enqueueArticleExtractionJob(job);
  }

  async getPendingArticleExtractionJobs(limit = 100): Promise<ArticleExtractionJob[]> {
    return this.db.getPendingArticleExtractionJobs(limit);
  }

  async recordArticleExtractionFailure(url: string, lastError: string): Promise<void> {
    await this.db.recordArticleExtractionFailure(url, lastError);
  }

  async completeArticleExtractionJob(url: string): Promise<void> {
    await this.db.completeArticleExtractionJob(url);
  }

  async getArticlesWithoutEmbeddings(): Promise<StoredArticle[]> {
    return this.db.getArticlesWithoutEmbeddings();
  }

  async insertEmbedding(embedding: Omit<StoredEmbedding, "id" | "createdAt">): Promise<StoredEmbedding> {
    return this.db.insertEmbedding(embedding);
  }

  async getAllEmbeddings(): Promise<StoredEmbedding[]> {
    return this.db.getAllEmbeddings();
  }

  async getEmbeddingByArticleId(articleId: string): Promise<StoredEmbedding | null> {
    return this.db.getEmbeddingByArticleId(articleId);
  }

  async findNearestEmbeddings(
    queryEmbedding: number[],
    k = 5
  ): Promise<Array<StoredEmbedding & { distance: number }>> {
    return this.db.findNearestEmbeddings(queryEmbedding, k);
  }

  async upsertTopic(topic: Omit<StoredTopic, "createdAt" | "updatedAt">): Promise<StoredTopic> {
    return this.db.upsertTopic(topic);
  }

  async getAllTopics(): Promise<StoredTopic[]> {
    return this.db.getAllTopics();
  }

  async linkArticleToTopic(link: TopicArticleLink): Promise<void> {
    await this.db.linkArticleToTopic(link);
  }

  async getTopicArticleIds(topicId: string): Promise<string[]> {
    return this.db.getTopicArticleIds(topicId);
  }

  async insertContentPlanItem(
    item: Omit<ContentPlanItem, "id" | "createdAt" | "updatedAt">
  ): Promise<ContentPlanItem> {
    return this.db.insertContentPlanItem(item);
  }

  async updateContentPlanStatus(id: string, status: ContentPlanItem["status"]): Promise<void> {
    await this.db.updateContentPlanStatus(id, status);
  }

  async updateContentPlanItem(
    id: string,
    updates: Partial<Pick<ContentPlanItem, "status" | "priority" | "humanComment" | "scheduledDate">>
  ): Promise<void> {
    await this.db.updateContentPlanItem(id, updates);
  }

  async getContentPlanByStatus(status: ContentPlanItem["status"]): Promise<ContentPlanItem[]> {
    return this.db.getContentPlanByStatus(status);
  }

  async getAllContentPlan(): Promise<ContentPlanItem[]> {
    return this.db.getAllContentPlan();
  }

  async insertDraftArticle(
    article: Omit<DraftArticle, "id" | "createdAt" | "updatedAt">
  ): Promise<DraftArticle> {
    return this.db.insertDraftArticle(article);
  }

  async getDraftArticleByContentPlanId(contentPlanId: string): Promise<DraftArticle | null> {
    return this.db.getDraftArticleByContentPlanId(contentPlanId);
  }

  async getDraftArticlesByStatus(status: DraftArticle["status"]): Promise<DraftArticle[]> {
    return this.db.getDraftArticlesByStatus(status);
  }

  async updateDraftArticleStatus(id: string, status: DraftArticle["status"]): Promise<void> {
    await this.db.updateDraftArticleStatus(id, status);
  }

  async insertPublishedArticle(
    article: Omit<PublishedArticle, "id" | "publishedAt">
  ): Promise<PublishedArticle> {
    return this.db.insertPublishedArticle(article);
  }

  async getPublishedArticles(): Promise<PublishedArticle[]> {
    return this.db.getPublishedArticles();
  }

  async getState(key: string): Promise<string | null> {
    return this.db.getState(key);
  }

  async setState(key: string, value: string): Promise<void> {
    await this.db.setState(key, value);
  }

  // --- Sources ---

  async upsertSource(source: Omit<StoredSource, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<StoredSource> {
    return this.db.upsertSource(source);
  }

  async getSourceById(id: string): Promise<StoredSource | null> {
    return this.db.getSourceById(id);
  }

  async getAllSources(): Promise<StoredSource[]> {
    return this.db.getAllSources();
  }

  async touchSourceIngestedAt(id: string): Promise<void> {
    await this.db.touchSourceIngestedAt(id);
  }

  async hasArticleByExternalId(sourceId: string, externalId: string): Promise<boolean> {
    return this.db.hasArticleByExternalId(sourceId, externalId);
  }

  // --- Interests ---

  async upsertInterest(interest: Omit<StoredInterest, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<StoredInterest> {
    return this.db.upsertInterest(interest);
  }

  async getAllInterests(): Promise<StoredInterest[]> {
    return this.db.getAllInterests();
  }

  async getInterestBySlug(slug: string): Promise<StoredInterest | null> {
    return this.db.getInterestBySlug(slug);
  }

  // --- Article–Interest matching ---

  async upsertArticleInterest(link: ArticleInterest): Promise<void> {
    await this.db.upsertArticleInterest(link);
  }

  async getArticlesWithoutInterestScores(): Promise<StoredArticle[]> {
    return this.db.getArticlesWithoutInterestScores();
  }

  async getFeedForInterest(
    interestId: string,
    options: { limit?: number; offset?: number; userId?: string } = {}
  ): Promise<Array<StoredArticle & { score: number }>> {
    return this.db.getFeedForInterest(interestId, options);
  }

  // --- Feedback ---

  async insertFeedback(feedback: Omit<ArticleFeedback, "id" | "createdAt">): Promise<void> {
    await this.db.insertFeedback(feedback);
  }
}
