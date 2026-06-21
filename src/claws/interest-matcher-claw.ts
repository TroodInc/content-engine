import type { ContentEngineRuntime } from "../runtime.js";

export interface InterestMatcherResult {
  articlesScored: number;
  linksCreated: number;
  errors: string[];
}

const SCORE_THRESHOLD = 0.35;

export class InterestMatcherClaw {
  constructor(private readonly runtime: ContentEngineRuntime) {}

  async matchAll(): Promise<InterestMatcherResult> {
    const result: InterestMatcherResult = { articlesScored: 0, linksCreated: 0, errors: [] };

    const [articles, interests] = await Promise.all([
      this.runtime.topicMemory.getArticlesWithoutInterestScores(),
      this.runtime.topicMemory.getAllInterests(),
    ]);

    if (interests.length === 0 || articles.length === 0) return result;

    for (const article of articles) {
      try {
        const embedding = await this.runtime.topicMemory.getEmbeddingByArticleId(article.id);
        if (!embedding) continue;

        for (const interest of interests) {
          const score = this.runtime.semanticUtils.similarity(embedding.embedding, interest.embedding);
          if (score >= SCORE_THRESHOLD) {
            await this.runtime.topicMemory.upsertArticleInterest({
              articleId: article.id,
              interestId: interest.id,
              score,
            });
            result.linksCreated++;
          }
        }

        result.articlesScored++;
      } catch (err) {
        result.errors.push(`article ${article.id}: ${err}`);
      }
    }

    return result;
  }
}
