import { isNotNull } from "drizzle-orm";
import type { Db } from "@fideliosai/db";
import { analyticsMarkets, analyticsPriceHistory } from "@fideliosai/db";
import { logger } from "../../middleware/logger.js";
import { RateLimiter } from "./rate-limiter.js";

const CLOB_API_BASE = "https://clob.polymarket.com";
const BATCH_SIZE = 20; // max 20 markets per batch request

// 500 req/10s = 50 req/s; use safe limit of 40 req/s
const rateLimiter = new RateLimiter(40, 40);

interface PricePoint {
  t: number;
  p: number;
}

interface BatchPriceHistoryResponse {
  history: Record<string, PricePoint[]>;
}

export async function syncPriceHistory(db: Db): Promise<{ marketsProcessed: number; pointsInserted: number }> {
  logger.info("price-history-sync: starting");

  // Get all markets with a clob_token_id
  const markets = await db
    .select({
      id: analyticsMarkets.id,
      clobTokenId: analyticsMarkets.clobTokenId,
    })
    .from(analyticsMarkets)
    .where(isNotNull(analyticsMarkets.clobTokenId));

  if (markets.length === 0) {
    logger.info("price-history-sync: no markets with clob_token_id, skipping");
    return { marketsProcessed: 0, pointsInserted: 0 };
  }

  let totalPointsInserted = 0;
  let marketsProcessed = 0;

  // Process in batches of 20
  for (let i = 0; i < markets.length; i += BATCH_SIZE) {
    const batch = markets.slice(i, i + BATCH_SIZE);
    const tokenIds = batch.map((m) => m.clobTokenId!);

    // Build token-to-market mapping for this batch
    const tokenToMarketId = new Map<string, string>();
    for (const m of batch) {
      tokenToMarketId.set(m.clobTokenId!, m.id);
    }

    await rateLimiter.acquire();

    const response = await fetch(`${CLOB_API_BASE}/batch-prices-history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        markets: tokenIds,
        interval: "all",
        fidelity: 60,
      }),
    });

    if (!response.ok) {
      logger.error({ status: response.status, batch: i }, "price-history-sync: CLOB API request failed");
      throw new Error(`CLOB API returned ${response.status}`);
    }

    const data = (await response.json()) as BatchPriceHistoryResponse;

    for (const [tokenId, points] of Object.entries(data.history)) {
      const marketId = tokenToMarketId.get(tokenId);
      if (!marketId || !points || points.length === 0) continue;

      // Batch insert price points with ON CONFLICT DO NOTHING
      const values = points.map((p) => ({
        marketId,
        timestamp: new Date(p.t * 1000),
        price: p.p.toString(),
      }));

      // Insert in chunks to avoid overly large queries
      const CHUNK_SIZE = 500;
      for (let c = 0; c < values.length; c += CHUNK_SIZE) {
        const chunk = values.slice(c, c + CHUNK_SIZE);
        await db
          .insert(analyticsPriceHistory)
          .values(chunk)
          .onConflictDoNothing();
        totalPointsInserted += chunk.length;
      }
    }

    marketsProcessed += batch.length;
    logger.info(
      { marketsProcessed, totalPointsInserted, batchIndex: i },
      "price-history-sync: processed batch",
    );
  }

  logger.info({ marketsProcessed, totalPointsInserted }, "price-history-sync: completed");
  return { marketsProcessed, pointsInserted: totalPointsInserted };
}
