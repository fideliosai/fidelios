import type { Db } from "@fideliosai/db";
import { logger } from "../../middleware/logger.js";
import { syncPolymarketMarkets } from "./polymarket-sync.js";
import { syncPriceHistory } from "./price-history-sync.js";
import { embedPendingMarkets } from "./embed-pending.js";

const SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
const EMBED_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export function registerAnalyticsIngestJobs(db: Db): { stop: () => void } {
  let stopped = false;

  const runJob = async (name: string, fn: () => Promise<unknown>) => {
    if (stopped) return;
    try {
      await fn();
    } catch (err) {
      logger.error({ err, job: name }, "analytics-ingest: job failed");
    }
  };

  // Market sync + price history run sequentially (price history depends on markets)
  const runSyncCycle = async () => {
    await runJob("polymarket-sync", () => syncPolymarketMarkets(db));
    await runJob("price-history-sync", () => syncPriceHistory(db));
  };

  // Schedule recurring jobs
  const syncTimer = setInterval(() => void runSyncCycle(), SYNC_INTERVAL_MS);
  const embedTimer = setInterval(() => void runJob("embed-pending", () => embedPendingMarkets(db)), EMBED_INTERVAL_MS);

  // Run initial sync after a short delay to let server finish starting up
  setTimeout(() => void runSyncCycle(), 30_000);
  setTimeout(() => void runJob("embed-pending", () => embedPendingMarkets(db)), 60_000);

  logger.info("analytics-ingest: jobs registered (sync every 6h, embed every 10m)");

  return {
    stop() {
      stopped = true;
      clearInterval(syncTimer);
      clearInterval(embedTimer);
      logger.info("analytics-ingest: jobs stopped");
    },
  };
}
