# Telegram Gateway Plugin

Connect FideliOS to a Telegram supergroup with Forum Topics. Each agent gets its own topic — approvals, task updates, and conversations are routed automatically.

## Prerequisites

- A Telegram supergroup with **Forum Topics enabled**
- A Telegram bot (created via [@BotFather](https://t.me/BotFather))
- The bot added to your supergroup as **admin** (with "Manage Topics" permission)

## Step 1: Create a Telegram Bot

1. Open [@BotFather](https://t.me/BotFather) in Telegram
2. Send `/newbot`
3. Choose a name (e.g. "FideliOS HQ") and username (e.g. `fidelios_hq_bot`)
4. Save the **Bot Token** (looks like `1234567890:ABCdefGhIjKlMnOpQrStUvWxYz`)

## Step 2: Create a Supergroup with Forum Topics

1. Create a new Telegram group
2. Go to **Group Settings → Group Type → Supergroup** (if not already)
3. Enable **Topics** in Group Settings
4. Add your bot to the group as admin with these permissions:
   - Manage Topics
   - Send Messages
   - Pin Messages

## Step 3: Get the Chat ID

The easiest way to find your supergroup chat ID:

1. Add [@RawDataBot](https://t.me/RawDataBot) to your group temporarily
2. It will post a JSON message — look for `"chat": { "id": -100XXXXXXXXXX }`
3. That negative number is your Chat ID
4. Remove @RawDataBot from the group

## Step 4: Create Forum Topics

Create topics for your company's structure. Recommended layout:

```
Board → CEO [CompanyName]        — CEO reports, strategy decisions
Board → CTO [CompanyName]        — CTO reports, technical decisions
Hiring [CompanyName]             — New agent hiring approvals
Tasks [CompanyName]              — Task assignments and completions
System [CompanyName]             — Heartbeat status, errors, system events
```

For each topic, note the **Topic ID** — you can get it by:
1. Right-clicking the topic → Copy Link
2. The link format is `https://t.me/c/CHATID/TOPICID` — the last number is the Topic ID

**Tip:** Use different emoji icons per company for visual distinction:
- Iron Ball, Inc. → blue emoji
- MagicLeela → green emoji

## Step 5: Install the Plugin in FideliOS

1. Open FideliOS dashboard → **Settings → Plugins**
2. Click **Install Plugin**
3. Select **Telegram Gateway**
4. Fill in:
   - **Telegram Chat ID**: your supergroup chat ID (negative number)
   - **Telegram Bot Token**: the token from BotFather
   - **Default Topic ID**: the topic ID for general/unrouted messages
5. Click **Save Configuration**

## Step 6: Configure Topic Routing

The plugin routes messages to topics based on agent role and event type. The routing is configured in the plugin's `constants.ts`:

```typescript
// Topic mapping per company
const TOPIC_MAP = {
  "company-uuid-here": {
    ceo: 94,           // "Board → CEO" topic ID
    cto: 95,           // "Board → CTO" topic ID
    hiring: 96,        // "Hiring" topic ID
    tasks: 97,         // "Tasks" topic ID
    system: 98,        // "System" topic ID
  }
};
```

After editing, rebuild the plugin:
```bash
cd packages/plugins/examples/telegram-gateway
node build.mjs
```

The plugin hot-reloads — no server restart needed.

## Multi-Company Setup

### Strategy: Topic-per-role-per-company (Recommended)

For multiple companies in one Telegram group, prefix each topic with the company name and use color-coded emoji:

```
🔵 Iron Ball → CEO          (topic 94)
🔵 Iron Ball → CTO          (topic 95)
🔵 Iron Ball → Tasks        (topic 97)
🟢 MagicLeela → CEO         (topic 100)
🟢 MagicLeela → CTO         (topic 101)
🟢 MagicLeela → Tasks       (topic 102)
📋 Hiring (shared)           (topic 96)
⚙️ System (shared)           (topic 98)
```

At 3-5 companies this gives ~15-20 topics — well within Telegram's limits.

### Alternative: Separate group per company

For full isolation, create a separate Telegram supergroup for each company. Each group gets its own bot (or the same bot added to multiple groups). Configure a separate plugin instance per company.

## What Gets Sent to Telegram

| Event | Topic | Example |
|-------|-------|---------|
| Agent heartbeat completed | Agent's role topic | "CEO completed heartbeat: reviewed 3 tasks" |
| Task assigned | Tasks topic | "Task TRA-42 assigned to CTO" |
| Task completed | Tasks topic | "CTO completed TRA-42: implemented auth flow" |
| Approval requested | Agent's role topic | "CEO requests approval: hire new QA agent" |
| Approval granted/denied | Agent's role topic | "Approved: hire QA agent" |
| Agent hired | Hiring topic | "New agent: QA Lead (claude-local)" |
| Agent error | System topic | "CTO heartbeat failed: API timeout" |

## Replying from Telegram

You can reply to any bot message in Telegram. The plugin routes your reply back to FideliOS as a comment on the relevant issue/task. This enables two-way communication without opening the dashboard.

## Troubleshooting

**Bot doesn't send messages:**
- Check bot is admin in the group with "Manage Topics" permission
- Verify Chat ID is correct (should be negative, like `-1001234567890`)
- Check Bot Token is valid: `curl https://api.telegram.org/bot<TOKEN>/getMe`

**Messages go to wrong topic:**
- Verify topic IDs in the plugin config match your Telegram topics
- Check the topic mapping covers your company's agents

**Plugin shows "error" status:**
- Check FideliOS logs: `~/.fidelios/instances/default/logs/`
- Common cause: bot token expired or group permissions changed

## Security Notes

- Bot Token and Chat ID are stored in your **local database only**
- They are never transmitted to npm, GitHub, or any external service
- Each FideliOS installation has its own independent Telegram configuration
- If you uninstall with `fidelios uninstall`, plugin config is removed with the database
- If you uninstall with `fidelios uninstall` (safe mode), backups preserve the config
