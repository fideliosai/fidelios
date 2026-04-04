---
title: FideliOS Entity Map
summary: Mapping of all FideliOS entities vs Paperclip, with nuances
---

# FideliOS Entity Map

This document enumerates every entity and concept in FideliOS, compared against the Paperclip reference docs. Use this as the source of truth for documentation coverage.

**Legend:**
- ✅ Exists in both FideliOS and Paperclip (same concept)
- 🔄 Exists in both but renamed or extended in FideliOS
- 🆕 FideliOS-only (not in Paperclip)
- ❌ In Paperclip docs but NOT in FideliOS

---

## Core Organizational Entities

| Entity | Status | Description | FideliOS Nuances |
|--------|--------|-------------|-----------------|
| **Company** | ✅ | Top-level multi-tenant organization unit | Same concept. FideliOS supports branding (logo, colors), peak hours config, and issue prefix per company. |
| **Agent** | ✅ | An AI employee hired by the company | Same concept. FideliOS adds: config revisions (audit trail), runtime state tracking, permissions grants, and a strict tree hierarchy (CEO → manager → IC). |
| **Issue / Task** | 🔄 | Unit of work assigned to an agent or user | Paperclip calls them "Tasks". FideliOS uses "Issues" (like Linear). Same concept. FideliOS adds: parent-child hierarchy, work products, documents, read states, inbox archive, origin kinds, and checkout/execution run IDs. |
| **Project** | ✅ | Long-running initiative grouping related issues | Same concept. FideliOS adds execution workspace policy and project workspaces. |
| **Goal** | ✅ | Hierarchical objectives (company → initiative → milestone → task) | Same concept. FideliOS uses levels: `company`, `initiative`, `milestone`, `task`. Goals own agents and projects. |
| **Company Membership** | 🆕 | Maps users to companies with roles | Not surfaced in Paperclip docs. FideliOS tracks who belongs to which company. |

---

## Agent System

| Entity | Status | Description | FideliOS Nuances |
|--------|--------|-------------|-----------------|
| **Adapter** | ✅ | Connector between FideliOS and an agent runtime | Same concept. FideliOS built-ins: `claude_local`, `codex_local`, `gemini_local`, `process`, `http`. |
| **Agent Config Revisions** | 🆕 | Full audit trail of every config change to an agent | Before/after snapshots with changed keys, source, and rollback support. Not in Paperclip. |
| **Agent Runtime State** | 🆕 | Session state + cumulative token/cost counters per agent | Tracks `session_id`, total tokens, total cost. Resetable. Not in Paperclip. |
| **Agent API Keys** | 🆕 | Short-lived JWT credentials issued per heartbeat run | FideliOS auto-injects `FIDELIOS_API_KEY` into each run. Not in Paperclip. |
| **Agent Wakeup Requests** | 🔄 | Triggers that cause an agent to run | Paperclip calls these heartbeat triggers. FideliOS extends with coalescing, idempotency keys, and multiple sources (issue event, comment mention, schedule, manual). |
| **Agent Task Sessions** | 🆕 | Context persistence across heartbeats for a single task | Allows agents to remember conversation context between runs. Not in Paperclip. |
| **Heartbeat Run** | ✅ | A single execution window of an agent | Same concept. FideliOS tracks stdout/stderr excerpts, exit codes, log refs, and streaming events. |
| **Heartbeat Run Events** | 🆕 | Streaming structured log events per run | Level (info/debug/warn/error), stream (stdout/stderr), message, payload. Real-time delivery. Not in Paperclip. |

---

## Task Management

| Entity | Status | Description | FideliOS Nuances |
|--------|--------|-------------|-----------------|
| **Issue Comment** | ✅ | Threaded discussion on an issue | Same concept. FideliOS supports @-mention triggers — mentioning an agent triggers a heartbeat. |
| **Issue Label** | ✅ | Tag on an issue for categorization | Same concept. |
| **Issue Attachment** | 🆕 | File upload linked to an issue | Multipart upload. Not mentioned in Paperclip. |
| **Issue Document** | 🆕 | Versioned markdown knowledge base per issue | Each document has a key (e.g. `plan`), full revision history, and a `baseRevisionId` for conflict-free updates. Not in Paperclip. |
| **Issue Work Product** | 🆕 | Deliverable produced during issue execution | Types: PR, branch, document, etc. Tracks external ID, URL, review state, and health status. Not in Paperclip. |
| **Issue Relation** | 🆕 | Typed links between issues (depends-on, blocks, etc.) | Not in Paperclip. |
| **Issue Read State** | 🆕 | Per-user read/unread tracking | Used for inbox and notification logic. Not in Paperclip. |
| **Label** | ✅ | Company-wide tag taxonomy | Same concept. |

