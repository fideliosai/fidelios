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

describe("openCode model discovery command", () => {
  afterEach(() => {
    delete process.env.FIDELIOS_OPENCODE_COMMAND;
    resetOpenCodeModelsCacheForTests();
    vi.mocked(runChildProcess).mockReset();
  });

  it("passes --refresh so newly-added models are not hidden by a stale cache", async () => {
    vi.mocked(runChildProcess).mockResolvedValueOnce({
      exitCode: 0,
      stdout: "opencode/gpt-5\nollama-cloud/kimi-k2.7-code\n",
      stderr: "",
      timedOut: false,
      signal: null,
      pid: 12345,
      startedAt: new Date().toISOString(),
    });

    const models = await discoverOpenCodeModels();

    expect(models).toContainEqual({
      id: "ollama-cloud/kimi-k2.7-code",
      label: "ollama-cloud/kimi-k2.7-code",
    });
    expect(runChildProcess).toHaveBeenCalledWith(
      expect.stringMatching(/^opencode-models-/),
      "opencode",
      ["models", "--refresh"],
      expect.any(Object),
    );
  });
});
