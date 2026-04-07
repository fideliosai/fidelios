import type { Db } from "@fideliosai/db";
import { analyticsMarkets } from "@fideliosai/db";
import { logger } from "../../middleware/logger.js";
import { RateLimiter } from "./rate-limiter.js";

const GAMMA_API_BASE = "https://gamma-api.polymarket.com";
const PAGE_LIMIT = 100;

// 300 req/10s = 30 req/s; use safe limit of 25 req/s
const rateLimiter = new RateLimiter(25, 25);

interface GammaMarket {
  id: string;
  question: string;
  description?: string;
  category?: string;
  outcomes?: string;
  outcomePrices?: string;
  closedTime?: string;
  createdAt?: string;
  volumeNum?: number;
  clobTokenIds?: string;
}

function parseOutcome(outcomes?: string): string | null {
  if (!outcomes) return null;
  try {
    const parsed = JSON.parse(outcomes) as string[];
    return parsed.find((o) => o !== "") ?? null;
  } catch {
    return null;
  }
}

function parseOutcomePrices(outcomePrices?: string): unknown | null {
  if (!outcomePrices) return null;
  try {
    return JSON.parse(outcomePrices);
  } catch {
    return null;
  }
}

function parseClobTokenId(clobTokenIds?: string): string | null {
  if (!clobTokenIds) return null;
  try {
    const parsed = JSON.parse(clobTokenIds) as string[];
    return parsed[0] ?? null;
  } catch {
    return null;
  }
}

export async function syncPolymarketMarkets(db: Db): Promise<{ upserted: number }> {
  let offset = 0;
  let totalUpserted = 0;

  logger.info("polymarket-sync: starting market sync");

  while (true) {
    await rateLimiter.acquire();

    const url = `${GAMMA_API_BASE}/markets?closed=true&limit=${PAGE_LIMIT}&offset=${offset}`;
    const response = await fetch(url);

    if (!response.ok) {
      logger.error({ status: response.status, url }, "polymarket-sync: Gamma API request failed");
      throw new Error(`Gamma API returned ${response.status}`);
    }

    const markets = (await response.json()) as GammaMarket[];

    if (markets.length === 0) {
      logger.info({ totalUpserted, offset }, "polymarket-sync: reached end of markets");
      break;
    }

    for (const market of markets) {
      await db
        .insert(analyticsMarkets)
        .values({
          externalId: market.id,
          question: market.question,
          description: market.description ?? null,
          category: market.category ?? null,
          outcome: parseOutcome(market.outcomes),
          outcomePrices: parseOutcomePrices(market.outcomePrices),
          closedAt: market.closedTime ? new Date(market.closedTime) : null,
          createdAt: market.createdAt ? new Date(market.createdAt) : null,
          volumeTotal: market.volumeNum?.toString() ?? null,
          clobTokenId: parseClobTokenId(market.clobTokenIds),
        })
        .onConflictDoUpdate({
          target: analyticsMarkets.externalId,
          set: {
            question: market.question,
            description: market.description ?? null,
            category: market.category ?? null,
            outcome: parseOutcome(market.outcomes),
            outcomePrices: parseOutcomePrices(market.outcomePrices),
            closedAt: market.closedTime ? new Date(market.closedTime) : null,
            createdAt: market.createdAt ? new Date(market.createdAt) : null,
            volumeTotal: market.volumeNum?.toString() ?? null,
            clobTokenId: parseClobTokenId(market.clobTokenIds),
          },
        });

      totalUpserted++;
    }

    logger.info({ offset, batch: markets.length, totalUpserted }, "polymarket-sync: processed batch");
    offset += PAGE_LIMIT;
  }

  logger.info({ totalUpserted }, "polymarket-sync: completed");
  return { upserted: totalUpserted };
}
