import { afterEach, describe, expect, it, vi } from "vitest";
import { discoverOpenCodeModels, resetOpenCodeModelsCacheForTests } from "./models.js";

vi.mock("@fideliosai/adapter-utils/server-utils", () => ({
  asString: vi.fn((value: unknown, fallback: string) =>
    typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback,
  ),
  ensurePathInEnv: vi.fn((env: Record<string, unknown>) => env as Record<string, string>),
  runChildProcess: vi.fn(),
}));

import { runChildProcess } from "@fideliosai/adapter-utils/server-utils";

describe("openCode ollama-cloud fallback", () => {
  afterEach(() => {
    delete process.env.FIDELIOS_OPENCODE_COMMAND;
    resetOpenCodeModelsCacheForTests();
    vi.mocked(runChildProcess).mockReset();
  });

  it("exposes a :cloud variant for ollama-cloud models advertised without a tag", async () => {
    vi.mocked(runChildProcess).mockResolvedValueOnce({
      exitCode: 0,
      stdout: "ollama-cloud/kimi-k2.7-code\nollama-cloud/qwen3.5:cloud\n",
      stderr: "",
      timedOut: false,
      signal: null,
      pid: 12345,
      startedAt: new Date().toISOString(),
    });

    const models = await discoverOpenCodeModels();

    expect(models).toContainEqual({
      id: "ollama-cloud/kimi-k2.7-code:cloud",
      label: "ollama-cloud/kimi-k2.7-code:cloud",
    });
    // Already-tagged models should not get a duplicate :cloud suffix.
    expect(models).toContainEqual({
      id: "ollama-cloud/qwen3.5:cloud",
      label: "ollama-cloud/qwen3.5:cloud",
    });
    expect(models).not.toContainEqual({
      id: "ollama-cloud/qwen3.5:cloud:cloud",
      label: "ollama-cloud/qwen3.5:cloud:cloud",
    });
  });
});
