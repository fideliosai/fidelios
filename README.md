<p align="center">
  <img src="doc/assets/header.png" alt="FideliOS" width="200" />
</p>

<h1 align="center">FideliOS</h1>

<p align="center">
  <strong>AI Agent Orchestration Platform</strong><br>
  <em>One dashboard to hire, manage, and scale your AI agent team</em>
</p>

<p align="center">
  <a href="https://github.com/fideliosai/fidelios/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node-20%2B-brightgreen" alt="Node 20+" /></a>
  <a href="https://github.com/fideliosai/fidelios/stargazers"><img src="https://img.shields.io/github/stars/fideliosai/fidelios?style=flat" alt="Stars" /></a>
</p>

<p align="center">
  <a href="#quick-start"><strong>Quick Start</strong></a> &middot;
  <a href="#features"><strong>Features</strong></a> &middot;
  <a href="#problems-fidelios-solves"><strong>Why FideliOS</strong></a> &middot;
  <a href="#architecture"><strong>Architecture</strong></a> &middot;
  <a href="https://fidelios.nl"><strong>fidelios.nl</strong></a>
</p>

<br>

<div align="center">
  <video src="https://github.com/user-attachments/assets/e64935a9-1676-440e-9120-0e7ce6989a44" width="720" controls></video>
</div>

<br>

---

## What is FideliOS?

<h2 align="center">Open-source operating system for AI-driven companies</h2>

<p align="center">
  <em>It looks like a task manager — but under the hood it has org charts, budgets,<br>governance, goal alignment, agent coordination, plugins, and mobile access.</em>
</p>

<br>

<div align="center">
<table>
  <tr>
    <td align="center"><strong>01</strong></td>
    <td><strong>Define the goal</strong></td>
    <td><em>"Build the #1 AI note-taking app to $1M MRR."</em></td>
  </tr>
  <tr>
    <td align="center"><strong>02</strong></td>
    <td><strong>Hire the team</strong></td>
    <td>CEO, CTO, engineers, designers, marketers — any agent, any provider</td>
  </tr>
  <tr>
    <td align="center"><strong>03</strong></td>
    <td><strong>Approve and run</strong></td>
    <td>Review strategy. Set budgets. Hit go. Monitor from the dashboard.</td>
  </tr>
</table>
</div>

<br>

<div align="center">
<table>
  <tr>
    <td align="center"><strong>Works<br/>with</strong></td>
    <td align="center"><img src="doc/assets/logos/claude.svg" width="32" alt="Claude" /><br/><sub>Claude Code</sub></td>
    <td align="center"><img src="doc/assets/logos/codex.svg" width="32" alt="Codex" /><br/><sub>Codex</sub></td>
    <td align="center"><img src="doc/assets/logos/cursor.svg" width="32" alt="Cursor" /><br/><sub>Cursor</sub></td>
    <td align="center"><img src="doc/assets/logos/openclaw.svg" width="32" alt="OpenClaw" /><br/><sub>OpenClaw</sub></td>
    <td align="center"><img src="doc/assets/logos/bash.svg" width="32" alt="Bash" /><br/><sub>Bash</sub></td>
    <td align="center"><img src="doc/assets/logos/http.svg" width="32" alt="HTTP" /><br/><sub>HTTP</sub></td>
  </tr>
</table>

<em>If it can receive a heartbeat, it's hired.</em>

</div>

<br>

---

## FideliOS is right for you if

<table>
<tr><td>

- You want to build **autonomous AI companies** — not just run scripts
- You **coordinate many different agents** (Claude, Codex, Cursor, Gemini) toward a common goal
- You have **20 simultaneous agent terminals** open and lose track of what everyone is doing
- You want agents running **autonomously 24/7**, but still want to audit work and chime in when needed
- You want to **monitor costs** and enforce budgets before they spiral
- You want a process for managing agents that **feels like using a task manager**
- You want to manage your AI companies **from your phone** via PWA or Telegram
- You need **plugins** — Telegram gateway, webhooks, custom MCP servers — not just a closed system

</td></tr>
</table>

<br>

---

## Problems FideliOS solves