---

## Execution & Workspaces

| Entity | Status | Description | FideliOS Nuances |
|--------|--------|-------------|-----------------|
| **Execution Workspace** | 🆕 | Isolated environment where an agent performs work | Strategies: `local_fs`, `git`. Supports `base_ref`, `branch_name`, `cwd`, `repo_url`. Not in Paperclip. |
| **Project Workspace** | 🆕 | Development/execution environment scoped to a project | Links a project to a local directory and/or git repo. Not in Paperclip. |
| **Workspace Operation** | 🆕 | A command or operation executed inside a workspace | Not in Paperclip. |
| **Workspace Runtime Service** | 🆕 | Long-running service inside an execution environment | Dev servers, databases, etc. Not in Paperclip. |

---

## Automation & Scheduling

| Entity | Status | Description | FideliOS Nuances |
|--------|--------|-------------|-----------------|
| **Routine** | 🆕 | Recurring automated task (like a scheduled agent job) | Paperclip may have basic scheduling, but FideliOS Routines are first-class: concurrency policies (`coalesce_if_active`, `skip_missed`), catch-up policies. |
| **Routine Trigger** | 🆕 | Cron or webhook trigger for a Routine | Supports cron expression + timezone, or inbound webhook with signing and replay window. |
| **Routine Run** | 🆕 | Execution record for a Routine | Tracks source, status, and links to issue when work produces one. |

---

## Governance & Approvals

| Entity | Status | Description | FideliOS Nuances |
|--------|--------|-------------|-----------------|
| **Approval** | ✅ | Board-gate for sensitive actions | Same concept. FideliOS approval types include agent hire, budget change, strategy change, and arbitrary custom types. |
| **Approval Comment** | 🆕 | Discussion thread on an approval | Separate from issue comments. Not in Paperclip. |

---

## Budget & Costs

| Entity | Status | Description | FideliOS Nuances |
|--------|--------|-------------|-----------------|
| **Budget Policy** | ✅ | Spending limit per scope (agent, project, company) | FideliOS adds `warn_percent`, `hard_stop_enabled`, and window kinds: `daily`, `weekly`, `monthly`. |
| **Budget Incident** | 🆕 | Alert triggered when budget threshold is crossed | Not in Paperclip. |
| **Cost Event** | ✅ | Per-execution billing record | FideliOS tracks provider (anthropic, openai, google), model, input/output/cached tokens, and cost in cents. |
| **Finance Event** | 🆕 | High-level financial transaction / balance tracking | Separate from cost events. For credits, top-ups, etc. Not in Paperclip. |

---

## Knowledge & Documentation

| Entity | Status | Description | FideliOS Nuances |
|--------|--------|-------------|-----------------|
| **Document** | 🆕 | Versioned markdown document scoped to an issue | Has a key (e.g. `plan`), revision history, latest body. Created via `PUT /api/issues/:id/documents/:key`. |
| **Document Revision** | 🆕 | A single version of a document | Each revision has a number and `baseRevisionId` for optimistic concurrency. |

---

## Configuration & Secrets

| Entity | Status | Description | FideliOS Nuances |
|--------|--------|-------------|-----------------|
| **Company Secret** | ✅ | Encrypted credential or sensitive config | FideliOS supports `local_encrypted` and `external_ref` providers. Rotation with version history. |
| **Company Secret Version** | 🆕 | Rotation history for a secret | Not in Paperclip. |
| **Company Skill** | 🔄 | Custom tool or skill available to agents | Paperclip mentions skills conceptually. FideliOS has a full skill library: versioned, scannable from project workspaces, assignable per-agent. |
| **Instance Settings** | 🆕 | Global system configuration (not per-company) | General and experimental settings. Not in Paperclip. |

---

## Plugin System

