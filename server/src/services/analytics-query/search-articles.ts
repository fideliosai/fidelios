import { sql, type SQL } from "drizzle-orm";
import type { Db } from "@fideliosai/db";
import { getQueryEmbedding } from "./embed.js";
import { logger } from "../../middleware/logger.js";

const RRF_K = 60;

export interface SearchArticlesParams {
  query: string;
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

export interface ArticleSearchResult {
  id: string;
  title: string;
  snippet: string;
  publishedAt: string;
  source: string | null;
  sourceUrl: string | null;
  tags: string[] | null;
  score: number;
}

export async function searchArticles(
  db: Db,
  params: SearchArticlesParams,
): Promise<{ results: ArticleSearchResult[]; total: number }> {
  const { query, limit = 20, offset = 0, startDate, endDate } = params;

  const embedding = await getQueryEmbedding(query);
  const vectorStr = embedding ? `[${embedding.join(",")}]` : null;

  const dateConditions = buildDateConditions(startDate, endDate);

  const rows = await db.execute<{
    id: string;
    title: string;
    snippet: string;
    published_at: string;
    source: string | null;
    source_url: string | null;
    tags: string[] | null;
    rrf_score: number;
    total_count: number;
  }>(sql.join([
    sql`WITH semantic AS (`,
    sql`  SELECT id, ROW_NUMBER() OVER (ORDER BY embedding <=> ${vectorStr}::vector ASC) AS rank`,
    sql`  FROM analytics_articles`,
    sql`  WHERE embedding IS NOT NULL`,
    vectorStr ? sql`` : sql`AND FALSE`,
    ...dateConditions.map((c) => sql`AND ${c}`),
    sql`),`,
    sql`lexical AS (`,
    sql`  SELECT id, ROW_NUMBER() OVER (ORDER BY ts_rank(search_vector, websearch_to_tsquery('english', ${query})) DESC) AS rank`,
    sql`  FROM analytics_articles`,
    sql`  WHERE search_vector @@ websearch_to_tsquery('english', ${query})`,
    ...dateConditions.map((c) => sql`AND ${c}`),
    sql`),`,
    sql`temporal AS (`,
    sql`  SELECT id, ROW_NUMBER() OVER (ORDER BY published_at DESC) AS rank`,
    sql`  FROM analytics_articles`,
    sql`  WHERE TRUE`,
    ...dateConditions.map((c) => sql`AND ${c}`),
    sql`),`,
    sql`combined AS (`,
    sql`  SELECT`,
    sql`    COALESCE(s.id, l.id, t.id) AS id,`,
    sql`    COALESCE(1.0 / (${RRF_K} + s.rank), 0) +`,
    sql`    COALESCE(1.0 / (${RRF_K} + l.rank), 0) +`,
    sql`    COALESCE(1.0 / (${RRF_K} + t.rank), 0) AS rrf_score`,
    sql`  FROM semantic s`,
    sql`  FULL OUTER JOIN lexical l ON s.id = l.id`,
    sql`  FULL OUTER JOIN temporal t ON COALESCE(s.id, l.id) = t.id`,
    sql`)`,
    sql`SELECT`,
    sql`  a.id, a.title, LEFT(a.content, 300) AS snippet,`,
    sql`  a.published_at, a.source, a.source_url, a.tags,`,
    sql`  c.rrf_score, COUNT(*) OVER () AS total_count`,
    sql`FROM combined c JOIN analytics_articles a ON a.id = c.id`,
    sql`ORDER BY c.rrf_score DESC`,
    sql`LIMIT ${limit} OFFSET ${offset}`,
  ], sql` `));

  const results: ArticleSearchResult[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    snippet: r.snippet,
    publishedAt: r.published_at,
    source: r.source,
    sourceUrl: r.source_url,
    tags: r.tags,
    score: Number(r.rrf_score),
  }));

  const total = rows.length > 0 ? Number(rows[0].total_count) : 0;

  logger.info({ query, resultCount: results.length, total }, "analytics-query: search-articles");

  return { results, total };
}

function buildDateConditions(startDate?: string, endDate?: string): SQL[] {
  const conditions: SQL[] = [];
  if (startDate) conditions.push(sql`published_at >= ${startDate}::timestamptz`);
  if (endDate) conditions.push(sql`published_at <= ${endDate}::timestamptz`);
  return conditions;
}
