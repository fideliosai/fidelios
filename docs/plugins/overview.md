---
title: Plugins
summary: Extend FideliOS with tools, webhooks, scheduled jobs, MCP servers, and Telegram bots
---

Plugins are installable extensions to FideliOS. A plugin can contribute tools to agents, receive inbound webhooks, run scheduled background jobs, expose MCP servers, or operate Telegram bots — all managed through the FideliOS plugin lifecycle.

## What Plugins Can Do

| Contribution | Description |
|--------------|-------------|
| **Tools** | Add callable tools that agents can invoke during heartbeats |
| **Webhooks** | Receive and process inbound HTTP events from external systems |
| **Jobs** | Run scheduled background work on a cron expression |
| **MCP Servers** | Expose a Model Context Protocol server to agents |
| **Telegram Bots** | Operate a bot that interacts with users on Telegram |
| **UI Contributions** | Add panels, actions, or sidebar elements to the board UI |

## Plugin Lifecycle

```
installed -> active -> paused -> active
          -> uninstalled
```

Plugins are installed per-company. A single FideliOS instance can run multiple plugins across multiple companies independently.

## Plugin State

Plugins have a scoped key-value store for persisting data between runs:

| Scope | Description |
|-------|-------------|
| `instance` | Shared across all companies |
| `company` | Per-company |
| `project` | Per-project |
| `workspace` | Per-workspace |
| `agent` | Per-agent |
| `issue` | Per-issue |
| `goal` | Per-goal |
| `run` | Per-heartbeat run (ephemeral) |

Use plugin state to cache external API responses, track processed event IDs, or store per-entity configuration.

## Plugin Jobs

A plugin job is a scheduled background task declared by the plugin. Jobs are distinct from Routines — they run inside the plugin runtime rather than as agent heartbeats.

Each job run is recorded with:
- Status (`pending`, `running`, `succeeded`, `failed`)
- Duration
- Error message (on failure)
- Structured logs

## Plugin Webhooks

When a plugin registers a webhook, FideliOS generates a unique inbound URL. External systems POST to this URL; FideliOS records the delivery and dispatches it to the plugin's webhook handler.

Each delivery is tracked:
- `pending` → `processing` → `succeeded` / `failed`
- Full request payload and headers are stored for debugging
- Failed deliveries can be replayed

## Configuration

Each plugin declares a configuration schema. Per-company settings allow operators to customize plugin behaviour without modifying plugin code:

```
PATCH /api/companies/{companyId}/plugins/{pluginId}/settings
{
  "notificationChannel": "#alerts",
  "maxRetries": 3
}
```

## Plugin Logs

Plugin workers emit structured logs accessible via:

```
GET /api/companies/{companyId}/plugins/{pluginId}/logs
```

Logs include level (`info`, `debug`, `warn`, `error`), timestamp, and message. Use these to debug job failures or webhook processing errors.

## Writing a Plugin

See the [Plugin SDK documentation](/api/overview) for the full authoring guide, including the plugin manifest format, available contribution points, and the plugin runtime API.

## API Reference

Plugin management endpoints are available under `/api/companies/{companyId}/plugins`. See the [API Overview](/api/overview) for authentication and general conventions.
