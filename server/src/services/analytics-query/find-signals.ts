import { sql, type SQL } from "drizzle-orm";
import type { Db } from "@fideliosai/db";
import { logger } from "../../middleware/logger.js";

export interface FindSignalsParams {
  articleId?: string;
  marketId?: string;
  signalQuality?: string;
  limit?: number;
  offset?: number;
}

export interface SignalResult {
  id: string;
  articleId: string | null;
  articleTitle: string | null;
  marketId: string | null;
  marketQuestion: string | null;
  similarityScore: string | null;
  timeDeltaHours: number | null;
  priceAtPublish: string | null;
  priceAtResolution: string | null;
  signalQuality: string | null;
  createdAt: string | null;
}

export async function findSignals(
  db: Db,
  params: FindSignalsParams,
): Promise<{ results: SignalResult[]; total: number }> {
  const { articleId, marketId, signalQuality, limit = 50, offset = 0 } = params;

  const filters = buildSignalConditions(articleId, marketId, signalQuality);

  const rows = await db.execute<{
    id: string;
    article_id: string | null;
    article_title: string | null;
    market_id: string | null;
    market_question: string | null;
    similarity_score: string | null;
    time_delta_hours: number | null;
    price_at_publish: string | null;
    price_at_resolution: string | null;
    signal_quality: string | null;
    created_at: string | null;
    total_count: number;
  }>(sql.join([
    sql`SELECT`,
    sql`  s.id, s.article_id, a.title AS article_title,`,
    sql`  s.market_id, m.question AS market_question,`,
    sql`  s.similarity_score, s.time_delta_hours,`,
    sql`  s.price_at_publish, s.price_at_resolution,`,
    sql`  s.signal_quality, s.created_at,`,
    sql`  COUNT(*) OVER () AS total_count`,
    sql`FROM analytics_signals s`,
    sql`LEFT JOIN analytics_articles a ON a.id = s.article_id`,
    sql`LEFT JOIN analytics_markets m ON m.id = s.market_id`,
    sql`WHERE TRUE`,
    ...filters.map((f) => sql`AND ${f}`),
    sql`ORDER BY s.created_at DESC`,
    sql`LIMIT ${limit} OFFSET ${offset}`,
  ], sql` `));

  const results: SignalResult[] = rows.map((r) => ({
    id: r.id,
    articleId: r.article_id,
    articleTitle: r.article_title,
    marketId: r.market_id,
    marketQuestion: r.market_question,
    similarityScore: r.similarity_score,
    timeDeltaHours: r.time_delta_hours,
    priceAtPublish: r.price_at_publish,
    priceAtResolution: r.price_at_resolution,
    signalQuality: r.signal_quality,
    createdAt: r.created_at,
  }));

  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

  logger.info({ articleId, marketId, resultCount: results.length }, "analytics-query: find-signals");

  return { results, total };
}

function buildSignalConditions(articleId?: string, marketId?: string, signalQuality?: string): SQL[] {
  const conditions: SQL[] = [];
  if (articleId) conditions.push(sql`s.article_id = ${articleId}`);
  if (marketId) conditions.push(sql`s.market_id = ${marketId}`);
  if (signalQuality) conditions.push(sql`s.signal_quality = ${signalQuality}`);
  return conditions;
}
