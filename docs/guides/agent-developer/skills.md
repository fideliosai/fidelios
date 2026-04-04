---
title: Skills
summary: Reusable instruction modules that extend what agents can do
---

Skills are reusable markdown documents that teach agents how to perform specific procedures. Rather than embedding every procedure in an agent's base prompt, skills are loaded on demand — an agent sees skill metadata in its context, decides if a skill is relevant, and loads the full instructions when needed.

## What Skills Are For

Skills encode repeatable know-how:

- How to call a specific API or CLI tool
- How to follow a company-specific workflow
- How to interact with a database, deployment system, or external service

A skill is not code — it is a structured markdown document with instructions. The agent interprets and executes those instructions using its own reasoning.

## The Company Skill Library

Each company maintains a library of installed skills. Skills can be:

- **Scanned from project workspaces** — FideliOS discovers `SKILL.md` files in linked project directories
- **Imported from a URL** — shared skills from external repositories
- **Manually created** — written directly in the FideliOS skill editor

View and manage skills at **Settings → Skills** in the board UI.

## Assigning Skills to Agents

Skills are assigned per-agent. An agent only has access to skills explicitly assigned to it.

**From the UI:** Open an agent's detail page → Skills tab → Add Skill.

**Via API:**

```
POST /api/agents/{agentId}/skills/sync
{
  "skillIds": ["skill-id-1", "skill-id-2"]
}
```

This replaces the agent's full skill list. To add skills incrementally, fetch the current list first and merge.

**At hire time:** When creating an agent, include `desiredSkills` in the request body to assign skills immediately.

## How Skills Work at Runtime

1. The agent's adapter injects skill metadata (name + description only) into the agent's context.
2. The agent reads each skill's description and decides if it's relevant to the current task.
3. If relevant, the adapter loads the full `SKILL.md` content and injects it.
4. The agent follows the skill's instructions.

This lazy-loading pattern keeps the base context small. Agents only pay the token cost for skills they actually use.

## Writing a Skill

Skills live in directories with a `SKILL.md` file:

```
skills/
└── my-skill/
    ├── SKILL.md
    └── references/
        └── api-examples.md
```

### SKILL.md Frontmatter

```markdown
---
name: my-skill
description: >
  Use when the agent needs to do X. Don't use when Y.
  Write this as routing logic — the agent reads this
  to decide whether to load the full skill.
---

# My Skill

Step-by-step instructions...
```

The `description` field is critical. It is the only part of the skill always visible to the agent. Write it as clear routing logic: when should this skill be loaded, and when should it not be.

See [Writing a Skill](/guides/agent-developer/writing-a-skill) for a full guide on skill structure and best practices.

## Scanning Skills from a Project

If your project workspace contains skill directories, FideliOS can discover them automatically:

```
POST /api/companies/{companyId}/skills/scan-projects
```

FideliOS walks each linked project workspace, finds all `SKILL.md` files, and upserts them into the company skill library. Run this after adding or updating skills in your repository.

## Version and Sync

Skills in the company library are versioned. When you update a skill (by pushing a new version to git and rescanning), FideliOS records the change. Agents continue using the previous version until the library is explicitly updated.

Skills assigned to agents do not auto-update. Re-sync explicitly after a skill update to push new instructions to agents.
