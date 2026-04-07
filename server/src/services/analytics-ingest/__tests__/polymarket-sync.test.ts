import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createDb,
  startEmbeddedPostgresTestDatabase,
  getEmbeddedPostgresTestSupport,
  analyticsMarkets,
} from "@fideliosai/db";
import { syncPolymarketMarkets } from "../polymarket-sync.js";

const embeddedPostgresSupport = await getEmbeddedPostgresTestSupport();
const describeEmbeddedPostgres = embeddedPostgresSupport.supported
  ? describe
  : describe.skip;

if (!embeddedPostgresSupport.supported) {
  console.warn(
    `Skipping polymarket-sync tests: ${embeddedPostgresSupport.reason ?? "unsupported environment"}`,
  );
}

function makeGammaMarket(overrides: Record<string, unknown> = {}) {
  return {
    id: "market-1",
    question: "Will it rain tomorrow?",
    description: "A weather market",
    category: "weather",
    outcomes: JSON.stringify(["Yes", "No"]),
    outcomePrices: JSON.stringify([0.65, 0.35]),
    closedTime: "2024-01-15T00:00:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    volumeNum: 50000,
    clobTokenIds: JSON.stringify(["token-abc-123"]),
    ...overrides,
  };
}

describeEmbeddedPostgres(
  "polymarket-sync",
  () => {
    let db: ReturnType<typeof createDb>;
    let tempDb: Awaited<ReturnType<typeof startEmbeddedPostgresTestDatabase>> | null = null;
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    beforeEach(async () => {
      tempDb = await startEmbeddedPostgresTestDatabase("fidelios-polymarket-sync-");
      db = createDb(tempDb.connectionString);
      fetchSpy.mockReset();
    });

    afterEach(async () => {
      if (tempDb) {
        await tempDb.cleanup();
        tempDb = null;
      }
    });

    it("fetches and upserts markets from Gamma API", async () => {
      const markets = [
        makeGammaMarket({ id: "m1", question: "Market 1?" }),
        makeGammaMarket({ id: "m2", question: "Market 2?" }),
      ];

      // First page returns markets, second page returns empty (stops pagination)
      fetchSpy
        .mockResolvedValueOnce(
          new Response(JSON.stringify(markets), { status: 200 }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify([]), { status: 200 }),
        );

      const result = await syncPolymarketMarkets(db as any);
      expect(result.upserted).toBe(2);

      const rows = await db.select().from(analyticsMarkets);
      expect(rows).toHaveLength(2);
      expect(rows.map((r) => r.externalId).sort()).toEqual(["m1", "m2"]);
      expect(rows[0]!.clobTokenId).toBe("token-abc-123");
    });

    it("stops pagination on empty page", async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      const result = await syncPolymarketMarkets(db as any);
      expect(result.upserted).toBe(0);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it("upserts idempotently (no duplicates on re-run)", async () => {
      const markets = [makeGammaMarket({ id: "m1", question: "Original?" })];

      // First run
      fetchSpy
        .mockResolvedValueOnce(new Response(JSON.stringify(markets), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));
      await syncPolymarketMarkets(db as any);

      // Second run with updated question
      const updated = [makeGammaMarket({ id: "m1", question: "Updated?" })];
      fetchSpy
        .mockResolvedValueOnce(new Response(JSON.stringify(updated), { status: 200 }))
        .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));
      await syncPolymarketMarkets(db as any);

      const rows = await db.select().from(analyticsMarkets);
      expect(rows).toHaveLength(1);
      expect(rows[0]!.question).toBe("Updated?");
    });

    it("throws on Gamma API error", async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response("Internal Server Error", { status: 500 }),
      );

      await expect(syncPolymarketMarkets(db as any)).rejects.toThrow(
        "Gamma API returned 500",
      );
    });
  },
  { timeout: 120_000 },
);
