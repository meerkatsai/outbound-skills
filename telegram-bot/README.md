# Telegram Bot Starter

This folder gives you a simple Telegram integration with:

- `bot.js`: long-polling bot that replies to messages
- `webhook.js`: webhook server for 24/7 cloud deployment
- `send.js`: script to push outbound messages to a known chat
- `scripts/set-webhook.js`: register your Telegram webhook URL
- `scripts/webhook-info.js`: inspect webhook delivery status
- `scripts/clear-webhook.js`: remove webhook (switch back to polling)

## 1. Create your bot in Telegram

1. Open Telegram and search `@BotFather`.
2. Send `/newbot`.
3. Pick a bot name and username (username must end in `bot`).
4. Copy the API token BotFather gives you.

## 2. Configure env vars

```bash
cd "/Users/santanudasgupta/Documents/New project/telegram-bot"
cp .env.example .env
```

Edit `.env` and set:

- `TELEGRAM_BOT_TOKEN` to your BotFather token
- `TELEGRAM_CHAT_ID` later (optional, for `send.js`)

## 3. Start the bot

### Local polling mode

```bash
npm start
```

### Webhook mode (for deployment)

```bash
npm run start:webhook
```

## 4. Test in Telegram

1. Open your bot chat in Telegram.
2. Click **Start** (or send `/start`).
3. Send:
   - `/ping` -> bot responds `pong`
   - `/chatid` -> bot returns your chat id

Copy that chat id to `.env` as `TELEGRAM_CHAT_ID` if you want proactive sends.

## 5. Enable webhook (production)

1. Deploy this folder to a host that gives you HTTPS (example: Render, Railway, Fly.io).
2. Set env vars in the host:
   - `TELEGRAM_BOT_TOKEN`
   - `WEBHOOK_BASE_URL` (example `https://your-app.onrender.com`)
   - `PORT` (most hosts inject this automatically)
3. Run this once:

```bash
npm run webhook:set
```

4. Verify:

```bash
npm run webhook:info
```

If you need to disable webhook (for polling again):

```bash
npm run webhook:clear
```

## 6. Send outbound messages from terminal

```bash
npm run send -- "Hello from local script"
```

## Troubleshooting

- `Missing TELEGRAM_BOT_TOKEN`: check `.env` exists and has the token.
- Bot does not respond: ensure `npm start` is still running.
- `409 Conflict`: another process is polling the same bot token. Stop the other one.
- Webhook not receiving: confirm `WEBHOOK_BASE_URL` is public HTTPS and `npm run webhook:info` shows no recent errors.