| Without FideliOS | With FideliOS |
|:---|:---|
| 🔴 You have 20 Claude Code tabs open and can't track which one does what. On reboot you lose everything. | 🟢 Tasks are ticket-based, conversations are threaded, sessions persist across reboots. |
| 🔴 You manually gather context from several places to remind your agent what you're working on. | 🟢 Context flows from the task up through the project and company goals — your agent always knows what to do and why. |
| 🔴 Folders of agent configs are disorganized and you're re-inventing coordination between agents. | 🟢 Org charts, ticketing, delegation, and governance out of the box — run a company, not a pile of scripts. |
| 🔴 Runaway loops waste hundreds of dollars and max your quota before you even know. | 🟢 Cost tracking, budget throttling, Peak Hours Guard blocks runs during expensive windows. |
| 🔴 Recurring jobs (support, social, reports) — you have to remember to manually kick them off. | 🟢 Heartbeats handle regular work on a schedule. Management supervises. |
| 🔴 You have an idea — find repo, fire up Claude Code, keep a tab open, babysit it. | 🟢 Add a task. Your agent works on it until done. Management reviews. |
| 🔴 Can't manage agents from your phone — need a laptop with terminal. | 🟢 PWA on any device. Telegram plugin for updates, approvals, task creation. |
| 🔴 Adding integrations means writing glue code from scratch. | 🟢 Plugin system — Telegram, webhooks, custom tools — without touching core. |

<br>

---

## Features

<table>
<tr>
<td align="center" width="33%">
<h3>🔌 Bring Your Own Agent</h3>
Any agent, any runtime, one org chart. If it can receive a heartbeat, it's hired.
</td>
<td align="center" width="33%">
<h3>🎯 Goal Alignment</h3>
Every task traces back to the company mission. Agents know <em>what</em> to do and <em>why</em>.
</td>
<td align="center" width="33%">
<h3>💓 Heartbeats</h3>
Agents wake on a schedule, check work, and act. Delegation flows up and down the org chart.
</td>
</tr>
<tr>
<td align="center">
<h3>💰 Cost Control</h3>
Monthly budgets per agent. Peak Hours Guard blocks runs during expensive time windows.
</td>
<td align="center">
<h3>🏢 Multi-Company</h3>
One deployment, many companies. Complete data isolation. One control plane for your portfolio.
</td>
<td align="center">
<h3>🎫 Ticket System</h3>
Every conversation traced. Every decision explained. Full audit log.
</td>
</tr>
<tr>
<td align="center">
<h3>🛡️ Governance</h3>
You're the board. Approve hires, override strategy, pause or terminate any agent.
</td>
<td align="center">
<h3>📊 Org Chart</h3>
Hierarchies, roles, reporting lines. Your agents have a boss, a title, and a job description.
</td>
<td align="center">
<h3>📱 Mobile + Telegram</h3>
PWA on any device. Telegram plugin for updates, approvals, and task creation.
</td>
</tr>
<tr>
<td align="center">
<h3>🔌 Plugin System</h3>
Extend with Telegram, webhooks, MCP servers. First-class SDK with hot-reload.
</td>
<td align="center">
<h3>💾 Bulletproof Backups</h3>
Automatic compressed backups, one-command restore, optional S3 cloud sync.
</td>
<td align="center">
<h3>🔄 Self-Updating</h3>
Built-in version checker. Update notification banner. One command to upgrade.
</td>
</tr>
</table>

<br>

---

## Why FideliOS is special

| | |
|:---|:---|
| **Atomic execution.** | Task checkout and budget enforcement are atomic — no double-work and no runaway spend. |
| **Persistent agent state.** | Agents resume the same task context across heartbeats instead of restarting from scratch. |
| **Runtime skill injection.** | Agents learn FideliOS workflows and project context at runtime, without retraining. |
| **Governance with rollback.** | Approval gates are enforced, config changes are revisioned, bad changes can be rolled back. |
| **Goal-aware execution.** | Tasks carry full goal ancestry so agents see the "why," not just a title. |
| **Peak Hours Guard.** | Block automated heartbeats during expensive API pricing windows. |
| **Plugin architecture.** | Telegram, webhooks, MCP servers — first-class plugin SDK with hot-reload. |
| **Bulletproof backups.** | Automatic every 15 minutes, one-command restore, optional S3 cloud sync. |
| **Multi-company isolation.** | One deployment runs many companies with separate data and audit trails. |
| **Self-updating.** | Version checker notifies when a new release is available. |

