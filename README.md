<p align="center">
  <strong>FideliOS</strong><br/>
  <em>AI Agent Orchestration Platform</em>
</p>

<p align="center">
  <a href="#quickstart"><strong>Quickstart</strong></a> &middot;
  <a href="#features"><strong>Features</strong></a> &middot;
  <a href="https://github.com/maxzemtsov/fidelios"><strong>GitHub</strong></a> &middot;
  <a href="https://fidelios.nl"><strong>Website</strong></a>
</p>

<p align="center">
  <a href="https://github.com/maxzemtsov/fidelios/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" /></a>
  <a href="https://github.com/maxzemtsov/fidelios/stargazers"><img src="https://img.shields.io/github/stars/maxzemtsov/fidelios?style=flat" alt="Stars" /></a>
</p>

<br/>

## What is FideliOS?

**Open-source orchestration for AI agent teams.**

FideliOS is a Node.js server and React UI that orchestrates a team of AI agents to run a business. Bring your own agents, assign goals, and track work and costs from one dashboard.

It looks like a task manager — but under the hood it has org charts, budgets, governance, goal alignment, and agent coordination.

|        | Step            | Example                                                            |
| ------ | --------------- | ------------------------------------------------------------------ |
| **01** | Define the goal | _"Build the #1 AI note-taking app to $1M MRR."_                    |
| **02** | Hire the team   | CEO, CTO, engineers, designers, marketers — any bot, any provider. |
| **03** | Approve and run | Review strategy. Set budgets. Hit go. Monitor from the dashboard.  |

<br/>

### Works with

Claude Code, Codex, Cursor, OpenClaw, and any agent that can receive HTTP heartbeats.

<br/>

## Features

<table>
<tr>
<td align="center" width="33%">
<h3>Bring Your Own Agent</h3>
Any agent, any runtime, one org chart.
</td>
<td align="center" width="33%">
<h3>Goal Alignment</h3>
Every task traces back to the company mission.
</td>
<td align="center" width="33%">
<h3>Heartbeats</h3>
Agents wake on schedule, check work, and act.
</td>
</tr>
<tr>
<td align="center">
<h3>Cost Control</h3>
Monthly budgets per agent. When they hit the limit, they stop.
</td>
<td align="center">
<h3>Multi-Company</h3>
One deployment, many companies. Complete data isolation.
</td>
<td align="center">
<h3>Ticket System</h3>
Every conversation traced. Full audit log.
</td>
</tr>
<tr>
<td align="center">
<h3>Governance</h3>
Approve hires, override strategy, pause or terminate any agent.
</td>
<td align="center">
<h3>Org Chart</h3>
Hierarchies, roles, reporting lines.
</td>
<td align="center">
<h3>Bulletproof Backups</h3>
Compressed, verified backups with optional S3 cloud sync.
</td>
</tr>
</table>

<br/>

## Quickstart

Open source. Self-hosted. No account required.

```bash
git clone https://github.com/maxzemtsov/fidelios.git
cd fidelios
pnpm install
pnpm dev
```

This starts the API server at `http://localhost:3100`. An embedded PostgreSQL database is created automatically — no setup required.

> **Requirements:** Node.js 20+, pnpm 9.15+

<br/>

## Backup & Restore

FideliOS includes a bulletproof backup system:

```bash
# Backups run automatically every 60 minutes (compressed .sql.gz)
# List available backups
pnpm --filter @fidelios/db restore --list

# Restore from latest backup (creates safety snapshot first)
pnpm --filter @fidelios/db restore --latest
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

Backups sync to S3 after each local backup. If S3 is unreachable, local backups continue without interruption.

<br/>

## Development

```bash
pnpm dev              # Full dev (API + UI, watch mode)
pnpm build            # Build all
pnpm typecheck        # Type checking
pnpm test:run         # Run tests
pnpm db:generate      # Generate DB migration
pnpm db:migrate       # Apply migrations
```

See [doc/DEVELOPING.md](doc/DEVELOPING.md) for the full development guide.

<br/>

## Architecture

FideliOS is a fork of [Paperclip](https://github.com/paperclipai/paperclip) (MIT) with enhanced backup/restore, S3 cloud sync, and planned extensions for RAG/CAG and security layers.

**Key additions over upstream:**
- Gzip-compressed backups with integrity verification
- `db:restore` CLI with safety snapshots
- S3 cloud backup sync with graceful degradation
- Fixed jsonb serialization bug in backup system

<br/>

## License

MIT. See [LICENSE](LICENSE) for details.

Original code: Copyright (c) 2025 Paperclip AI.
Fork modifications: Copyright (c) 2026 FideliOS.

<br/>

---

<p align="center">
  <sub>Open source under MIT. Built for people who want to run companies, not babysit agents.</sub>
</p>
