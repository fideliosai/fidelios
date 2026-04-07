import type { Db } from "@fideliosai/db";
import { searchArticles, type SearchArticlesParams } from "./search-articles.js";
import { searchMarkets, type SearchMarketsParams } from "./search-markets.js";
import { findSignals, type FindSignalsParams } from "./find-signals.js";
import { getPriceHistory, type PriceHistoryParams } from "./price-history.js";
import { ingestArticle, type IngestArticleParams } from "./ingest-article.js";

export type { SearchArticlesParams, SearchMarketsParams, FindSignalsParams, PriceHistoryParams, IngestArticleParams };

export function analyticsQueryService(db: Db) {
  return {
    searchArticles: (params: SearchArticlesParams) => searchArticles(db, params),
    searchMarkets: (params: SearchMarketsParams) => searchMarkets(db, params),
    findSignals: (params: FindSignalsParams) => findSignals(db, params),
    getPriceHistory: (params: PriceHistoryParams) => getPriceHistory(db, params),
    ingestArticle: (params: IngestArticleParams) => ingestArticle(db, params),
  };
}