<br>

---

## What FideliOS is not

| | |
|:---|:---|
| **Not a chatbot.** | Agents have jobs, not chat windows. |
| **Not an agent framework.** | We don't tell you how to build agents. We tell you how to run a company made of them. |
| **Not a workflow builder.** | No drag-and-drop pipelines. FideliOS models companies — with org charts, goals, and governance. |
| **Not a prompt manager.** | Agents bring their own prompts, models, and runtimes. FideliOS manages the organization. |
| **Not a single-agent tool.** | For teams. One agent? You don't need FideliOS. Twenty? You definitely do. |
| **Not cloud-dependent.** | Everything runs locally. Your data never leaves your machine unless you configure S3 backups. |

<br>

---

## Quick Start

> **Requirements:** Node.js 20+

```bash
npm install -g fidelios
fidelios run
```

Open **http://127.0.0.1:3100** — the setup wizard guides you through creating your first company and hiring your first agent.

No cloud account needed. Embedded PostgreSQL starts automatically.

<details>
<summary><strong>More commands</strong></summary>

```bash
fidelios run           # Start the server
fidelios onboard       # Re-run the setup wizard
fidelios doctor        # Check your environment
fidelios update        # Update to the latest version
fidelios db:restore    # Restore from a backup
fidelios --help        # See all commands
```

</details>

<details>
<summary><strong>Development (from source)</strong></summary>

```bash
git clone https://github.com/fideliosai/fidelios.git
cd fidelios
pnpm install
pnpm dev:watch
```

See [doc/DEVELOPING.md](doc/DEVELOPING.md) for the full development guide.

</details>

<br>

---

## Backup & Restore

FideliOS backs up your database automatically every 15 minutes.

```bash
fidelios db:restore --latest    # Restore from the latest backup
fidelios db:restore             # Interactive restore — pick from a list
```

<details>
<summary><strong>S3 Cloud Sync (optional)</strong></summary>

Add to `~/.fidelios/instances/default/config.json`:

```json
{
  "database": {
    "backup": {
      "s3": {
        "enabled": true,
        "bucket": "your-bucket",
        "region": "eu-west-1",
        "prefix": "fidelios/backups/"
      }
    }
  }
}
```

S3 sync happens after every local backup. If S3 is unreachable, local backups continue without interruption.

</details>

<br>

---

## Guides

| Guide | Description |
|:------|:------------|
| [Tailscale Remote Access](doc/TAILSCALE.md) | Access FideliOS from your phone over a secure private network |
| [Telegram Gateway Plugin](doc/TELEGRAM-PLUGIN.md) | Manage FideliOS via Telegram — updates, approvals, two-way messaging |
| [Developing](doc/DEVELOPING.md) | Full development guide for contributors |
| [CLI Reference](doc/CLI.md) | All CLI commands and options |

<br>

---

## Architecture

```
fidelios/
├── cli/               # `fidelios` CLI — onboard, run, doctor, restore
├── server/            # Express API + Vite UI + embedded PostgreSQL
├── ui/                # React + Vite frontend
├── packages/
│   ├── db/            # Drizzle ORM, migrations, backup/restore
│   ├── shared/        # Types, config schema
│   ├── adapter-utils/ # Shared adapter base classes
│   ├── adapters/      # claude-local, codex-local, cursor-local, gemini…
│   └── plugins/       # Plugin SDK + examples
└── scripts/           # Release, backup, dev tooling
```

**Tech stack:** Node.js · TypeScript · Express · React · Vite · Drizzle ORM · embedded PostgreSQL

<br>

---

## Data Location

Your data lives here — nothing goes to the cloud unless you configure S3.

| OS | Path |
|:---|:-----|
| macOS / Linux | `~/.fidelios/instances/default/` |
| Windows | `%USERPROFILE%\.fidelios\instances\default\` |

Inside: `db/` — database · `data/backups/` — automatic backups · `config.json` — settings

<br>

---

## License

MIT — see [LICENSE](LICENSE).

<br>

---

<p align="center">
  <img src="doc/assets/footer.jpg" alt="" width="720" />
</p>

<p align="center">
  <sub>Open source. Self-hosted. Built for people who want to run companies, not babysit agents.</sub>
</p>
