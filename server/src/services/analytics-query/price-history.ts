import { sql, type SQL } from "drizzle-orm";
import type { Db } from "@fideliosai/db";
import { logger } from "../../middleware/logger.js";

export interface PriceHistoryParams {
  marketId: string;
  startDate?: string;
  endDate?: string;
  downsampleMinutes?: number;
}

export interface PricePoint {
  timestamp: string;
  price: string;
}

export async function getPriceHistory(
  db: Db,
  params: PriceHistoryParams,
): Promise<{ marketId: string; points: PricePoint[] }> {
  const { marketId, startDate, endDate, downsampleMinutes } = params;

  const dateConditions = buildDateConditions(startDate, endDate);

  let queryParts: SQL[];

  if (downsampleMinutes && downsampleMinutes > 0) {
    queryParts = [
      sql`SELECT`,
      sql`  date_trunc('minute', timestamp - (EXTRACT(MINUTE FROM timestamp)::int % ${downsampleMinutes}) * INTERVAL '1 minute') AS timestamp,`,
      sql`  AVG(price::numeric)::text AS price`,
      sql`FROM analytics_price_history`,
      sql`WHERE market_id = ${marketId}`,
      ...dateConditions.map((c) => sql`AND ${c}`),
      sql`GROUP BY 1 ORDER BY 1 ASC`,
    ];
  } else {
    queryParts = [
      sql`SELECT timestamp, price`,
      sql`FROM analytics_price_history`,
      sql`WHERE market_id = ${marketId}`,
      ...dateConditions.map((c) => sql`AND ${c}`),
      sql`ORDER BY timestamp ASC`,
    ];
  }

  const rows = await db.execute<{ timestamp: string; price: string }>(
    sql.join(queryParts, sql` `),
  );

  const points: PricePoint[] = rows.map((r) => ({
    timestamp: r.timestamp,
    price: r.price,
  }));

  logger.info({ marketId, pointCount: points.length, downsampleMinutes }, "analytics-query: price-history");

  return { marketId, points };
}

function buildDateConditions(startDate?: string, endDate?: string): SQL[] {
  const conditions: SQL[] = [];
  if (startDate) conditions.push(sql`timestamp >= ${startDate}::timestamptz`);
  if (endDate) conditions.push(sql`timestamp <= ${endDate}::timestamptz`);
  return conditions;
}
