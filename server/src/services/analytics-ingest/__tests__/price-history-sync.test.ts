import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDb,
  startEmbeddedPostgresTestDatabase,
  getEmbeddedPostgresTestSupport,
  analyticsMarkets,
  analyticsPriceHistory,
} from "@fideliosai/db";
import { syncPriceHistory } from "../price-history-sync.js";

const embeddedPostgresSupport = await getEmbeddedPostgresTestSupport();
const describeEmbeddedPostgres = embeddedPostgresSupport.supported
  ? describe
  : describe.skip;

if (!embeddedPostgresSupport.supported) {
  console.warn(
    `Skipping price-history-sync tests: ${embeddedPostgresSupport.reason ?? "unsupported environment"}`,
  );
}

describeEmbeddedPostgres(
  "price-history-sync",
  () => {
    let db: ReturnType<typeof createDb>;
    let tempDb: Awaited<ReturnType<typeof startEmbeddedPostgresTestDatabase>> | null = null;
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    beforeEach(async () => {
      tempDb = await startEmbeddedPostgresTestDatabase("fidelios-price-history-");
      db = createDb(tempDb.connectionString);
      fetchSpy.mockReset();
    });

    afterEach(async () => {
      if (tempDb) {
        await tempDb.cleanup();
        tempDb = null;
      }
    });

    async function insertMarket(externalId: string, clobTokenId: string) {
      const [row] = await db
        .insert(analyticsMarkets)
        .values({
          externalId,
          question: `Test market ${externalId}`,
          clobTokenId,
        })
        .returning({ id: analyticsMarkets.id });
      return row!;
    }

    it("fetches and inserts price history from CLOB batch API", async () => {
      const market = await insertMarket("ext-1", "token-1");

      fetchSpy.mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            history: {
              "token-1": [
                { t: 1700000000, p: 0.55 },
                { t: 1700003600, p: 0.60 },
              ],
            },
          }),
          { status: 200 },
        ),
      );

      const result = await syncPriceHistory(db as any);
      expect(result.marketsProcessed).toBe(1);
      expect(result.pointsInserted).toBe(2);

      const rows = await db.select().from(analyticsPriceHistory);
      expect(rows).toHaveLength(2);
      expect(rows[0]!.marketId).toBe(market.id);
    });

    it("handles no markets with clob_token_id gracefully", async () => {
      // Insert a market without clob_token_id
      await db
        .insert(analyticsMarkets)
        .values({ externalId: "no-clob", question: "No CLOB?" });

      const result = await syncPriceHistory(db as any);
      expect(result.marketsProcessed).toBe(0);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("inserts idempotently (ON CONFLICT DO NOTHING)", async () => {
      await insertMarket("ext-1", "token-1");

      const priceData = {
        history: {
          "token-1": [{ t: 1700000000, p: 0.55 }],
        },
      };

      // First run
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(priceData), { status: 200 }),
      );
      await syncPriceHistory(db as any);

      // Second run (same data)
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify(priceData), { status: 200 }),
      );
      await syncPriceHistory(db as any);

      const rows = await db.select().from(analyticsPriceHistory);
      expect(rows).toHaveLength(1);
    });

    it("throws on CLOB API error", async () => {
      await insertMarket("ext-1", "token-1");

      fetchSpy.mockResolvedValueOnce(
        new Response("Server Error", { status: 500 }),
      );

      await expect(syncPriceHistory(db as any)).rejects.toThrow(
        "CLOB API returned 500",
      );
    });
  },
  { timeout: 120_000 },
);
