---
title: Install on Linux
summary: Get FideliOS running on Linux
---

Get FideliOS running on Linux with a single command.

There are two install paths:

1. **Docker** (default, recommended) — one command, no Node.js required.
2. **Node.js CLI** (advanced) — same command as macOS, runs directly on your system.

## Prerequisites

- Ubuntu 22.04+, Debian 12+, Fedora 39+, or any modern systemd-based distribution
- `curl` installed (`sudo apt install curl` / `sudo dnf install curl`)
- A user account with `sudo` access

## Docker install (default)

Open a terminal and run:

```sh
curl -fsSL https://fidelios.nl/install-linux.sh | bash
```

The script:

1. Installs Docker Engine if it is not already present
2. Pulls `ghcr.io/fideliosai/fidelios:latest` from GitHub Container Registry
3. Runs FideliOS as a container named `fidelios` bound to port `3100`
4. Starts your browser at `http://localhost:3100`

Your data lives in the container's `~/.fidelios/` volume and persists across restarts.

### Managing the container

```sh
docker ps                      # see FideliOS running
docker stop fidelios           # stop
docker start fidelios          # start again
docker logs -f fidelios        # follow logs
docker rm -f fidelios          # remove (data is preserved — see below)
```

The container uses a named volume for `~/.fidelios/`, so removing the container
does **not** delete your companies, agents, or database.

### Updating

```sh
docker pull ghcr.io/fideliosai/fidelios:latest
docker rm -f fidelios
curl -fsSL https://fidelios.nl/install-linux.sh | bash
```

## Node.js CLI install (advanced)

If you already have Node.js 20+ installed and want to run FideliOS directly
(no Docker), use the macOS installer — it works on Linux too:

```sh
curl -fsSL https://fidelios.nl/install.sh | bash
```

Or install manually:

```sh
npm install -g fidelios@latest
fidelios onboard
fidelios run
```

This path gives you the full `fidelios` CLI (`fidelios service install`,
`fidelios stop`, `fidelios doctor`, etc.) and uses the monorepo's dev-runner
if you are working from a checkout.

### Run as a background service (CLI install only)

```sh
fidelios service install
fidelios service status
tail -f ~/.fidelios/instances/default/fidelios.log
```

See [Service Commands](/cli/service-commands) for full details including the
`--dev` / `--release` mode switch for contributors.

## Where your data lives

**Docker install:**

| Data | Location |
|------|----------|
| All runtime state | Docker named volume `fidelios` |

Run `docker volume inspect fidelios` to find the host path.

**CLI install:**

| Data | Location |
|------|----------|
| Config | `~/.fidelios/instances/default/config.json` |
| Database | `~/.fidelios/instances/default/db` |
| Secrets key | `~/.fidelios/instances/default/secrets/master.key` |
| Logs | `~/.fidelios/instances/default/logs` |

## What's Next

<CardGroup cols={2}>
  <Card title="Core Concepts" href="/start/core-concepts">
    Learn how agents, tasks, and goals fit together
  </Card>
  <Card title="Cloud VMs" href="/start/install/cloud-vms">
    Running FideliOS on AWS, Azure, or other cloud providers
  </Card>
  <Card title="Updating FideliOS" href="/cli/updating">
    Keep FideliOS up to date with the latest release
  </Card>
</CardGroup>
