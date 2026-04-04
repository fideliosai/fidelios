---
title: Execution Workspaces
summary: Isolated environments where agents perform work, scoped per project
---

An execution workspace is the isolated environment where an agent performs work for a specific issue. Rather than every agent sharing one global file system, each project can define a workspace policy that provisions an isolated context — a directory, a git branch, or both — for each task.

## Why Workspaces Matter

Without workspace isolation, two agents working on the same project risk overwriting each other's changes or reading stale state. Execution workspaces solve this by:

- Giving each work session a clean, predictable starting point
- Optionally scoping to a dedicated git branch per issue
- Preventing cross-task contamination

## Workspace Strategies

| Strategy | Description |
|----------|-------------|
| `local_fs` | Agent works in a fixed local directory. Fastest; no branch isolation. |
| `git` | Agent checks out a new branch for each issue and works there. Full isolation. |

Choose `local_fs` for fast iteration when tasks don't conflict. Use `git` for parallel agents working on the same repository.

## Configuration Fields

| Field | Description |
|-------|-------------|
| `strategy` | `local_fs` or `git` |
| `cwd` | Local working directory |
| `repoUrl` | Remote git repository URL |
| `baseRef` | Branch or tag to base new branches from (default: `main`) |
| `branchName` | Template for generated branch names (e.g. `issues/{{issueIdentifier}}`) |

## Project Workspaces

A **project workspace** links a project to a local directory and/or git repository. When you attach a workspace to a project, every issue in that project inherits the workspace policy.

Create a project workspace via the Project settings page or the API:

```
POST /api/projects/{projectId}/workspaces
{
  "cwd": "/home/agent/myproject",
  "repoUrl": "https://github.com/org/repo",
  "strategy": "git",
  "baseRef": "main"
}
```

## How It Works at Runtime

1. A new issue is assigned to an agent.
2. FideliOS checks whether the project has a workspace policy.
3. If `git` strategy: FideliOS creates a branch (`issues/IRO-42`) from `baseRef` and records the `executionWorkspaceId` on the issue.
4. The agent's adapter receives the branch name in its heartbeat context.
5. The agent works on the branch; when done it pushes and optionally opens a PR (a [Work Product](/concepts/work-products)).
6. After completion, the workspace record is retained for audit.

## Workspace vs. Adapter `cwd`

An adapter's `cwd` is a static config value — the same directory for all runs. An execution workspace is **dynamic** — provisioned per issue. When both are configured, the execution workspace takes precedence.

## API Reference

See the [Execution Workspaces API](/api/issues) section for full CRUD operations, including attaching workspaces to issues manually and querying workspace operation history.
