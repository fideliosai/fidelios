<div align="center">

```
███████╗██╗██████╗ ███████╗██╗     ██╗ ██████╗ ███████╗
██╔════╝██║██╔══██╗██╔════╝██║     ██║██╔═══██╗██╔════╝
█████╗  ██║██║  ██║█████╗  ██║     ██║██║   ██║███████╗
██╔══╝  ██║██║  ██║██╔══╝  ██║     ██║██║   ██║╚════██║
██║     ██║██████╔╝███████╗███████╗██║╚██████╔╝███████║
╚═╝     ╚═╝╚═════╝ ╚══════╝╚══════╝╚═╝ ╚═════╝ ╚══════╝
```

**AI Agent Orchestration Platform**

*One dashboard to hire, manage, and scale your AI agent team*

[![MIT License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Node 20+](https://img.shields.io/badge/node-20%2B-brightgreen)](https://nodejs.org)
[![Stars](https://img.shields.io/github/stars/fideliosai/fidelios?style=flat)](https://github.com/fideliosai/fidelios/stargazers)

[**Quick Start**](#quick-start) · [**Features**](#features) · [**Architecture**](#architecture) · [**Roadmap**](ROADMAP.md) · [**fidelios.nl**](https://fidelios.nl)

</div>

<br>

<div align="center">
  <video src="https://github.com/user-attachments/assets/e64935a9-1676-440e-9120-0e7ce6989a44" width="720" controls></video>
</div>

<br>

## What is FideliOS?

# Open-source operating system for AI-driven companies

FideliOS runs a **team of AI agents like a real company** — org charts, goals, budgets, schedules, and governance — all from a local dashboard you host yourself.

It looks like a task manager — but under the hood it has org charts, budgets, governance, goal alignment, agent coordination, plugin integrations, and mobile access.

**Manage business goals, not terminal windows.**

|        | Step            | Example                                                            |
| ------ | --------------- | ------------------------------------------------------------------ |
| **01** | Define the goal | *"Build the #1 AI note-taking app to $1M MRR."*                   |
| **02** | Hire the team   | CEO, CTO, engineers, designers, marketers — any agent, any provider |
| **03** | Approve and run | Review strategy. Set budgets. Hit go. Monitor from the dashboard.  |

Works with **Claude Code, Codex, Cursor, Gemini, OpenClaw**, and any agent that can receive HTTP heartbeats.

<br>

---

## FideliOS is right for you if

- You want to build **autonomous AI companies** — not just run scripts
- You **coordinate many different agents** (Claude, Codex, Cursor, Gemini) toward a common goal
- You have **20 simultaneous agent terminals** open and lose track of what everyone is doing
- You want agents running **autonomously 24/7**, but still want to audit work and chime in when needed
- You want to **monitor costs** and enforce budgets before they spiral
- You want a process for managing agents that **feels like using a task manager**
- You want to manage your autonomous businesses **from your phone** via PWA or Telegram
- You need **plugins** — Telegram gateway, webhooks, custom MCP servers — not just a closed system

<br>

---

## Problems FideliOS solves

| Without FideliOS | With FideliOS |
|---|---|
| You have 20 Claude Code tabs open and can't track which one does what. On reboot you lose everything. | Tasks are ticket-based, conversations are threaded, sessions persist across reboots. |
| You manually gather context from several places to remind your agent what you're working on. | Context flows from the task up through the project and company goals — your agent always knows what to do and why. |
| Folders of agent configs are disorganized and you're re-inventing task management and coordination between agents. | FideliOS gives you org charts, ticketing, delegation, and governance out of the box — so you run a company, not a pile of scripts. |
| Runaway loops waste hundreds of dollars of tokens and max your quota before you even know what happened. | Cost tracking surfaces token budgets and throttles agents when they're out. Peak Hours Guard blocks heartbeats during expensive time windows. |
| You have recurring jobs (customer support, social, reports) and have to remember to manually kick them off. | Heartbeats handle regular work on a schedule. Management supervises. |
| You have an idea, you have to find your repo, fire up Claude Code, keep a tab open, and babysit it. | Add a task in FideliOS. Your coding agent works on it until it's done. Management reviews their work. |
| You can't manage agents from your phone — you need a laptop with terminal open. | PWA works on any device. Telegram plugin lets you receive updates, approve work, and create tasks from your phone. |
| Adding integrations means writing glue code from scratch every time. | Plugin system lets you add Telegram, webhooks, custom tools — without touching core code. |

<br>

---

## Why FideliOS is special

FideliOS handles the hard orchestration details correctly.

| | |
|---|---|
| **Atomic execution.** | Task checkout and budget enforcement are atomic — no double-work and no runaway spend. |
| **Persistent agent state.** | Agents resume the same task context across heartbeats instead of restarting from scratch. |
| **Runtime skill injection.** | Agents learn FideliOS workflows and project context at runtime, without retraining. |
| **Governance with rollback.** | Approval gates are enforced, config changes are revisioned, and bad changes can be rolled back. |
| **Goal-aware execution.** | Tasks carry full goal ancestry so agents consistently see the "why," not just a title. |
| **Peak Hours Guard.** | Define UTC time windows to block automated heartbeats — avoid expensive API calls during peak pricing. |
| **Plugin architecture.** | Extend with Telegram, webhooks, MCP servers — first-class plugin SDK with hot-reload in development. |
| **Bulletproof backups.** | Automatic compressed backups every 15 minutes, one-command restore, optional S3 cloud sync. |
| **True multi-company isolation.** | Every entity is company-scoped — one deployment can run many companies with separate data and audit trails. |
| **Self-updating.** | Built-in version checker notifies you when a new release is available — update with one command. |

<br>

---

## What FideliOS is not

| | |
|---|---|
| **Not a chatbot.** | Agents have jobs, not chat windows. |
| **Not an agent framework.** | We don't tell you how to build agents. We tell you how to run a company made of them. |
| **Not a workflow builder.** | No drag-and-drop pipelines. FideliOS models companies — with org charts, goals, budgets, and governance. |
| **Not a prompt manager.** | Agents bring their own prompts, models, and runtimes. FideliOS manages the organization they work in. |
| **Not a single-agent tool.** | This is for teams. If you have one agent, you probably don't need FideliOS. If you have twenty — you definitely do. |
| **Not cloud-dependent.** | Everything runs locally. Your data never leaves your machine unless you configure S3 backups. |

<br>

---

## Features

<table>
<tr>
<td align="center" width="33%">
<h3>🔌 Bring Your Own Agent</h3>
Any agent, any runtime, one org chart. Claude, Codex, Cursor, Gemini, OpenClaw — if it can receive a heartbeat, it's hired.
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
Monthly budgets per agent. When they hit the limit, they stop. Peak Hours Guard blocks runs during expensive windows.
</td>
<td align="center">
<h3>🏢 Multi-Company</h3>
One deployment, many companies. Complete data isolation. One control plane for your portfolio.
</td>
<td align="center">
<h3>🎫 Ticket System</h3>
Every conversation traced. Every decision explained. Full tool-call tracing and immutable audit log.
</td>
</tr>
<tr>
<td align="center">
<h3>🛡️ Governance</h3>
You're the board. Approve hires, override strategy, pause or terminate any agent — at any time.
</td>
<td align="center">
<h3>📊 Org Chart</h3>
Hierarchies, roles, reporting lines. Your agents have a boss, a title, and a job description.
</td>
<td align="center">
<h3>📱 Mobile + Telegram</h3>
PWA works on any device. Telegram plugin for updates, approvals, and task creation from your phone.
</td>
</tr>
<tr>
<td align="center">
<h3>🔌 Plugin System</h3>
Extend with Telegram, webhooks, custom MCP servers. First-class SDK with hot-reload in development.
</td>
<td align="center">
<h3>💾 Bulletproof Backups</h3>
Automatic compressed backups, one-command restore, optional S3 cloud sync.
</td>
<td align="center">
<h3>🔄 Self-Updating</h3>
Built-in version checker. Blue banner when update available. One command to upgrade.
</td>
</tr>
</table>

<br>

---

## Quick Start

> **Requirements:** Node.js 20+

### Install

```bash
npm install -g fidelios
```

### Run

```bash
fidelios run
```

Open **http://127.0.0.1:3100** — the setup wizard will guide you through creating your first company and hiring your first agent.

No cloud account needed. An embedded PostgreSQL database starts automatically.

### Useful commands

```bash
fidelios run           # Start the server
fidelios onboard       # Re-run the setup wizard
fidelios doctor        # Check your environment
fidelios update        # Update to the latest version
fidelios db:restore    # Restore from a backup
fidelios --help        # See all commands
```

### Development (from source)

```bash
git clone https://github.com/fideliosai/fidelios.git
cd fidelios
pnpm install
pnpm dev:watch
```

<br>

---

## Backup & Restore

FideliOS backs up your database automatically every 15 minutes.

```bash
# Restore from the latest backup (creates a safety snapshot first)
fidelios db:restore --latest

# Interactive restore — pick from a list
fidelios db:restore
```

### S3 Cloud Sync (optional)

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

<br>

---

## Guides

| Guide | Description |
|-------|-------------|
| [Tailscale Remote Access](doc/TAILSCALE.md) | Access FideliOS from your phone or any device over a secure private network |
| [Telegram Gateway Plugin](doc/TELEGRAM-PLUGIN.md) | Manage FideliOS via Telegram — agent updates, approvals, two-way messaging |
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

## Development

```bash
pnpm dev:watch      # Start dev server (API + Vite, watch mode, port 3100)
pnpm build          # Build all packages
pnpm typecheck      # TypeScript type-check across all packages
pnpm test:run       # Run test suite
pnpm db:generate    # Generate a new database migration
pnpm db:migrate     # Apply pending migrations
pnpm db:restore     # Restore database from a backup
```

See [doc/DEVELOPING.md](doc/DEVELOPING.md) for the full development guide.

<br>

---

## Data Location

Your data lives here — nothing goes to the cloud unless you configure S3.

| OS | Path |
|---|---|
| macOS / Linux | `~/.fidelios/instances/default/` |
| Windows | `%USERPROFILE%\.fidelios\instances\default\` |

Inside: `db/` — database · `data/backups/` — automatic backups · `config.json` — settings

<br>

---

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">
  <sub>Open source. Self-hosted. Built for people who want to run companies, not babysit agents.</sub>
</div>
