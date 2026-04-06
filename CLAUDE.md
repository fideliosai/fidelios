# FideliOS Development Rules

## Critical Safety Rules

- **NEVER** write `FIDELIOS_IN_WORKTREE`, `FIDELIOS_HOME`, or `FIDELIOS_WORKTREE_NAME` to `~/.fidelios/instances/default/.env`. The default instance .env must contain ONLY `FIDELIOS_AGENT_JWT_SECRET`. Violating this poisons all production launches.
- **NEVER** publish npm releases (`scripts/release.sh`) without explicit human approval.
- **NEVER** run `fidelios run` from the repo directory (`~/fidelios/`) — this triggers dev mode. Production must launch from `~` or via launchd.
- **NEVER** modify `~/.fidelios/instances/default/config.json` to point paths into `/var/folders/` or any temporary directory.
- **NEVER** delete database backups or `.env` files without creating a backup first.
- **ALWAYS** work on feature branches (`feature/IRO-XXX`), never commit to `main`.

## Architecture Quick Reference

- Monorepo: `cli/`, `server/`, `ui/`, `packages/` (db, shared, adapters, plugins)
- Runtime data: `~/.fidelios/instances/default/` (config, db, backups, logs, .env)
- Production port: 3100, PostgreSQL port: 54331
- Dev mode: `node scripts/dev-runner.mjs dev` (from repo dir)
- Production: `fidelios-start` alias or `launchctl load ~/Library/LaunchAgents/nl.fidelios.server.plist`

## Release Process

1. All changes on feature branches, merged via PR
2. `scripts/release.sh --bump patch` — requires human approval
3. Script: typecheck → build → bundle CLI → publish npm → git tag → restore working tree
4. Plugin examples are copied into `server/packages/plugins/examples` during release and cleaned up after

## Key Files

- `server/src/worktree-config.ts` — worktree isolation logic (has guard against .env poisoning)
- `cli/src/commands/run.ts` — entry point for `fidelios run` (detects dev vs production mode)
- `cli/src/config/store.ts` — config path resolution (searches ancestor dirs for .fidelios/config.json)
- `scripts/release.sh` — release automation
- `OPERATIONS.md` — full operations guide
