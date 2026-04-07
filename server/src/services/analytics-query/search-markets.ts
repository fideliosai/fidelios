import { sql, type SQL } from "drizzle-orm";
import type { Db } from "@fideliosai/db";
import { getQueryEmbedding } from "./embed.js";
import { logger } from "../../middleware/logger.js";

export interface SearchMarketsParams {
  query: string;
  limit?: number;
  offset?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export interface MarketSearchResult {
  id: string;
  externalId: string | null;
  question: string;
  description: string | null;
  category: string | null;
  outcome: string | null;
  outcomePrices: unknown;
  closedAt: string | null;
  createdAt: string | null;
  volumeTotal: string | null;
  score: number;
}

export async function searchMarkets(
  db: Db,
  params: SearchMarketsParams,
): Promise<{ results: MarketSearchResult[]; total: number }> {
  const { query, limit = 20, offset = 0, category, startDate, endDate } = params;

  const embedding = await getQueryEmbedding(query);

  if (!embedding) {
    logger.warn("analytics-query: no embedding for market search, returning empty");
    return { results: [], total: 0 };
  }

  const vectorStr = `[${embedding.join(",")}]`;
  const filters = buildMarketConditions(category, startDate, endDate);

  const rows = await db.execute<{
    id: string;
    external_id: string | null;
    question: string;
    description: string | null;
    category: string | null;
    outcome: string | null;
    outcome_prices: unknown;
    closed_at: string | null;
    created_at: string | null;
    volume_total: string | null;
    similarity: number;
    total_count: number;
  }>(sql.join([
    sql`SELECT`,
    sql`  m.id, m.external_id, m.question,`,
    sql`  LEFT(m.description, 300) AS description,`,
    sql`  m.category, m.outcome, m.outcome_prices,`,
    sql`  m.closed_at, m.created_at, m.volume_total,`,
    sql`  1 - (m.embedding <=> ${vectorStr}::vector) AS similarity,`,
    sql`  COUNT(*) OVER () AS total_count`,
    sql`FROM analytics_markets m`,
    sql`WHERE m.embedding IS NOT NULL`,
    ...filters.map((f) => sql`AND ${f}`),
    sql`ORDER BY m.embedding <=> ${vectorStr}::vector ASC`,
    sql`LIMIT ${limit} OFFSET ${offset}`,
  ], sql` `));

  const results: MarketSearchResult[] = rows.map((r) => ({
    id: r.id,
    externalId: r.external_id,
    question: r.question,
    description: r.description,
    category: r.category,
    outcome: r.outcome,
    outcomePrices: r.outcome_prices,
    closedAt: r.closed_at,
    createdAt: r.created_at,
    volumeTotal: r.volume_total,
    score: Number(r.similarity),
  }));

  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

  logger.info({ query, resultCount: results.length, total }, "analytics-query: search-markets");

  return { results, total };
}

function buildMarketConditions(category?: string, startDate?: string, endDate?: string): SQL[] {
  const conditions: SQL[] = [];
  if (category) conditions.push(sql`m.category = ${category}`);
  if (startDate) conditions.push(sql`m.created_at >= ${startDate}::timestamptz`);
  if (endDate) conditions.push(sql`m.created_at <= ${endDate}::timestamptz`);
  return conditions;
}
