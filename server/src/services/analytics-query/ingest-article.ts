import type { Db } from "@fideliosai/db";
import { analyticsArticles } from "@fideliosai/db";
import { logger } from "../../middleware/logger.js";

export interface IngestArticleParams {
  title: string;
  content: string;
  publishedAt: string;
  source?: string;
  sourceUrl?: string;
  tags?: string[];
}

export interface IngestArticleResult {
  id: string;
  title: string;
  publishedAt: string;
}

export async function ingestArticle(
  db: Db,
  params: IngestArticleParams,
): Promise<IngestArticleResult> {
  const [inserted] = await db
    .insert(analyticsArticles)
    .values({
      title: params.title,
      content: params.content,
      publishedAt: new Date(params.publishedAt),
      source: params.source ?? null,
      sourceUrl: params.sourceUrl ?? null,
      tags: params.tags ?? null,
    })
    .returning({ id: analyticsArticles.id, title: analyticsArticles.title, publishedAt: analyticsArticles.publishedAt });

  logger.info({ id: inserted.id, title: inserted.title }, "analytics-query: article ingested");

  return {
    id: inserted.id,
    title: inserted.title,
    publishedAt: inserted.publishedAt.toISOString(),
  };
}
