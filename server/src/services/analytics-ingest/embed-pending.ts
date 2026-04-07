import { sql, isNull } from "drizzle-orm";
import type { Db } from "@fideliosai/db";
import { analyticsMarkets } from "@fideliosai/db";
import { logger } from "../../middleware/logger.js";

const OLLAMA_URL = "http://localhost:11434/api/embeddings";
const BATCH_LIMIT = 100;

interface OllamaEmbeddingResponse {
  embedding: number[];
}

export async function embedPendingMarkets(db: Db): Promise<{ embedded: number }> {
  logger.info("embed-pending: starting");

  const pending = await db
    .select({
      id: analyticsMarkets.id,
      question: analyticsMarkets.question,
    })
    .from(analyticsMarkets)
    .where(isNull(analyticsMarkets.embedding))
    .limit(BATCH_LIMIT);

  if (pending.length === 0) {
    logger.info("embed-pending: no markets pending embedding");
    return { embedded: 0 };
  }

  let embedded = 0;

  for (const market of pending) {
    try {
      const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "nomic-embed-text",
          prompt: market.question,
        }),
      });

      if (!response.ok) {
        logger.warn(
          { status: response.status, marketId: market.id },
          "embed-pending: Ollama API request failed, skipping market",
        );
        continue;
      }

      const data = (await response.json()) as OllamaEmbeddingResponse;

      if (!data.embedding || data.embedding.length !== 768) {
        logger.warn(
          { marketId: market.id, length: data.embedding?.length },
          "embed-pending: unexpected embedding dimensions, skipping",
        );
        continue;
      }

      // pgvector expects array format: [1.0, 2.0, ...]
      const vectorStr = `[${data.embedding.join(",")}]`;

      await db
        .update(analyticsMarkets)
        .set({
          embedding: sql`${vectorStr}::vector`,
        })
        .where(sql`${analyticsMarkets.id} = ${market.id}`);

      embedded++;
    } catch (err) {
      logger.warn({ err, marketId: market.id }, "embed-pending: failed to embed market, skipping");
    }
  }

  logger.info({ embedded, total: pending.length }, "embed-pending: completed");
  return { embedded };
}
