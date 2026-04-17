---
title: Keep FideliOS running
summary: Make sure FideliOS stays on even after you close Terminal or restart your computer
---

## The short version

By default, FideliOS runs only while the Terminal / PowerShell window is open. Close it, restart your computer, or let your laptop sleep — FideliOS stops.

If you want your AI agents to keep working **24/7 on their own**, follow one of the steps below for your operating system. It's a single command per OS and takes less than a minute.

If the installer asked "Should FideliOS keep running on its own?" and you picked **Yes** — you're already done, no action needed here.

If you picked **No** (or missed the question), pick one of the options below whenever you're ready.

---

## macOS — three options

### Option 1 (recommended): `fidelios service install` — launchd

```sh
fidelios service install          # register as a LaunchAgent, start now
fidelios service status           # verify it is running
```

What this does:

- Writes `~/Library/LaunchAgents/nl.fidelios.server.plist`
- Sets `RunAtLoad=true` → starts automatically every time you log in
- Sets `KeepAlive=true` → launchd restarts the server on any crash
- Service is isolated from your Terminal — closing/quitting Terminal has no effect
- Logs to `~/.fidelios/instances/default/fidelios.log`

To remove:

```sh
fidelios service uninstall
```

See [Service Commands](/cli/service-commands) for the full command reference.

### Option 2: Amphetamine (stay-awake, no service)

If you prefer to keep FideliOS running as a regular foreground process in Terminal and just want your Mac to never sleep while it's running, use the free **Amphetamine** app.

**Install** ([App Store link](https://apps.apple.com/us/app/amphetamine/id937984704)) — current version 5.3.2, works on macOS 10.13 Sierra and up.

**Settings that work well for FideliOS:**

1. Open Amphetamine → click the pill icon in the menu bar → **Preferences**
2. Go to **Triggers** → **+** → **New Trigger**
3. Pick **"While a process is running"** → search for `node` or `fidelios`
4. Set session behaviour:
   - **Display sleep:** Allowed (safe — you can let your screen sleep, FideliOS keeps running)
   - **System sleep:** Never
   - **Keyboard/mouse required:** No
5. Save. Amphetamine will automatically keep your Mac awake whenever `fidelios run` is in the process list.

Tradeoff vs Option 1: you still need a Terminal window open (or a detached screen/tmux session). Closing Terminal kills the server. Amphetamine only prevents sleep.

### Option 3: built-in `caffeinate` (no extra app)

If you just want a quick session without installing anything:

```sh
caffeinate -i fidelios run
```

This runs `fidelios` and keeps your Mac awake for as long as that command is running. Close the Terminal tab → everything stops.

---

## Linux — `fidelios service install` (systemd user unit)

```sh
fidelios service install
fidelios service status
```

Writes `~/.config/systemd/user/fidelios.service` and runs `systemctl --user enable --now fidelios` so FideliOS auto-starts on every user login and restarts on crash.

If you're running on a headless server and want FideliOS to start **at boot** (before any user logs in), enable user lingering:

```sh
sudo loginctl enable-linger $USER
```

Without lingering, systemd user services only run while the user is logged in via SSH or console.

---

## Windows — two options

### Option 1: Task Scheduler

1. Press `Win + R` → type `taskschd.msc` → Enter
2. **Action** → **Create Basic Task**
3. Name: `FideliOS`
4. Trigger: **When I log on**
5. Action: **Start a program**
6. Program: `C:\Users\<you>\AppData\Roaming\npm\fidelios.cmd`
   (adjust to wherever `where fidelios` reports — usually under `AppData\Roaming\npm`)
7. Arguments: `run`
8. Finish. FideliOS starts every time you sign in.

### Option 2: [nssm](https://nssm.cc/) — proper Windows service

NSSM wraps `fidelios run` as a true Windows service so it starts before user login.

```powershell
# One-time install of nssm itself:
winget install NSSM.NSSM

# Register fidelios:
nssm install FideliOS "$env:ProgramFiles\nodejs\node.exe" "$env:APPDATA\npm\node_modules\fidelios\dist\index.js" run
nssm set FideliOS Start SERVICE_AUTO_START
nssm start FideliOS
```

Status: `nssm status FideliOS` or use `services.msc` from the Start menu.

### Stay-awake alternative — Microsoft PowerToys Awake

Microsoft's official free Awake utility (part of PowerToys) is the Windows equivalent of Amphetamine. Install from:

```powershell
winget install Microsoft.PowerToys
```

Launch **PowerToys** → **Awake** → enable, pick **"Keep awake indefinitely"**. Your PC won't sleep while you have a Terminal window open running `fidelios run`.

Tradeoff: same as Amphetamine — the Terminal window still needs to be open.

---

## Which should I pick?

| You are... | Pick |
|------------|------|
| Running a FideliOS-powered business 24/7 | Option 1 on all OSes (`fidelios service install` or nssm) |
| Testing / learning / demo-ing | Stay-awake (Amphetamine / PowerToys Awake) + Terminal |
| On a shared Mac and don't want auto-start | Option 3 (`caffeinate`) — nothing to uninstall |
| On a cloud VM | Option 1 — services are what VMs are for |

If unsure, pick **Option 1**. You can always `fidelios service uninstall` later.

---

## Troubleshooting

See the [Troubleshooting guide](/start/troubleshooting) if the service installs but FideliOS isn't reachable, or if the service installs then exits immediately.
