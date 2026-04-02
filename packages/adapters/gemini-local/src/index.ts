export const type = "gemini_local";
export const label = "Gemini CLI (local)";
export const DEFAULT_GEMINI_LOCAL_MODEL = "auto";

export const models = [
  { id: DEFAULT_GEMINI_LOCAL_MODEL, label: "Auto" },
  { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro Preview (flagship, 1M context)" },
  { id: "gemini-3-pro", label: "Gemini 3 Pro (coding/math)" },
  { id: "gemini-3-flash", label: "Gemini 3 Flash (fast, free tier)" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro (legacy)" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash (legacy)" },
];

export const agentConfigurationDoc = `# gemini_local agent configuration

Adapter: gemini_local

Use when:
- You want FideliOS to run the Gemini CLI locally on the host machine
- You want Gemini chat sessions resumed across heartbeats with --resume
- You want FideliOS skills injected locally without polluting the global environment

Don't use when:
- You need webhook-style external invocation (use http or openclaw_gateway)
- You only need a one-shot script without an AI coding agent loop (use process)
- Gemini CLI is not installed on the machine that runs FideliOS

Core fields:
- cwd (string, optional): default absolute working directory fallback for the agent process (created if missing when possible)
- instructionsFilePath (string, optional): absolute path to a markdown instructions file prepended to the run prompt
- promptTemplate (string, optional): run prompt template
- model (string, optional): Gemini model id. Defaults to auto.
- sandbox (boolean, optional): run in sandbox mode (default: false, passes --sandbox=none)
- command (string, optional): defaults to "gemini"
- extraArgs (string[], optional): additional CLI args
- env (object, optional): KEY=VALUE environment variables

Operational fields:
- timeoutSec (number, optional): run timeout in seconds
- graceSec (number, optional): SIGTERM grace period in seconds

Notes:
- Runs use positional prompt arguments, not stdin.
- Sessions resume with --resume when stored session cwd matches the current cwd.
- FideliOS auto-injects local skills into \`~/.gemini/skills/\` via symlinks, so the CLI can discover both credentials and skills in their natural location.
- Authentication can use GEMINI_API_KEY / GOOGLE_API_KEY or local Gemini CLI login.
`;

