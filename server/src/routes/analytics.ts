import { Router } from "express";
import type { Db } from "@fideliosai/db";
import { analyticsQueryService } from "../services/analytics-query/index.js";
import { badRequest, unauthorized } from "../errors.js";

export function analyticsRoutes(db: Db) {
  const router = Router();
  const svc = analyticsQueryService(db);

  function assertAuth(req: { actor: { type: string } }) {
    if (req.actor.type === "none") throw unauthorized();
  }

  router.post("/analytics/search-articles", async (req, res, next) => {
    try {
      assertAuth(req);
      const { query, limit, offset, startDate, endDate } = req.body;
      if (!query || typeof query !== "string") {
        throw badRequest("query is required");
      }
      const result = await svc.searchArticles({
        query,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
        startDate,
        endDate,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  router.post("/analytics/search-markets", async (req, res, next) => {
    try {
      assertAuth(req);
      const { query, limit, offset, category, startDate, endDate } = req.body;
      if (!query || typeof query !== "string") {
        throw badRequest("query is required");
      }
      const result = await svc.searchMarkets({
        query,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
        category,
        startDate,
        endDate,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  router.post("/analytics/find-signals", async (req, res, next) => {
    try {
      assertAuth(req);
      const { articleId, marketId, signalQuality, limit, offset } = req.body;
      const result = await svc.findSignals({
        articleId,
        marketId,
        signalQuality,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  router.get("/analytics/price-history", async (req, res, next) => {
    try {
      assertAuth(req);
      const { marketId, startDate, endDate, downsampleMinutes } = req.query;
      if (!marketId || typeof marketId !== "string") {
        throw badRequest("marketId is required");
      }
      const result = await svc.getPriceHistory({
        marketId,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        downsampleMinutes: downsampleMinutes ? Number(downsampleMinutes) : undefined,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  router.post("/analytics/ingest-article", async (req, res, next) => {
    try {
      assertAuth(req);
      const { title, content, publishedAt, source, sourceUrl, tags } = req.body;
      if (!title || typeof title !== "string") {
        throw badRequest("title is required");
      }
      if (!content || typeof content !== "string") {
        throw badRequest("content is required");
      }
      if (!publishedAt || typeof publishedAt !== "string") {
        throw badRequest("publishedAt is required");
      }
      const result = await svc.ingestArticle({
        title,
        content,
        publishedAt,
        source,
        sourceUrl,
        tags,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
