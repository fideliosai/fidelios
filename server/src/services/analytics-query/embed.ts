import { logger } from "../../middleware/logger.js";

const OLLAMA_URL = "http://localhost:11434/api/embeddings";

interface OllamaEmbeddingResponse {
  embedding: number[];
}

export async function getQueryEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "nomic-embed-text", prompt: text }),
    });

    if (!response.ok) {
      logger.warn({ status: response.status }, "analytics-query: Ollama embedding request failed");
      return null;
    }

    const data = (await response.json()) as OllamaEmbeddingResponse;

    if (!data.embedding || data.embedding.length !== 768) {
      logger.warn({ length: data.embedding?.length }, "analytics-query: unexpected embedding dimensions");
      return null;
    }

    return data.embedding;
  } catch (err) {
    logger.warn({ err }, "analytics-query: failed to get query embedding");
    return null;
  }
}
