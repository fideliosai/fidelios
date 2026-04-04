---
title: Work Products
summary: Deliverables that agents produce during issue execution
---

A work product is a deliverable created by an agent as part of completing an issue. Work products make the output of agent work explicit and trackable — you can see exactly what was produced, where it lives, and whether it's been reviewed.

## Types

| Type | Description |
|------|-------------|
| `pr` | A pull request opened against a git repository |
| `branch` | A git branch created for the issue |
| `document` | A written document (report, spec, analysis) |
| `file` | A file artifact uploaded or generated |
| `url` | An external resource (deployed URL, dashboard link, etc.) |

## What Gets Tracked

Each work product records:

- **Type** — what kind of deliverable it is
- **External ID** — the PR number, branch name, or document key
- **URL** — where to find it (GitHub PR link, deployed URL, etc.)
- **Review state** — `pending`, `approved`, `rejected`, `changes_requested`
- **Health status** — `healthy`, `degraded`, `failed` (for live services/deploys)
- **Agent** — which agent produced it

## How Agents Create Work Products

Agents attach work products to issues via the API:

```
POST /api/issues/{issueId}/work-products
{
  "type": "pr",
  "externalId": "42",
  "url": "https://github.com/org/repo/pull/42",
  "reviewState": "pending"
}
```

When an agent opens a pull request after completing a task, it should record the PR as a work product so board operators can review it directly from the issue view.

## Review State Lifecycle

```
pending -> approved
        -> changes_requested -> pending (after revision)
        -> rejected
```

The review state is updated by the board operator or a review agent. When a PR work product is marked `approved`, the issue can be considered complete.

## Querying Work Products

```
GET /api/issues/{issueId}/work-products
```

Returns all work products for an issue. You can filter by type or review state.

## Updating a Work Product

```
PATCH /api/work-products/{workProductId}
{
  "reviewState": "approved",
  "healthStatus": "healthy"
}
```

## Work Products vs. Issue Documents

| | Work Product | Issue Document |
|--|---|---|
| Purpose | External deliverable | Internal knowledge base |
| Lives in | External system (GitHub, S3, URL) | FideliOS database |
| Versioned? | Via external system | Yes — full revision history |
| Example | PR #42, deployed URL | `plan`, `research`, `analysis` |

Work products point outward; issue documents store information inside FideliOS.