| Entity | Status | Description | FideliOS Nuances |
|--------|--------|-------------|-----------------|
| **Plugin** | 🆕 | Installable extension to FideliOS | Paperclip does not have a plugin system. FideliOS plugins can contribute: tools, webhooks, scheduled jobs, UI contributions, MCP servers, and Telegram bots. |
| **Plugin Config** | 🆕 | Configuration settings per plugin | Key-value settings for each plugin instance. |
| **Plugin Company Settings** | 🆕 | Company-level overrides for plugin behavior | Allows per-company customization of plugins. |
| **Plugin State** | 🆕 | Scoped key-value store for plugins | Scopes: instance, company, project, workspace, agent, issue, goal, run. |
| **Plugin Job** | 🆕 | Scheduled background job declared by a plugin | Cron-based. Tracked separately from routines. |
| **Plugin Job Run** | 🆕 | Execution record for a plugin job | Status, duration, error, logs. |
| **Plugin Webhook** | 🆕 | Inbound webhook delivery tracking for plugins | Pending, processing, succeeded, failed. Tracks payload and headers. |
| **Plugin Entity** | 🆕 | External entity managed by a plugin lifecycle | Not in Paperclip. |
| **Plugin Log** | 🆕 | Runtime logs from plugin workers | Structured logs per plugin instance. |

---

## Assets & Media

| Entity | Status | Description | FideliOS Nuances |
|--------|--------|-------------|-----------------|
| **Asset** | 🆕 | File upload (images, documents) | Stored and served via `/api/assets/:id/content`. Company logos are a subtype. |

---

## Authentication & Access Control

| Entity | Status | Description | FideliOS Nuances |
|--------|--------|-------------|-----------------|
| **Auth User** | ✅ | Human user account | Via Better Auth (email + OAuth). |
| **Auth Session** | ✅ | Authenticated user session | Standard session management. |
| **Auth Account** | 🆕 | Linked OAuth account (e.g. GitHub) | Better Auth social providers. |
| **Principal Permission Grant** | 🆕 | RBAC grant for a user or agent | Fine-grained permission grants beyond company membership. |
| **Board API Key** | 🆕 | API credential for external board/operator access | Long-lived keys for automation. |
| **CLI Auth Challenge** | 🆕 | Device flow auth for the CLI | `board-claim/:token` pattern. Not in Paperclip. |
| **Invite** | 🆕 | Onboarding invitation to join a company | Token-based, includes onboarding text (human and LLM-readable). |
| **Join Request** | 🆕 | Request to join a company | Approval-gated membership request. |
| **Instance User Role** | 🆕 | System-level admin role (not company-scoped) | Super-admin for FideliOS instance operators. |

---

## Activity & Audit

| Entity | Status | Description | FideliOS Nuances |
|--------|--------|-------------|-----------------|
| **Activity Log** | ✅ | Append-only audit trail of all significant events | Same concept. FideliOS exposes per-company and system-wide activity streams. |

---

## Summary Statistics

| Category | Total Entities | FideliOS-Only (🆕) | Shared (✅/🔄) | Paperclip-Only (❌) |
|----------|---------------|-------------------|---------------|-------------------|
| Core Org | 6 | 1 | 5 | 0 |
| Agent System | 8 | 5 | 3 | 0 |
| Task Management | 8 | 6 | 2 | 0 |
| Execution | 4 | 4 | 0 | 0 |
| Automation | 3 | 3 | 0 | 0 |
| Governance | 2 | 1 | 1 | 0 |
| Budget/Costs | 4 | 2 | 2 | 0 |
| Knowledge | 2 | 2 | 0 | 0 |
| Config/Secrets | 4 | 2 | 2 | 0 |
| Plugin System | 9 | 9 | 0 | 0 |
| Assets | 1 | 1 | 0 | 0 |
| Auth & Access | 9 | 7 | 2 | 0 |
| Activity | 1 | 0 | 1 | 0 |
| **Total** | **61** | **43** | **18** | **0** |

**FideliOS has 43 entities not found in Paperclip.** The plugin system, execution workspaces, routines, and document versioning are entirely new. Zero Paperclip entities were removed.

---

## Recommended Documentation Priority

### Tier 1 — Document First (core user journey)
1. What is FideliOS / Core Concepts
2. Agents + Adapters
3. Issues / Tasks
4. Heartbeat protocol
5. Approvals
6. Budget & Costs

### Tier 2 — Document Second (power users)
7. Projects & Goals
8. Skills
9. Routines & Scheduling
10. Execution Workspaces
11. Documents & Work Products

### Tier 3 — Developer Reference
12. Plugin System (full SDK)
13. REST API Reference
14. CLI Reference
15. Deployment & Configuration

---

*Generated by CTO agent for [IRO-353](/IRO/issues/IRO-353) — entity audit phase.*
