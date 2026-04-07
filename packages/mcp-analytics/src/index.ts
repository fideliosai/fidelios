#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_URL = process.env.FIDELIOS_API_URL ?? "http://localhost:3100";
const API_KEY = process.env.FIDELIOS_API_KEY ?? "";

async function apiCall(path: string, opts: { method: string; body?: unknown; query?: Record<string, string> }) {
  const url = new URL(`/api${path}`, API_URL);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    method: opts.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${opts.method} ${path} failed (${res.status}): ${text}`);
  }

  return res.json();
}

const server = new McpServer({
  name: "fidelios-analytics",
  version: "0.1.0",
});

server.tool(
  "search_articles",
  "Search news articles using hybrid search (semantic + lexical + temporal). Returns ranked results with RRF scoring.",
  {
    query: z.string().describe("Search query text"),
    limit: z.number().optional().describe("Max results (default 20)"),
    offset: z.number().optional().describe("Pagination offset"),
    startDate: z.string().optional().describe("Filter: articles published after this ISO date"),
    endDate: z.string().optional().describe("Filter: articles published before this ISO date"),
  },
  async (params) => {
    const result = await apiCall("/analytics/search-articles", {
      method: "POST",
      body: params,
    });
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "search_markets",
  "Search prediction markets by embedding similarity. Supports filtering by category and date range.",
  {
    query: z.string().describe("Search query text"),
    limit: z.number().optional().describe("Max results (default 20)"),
    offset: z.number().optional().describe("Pagination offset"),
    category: z.string().optional().describe("Filter by market category"),
    startDate: z.string().optional().describe("Filter: markets created after this ISO date"),
    endDate: z.string().optional().describe("Filter: markets created before this ISO date"),
  },
  async (params) => {
    const result = await apiCall("/analytics/search-markets", {
      method: "POST",
      body: params,
    });
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "find_signals",
  "Query article-market correlation signals. Filter by article, market, or signal quality.",
  {
    articleId: z.string().optional().describe("Filter by article UUID"),
    marketId: z.string().optional().describe("Filter by market UUID"),
    signalQuality: z.string().optional().describe("Filter by signal quality level"),
    limit: z.number().optional().describe("Max results (default 50)"),
    offset: z.number().optional().describe("Pagination offset"),
  },
  async (params) => {
    const result = await apiCall("/analytics/find-signals", {
      method: "POST",
      body: params,
    });
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "price_history",
  "Get time-series price data for a prediction market. Supports optional downsampling.",
  {
    marketId: z.string().describe("Market UUID"),
    startDate: z.string().optional().describe("Start of date range (ISO)"),
    endDate: z.string().optional().describe("End of date range (ISO)"),
    downsampleMinutes: z.number().optional().describe("Downsample interval in minutes"),
  },
  async (params) => {
    const query: Record<string, string> = { marketId: params.marketId };
    if (params.startDate) query.startDate = params.startDate;
    if (params.endDate) query.endDate = params.endDate;
    if (params.downsampleMinutes) query.downsampleMinutes = String(params.downsampleMinutes);

    const result = await apiCall("/analytics/price-history", {
      method: "GET",
      query,
    });
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  },
);

server.tool(
  "ingest_article",
  "Insert a new article into the analytics database. Embedding is deferred to the background embed-pending job.",
  {
    title: z.string().describe("Article title"),
    content: z.string().describe("Full article text"),
    publishedAt: z.string().describe("Publication date (ISO)"),
    source: z.string().optional().describe("Source name"),
    sourceUrl: z.string().optional().describe("Source URL"),
    tags: z.array(z.string()).optional().describe("Article tags"),
  },
  async (params) => {
    const result = await apiCall("/analytics/ingest-article", {
      method: "POST",
      body: params,
    });
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP analytics server failed:", err);
  process.exit(1);
});
