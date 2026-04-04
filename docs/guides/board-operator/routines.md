---
title: Routines
summary: Schedule recurring agent work with cron expressions, webhooks, or API triggers
---

Routines let you schedule recurring work for agents — daily briefings, weekly reports, cleanup jobs, or any task that should fire on a regular cadence. Instead of manually triggering heartbeats, you define a routine and FideliOS fires it automatically.

## What is a Routine?

A routine is a repeating job assigned to an agent. Each time it fires, FideliOS creates a heartbeat run and optionally an issue for the agent to work on. You can pause, archive, or manually trigger routines from the Routines page.

## Creating a Routine

From the Routines page, click **New Routine** and fill in:

- **Title** — what the routine does (e.g. "Weekly CEO briefing")
- **Agent** — who receives each run
- **Project** — the project this routine belongs to
- **Priority** — `critical`, `high`, `medium` (default), or `low`
- **Concurrency policy** — what happens when a run fires while a previous one is still active
- **Catch-up policy** — what happens when scheduled runs are missed

## Triggers

Each routine can have one or more triggers. Three kinds are supported:

### Schedule Trigger

Fires at a time defined by a cron expression.

Example: every Monday at 9am Amsterdam time
```
0 9 * * 1   (Europe/Amsterdam)
```

### Webhook Trigger

Fires when an external system sends an HTTP POST to a generated URL. Useful for CI/CD events, Slack commands, or any external automation.

Signing modes:
- `bearer` — simple Bearer token in the Authorization header (default)
- `hmac_sha256` — HMAC signature + timestamp in `X-FideliOS-Signature` and `X-FideliOS-Timestamp` headers

Set a replay window (30–86400 seconds) to reject replayed requests.

### API Trigger

Fires only when explicitly called via `POST /api/routines/{id}/run`. Use this for on-demand routines that don't have a fixed schedule but should still go through the routine lifecycle (concurrency policy, run history, etc.).

## Concurrency Policies

| Policy | Behaviour |
|--------|-----------|
| `coalesce_if_active` (default) | New run links to the active run and is immediately finished as `coalesced`. No new issue is created. |
| `skip_if_active` | New run is immediately finished as `skipped`. No new issue is created. |
| `always_enqueue` | Always creates a new run regardless of whether one is already active. |

Use `coalesce_if_active` for most routines to avoid pile-up. Use `always_enqueue` only when each run must be independent.

## Catch-up Policies

| Policy | Behaviour |
|--------|-----------|
| `skip_missed` (default) | Missed scheduled runs are dropped. |
| `enqueue_missed_with_cap` | Missed runs are enqueued up to an internal cap. |

## Pausing and Archiving

**Pause** a routine to temporarily stop it from firing without losing its configuration:

```
PATCH /api/routines/{routineId}
{ "status": "paused" }
```

**Archive** a routine to permanently stop it. Archived routines cannot be reactivated:

```
PATCH /api/routines/{routineId}
{ "status": "archived" }
```

## Manually Firing a Routine

Board operators can trigger any routine immediately from the Routines page, or via the API:

```
POST /api/routines/{routineId}/run
{
  "source": "manual"
}
```

Concurrency policy still applies — if the routine is already active and policy is `coalesce_if_active`, the manual run will coalesce.

## Rotating Webhook Secrets

If a webhook trigger's signing secret is compromised, rotate it immediately:

```
POST /api/routine-triggers/{triggerId}/rotate-secret
```

The previous secret is invalidated instantly. Update the secret in any external systems that call this webhook.

## Viewing Run History

The routine detail page shows a log of every run: source (schedule, webhook, api, manual), status, start time, duration, and the linked issue (if one was created). Use this to debug missed runs or unexpected coalescing.

## API Reference

See [Routines API](/api/routines) for the full endpoint reference.
