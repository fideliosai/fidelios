---
title: First time on a Mac?
summary: Opening Terminal and running your first command — for total beginners
---

If you've never used Terminal on your Mac, this guide gets you through the FideliOS install in three steps. No jargon.

## What is Terminal?

Terminal is a built-in Mac app that lets you type commands instead of clicking buttons. Every Mac has it. You just need to find it.

## Step 1 — Open Terminal

1. Press `⌘ + Space` (Command key + Spacebar). A search box appears in the middle of the screen.
2. Type `Terminal` and press `Enter`.

A window with a dark (or light) background and a blinking cursor will open. That's Terminal.

![Terminal opened on macOS](data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"/>)

## Step 2 — Paste the install command

1. Click the FideliOS install command below — the 📋 icon copies it to your clipboard:

   ```sh
   curl -fsSL https://fidelios.nl/install.sh | bash
   ```

2. Click inside the Terminal window so the cursor is active.
3. Press `⌘ + V` to paste.
4. Press `Enter`.

## Step 3 — Answer the prompts

The installer is chatty — it explains what it's doing at each step. You'll see coloured text like:

- `🔍 Checking Homebrew...` — it's checking if you have a package manager called Homebrew. If not, it asks permission to install it.
- `📦 Checking Node.js...` — same for Node.js.
- `🤖 Installing FideliOS CLI...` — the main install.
- `🚀 Starting FideliOS setup…` — the final wizard.

**When it asks a question**, just press `y` then `Enter` to say yes. Or press `Enter` alone to accept the default (which is almost always what you want).

**If it asks for your password**, type it in and press `Enter`. It won't show dots or asterisks — the cursor just stays still. That's normal. Finish typing and press `Enter`.

## Step 4 — Open FideliOS in your browser

When the installer finishes you'll see:

```
✔ FideliOS installation complete!
```

Open [http://127.0.0.1:3100](http://127.0.0.1:3100) in your browser. The setup wizard takes you the rest of the way.

## Common concerns

### "I don't want random scripts running on my Mac"

Fair. You can read the script before running it:

```sh
curl -fsSL https://fidelios.nl/install.sh | less
```

Press `q` to exit. When you're comfortable, run the install command.

### "Terminal asked for Xcode Command Line Tools"

This is Apple's tooling that Homebrew needs. Click **Install** in the pop-up dialog and wait a few minutes. The install resumes automatically.

### "Can I close Terminal afterward?"

Yes — after setup completes. To keep FideliOS running automatically after closing Terminal, also run:

```sh
fidelios service install
```

That registers FideliOS as a background service so it's always running at `http://127.0.0.1:3100` as long as your Mac is on.

### "How do I uninstall FideliOS if I don't like it?"

```sh
fidelios service uninstall   # stop the background service
fidelios uninstall           # remove the CLI and (optionally) all data
```

## What's Next

<CardGroup cols={2}>
  <Card title="Full Quickstart" href="/start/quickstart">
    The standard install guide for macOS, Linux, and Windows
  </Card>
  <Card title="Troubleshooting" href="/start/troubleshooting">
    When something goes wrong during install
  </Card>
</CardGroup>
