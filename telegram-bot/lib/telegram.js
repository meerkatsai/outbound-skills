const { loadEnv } = require("./env");

loadEnv();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error("Missing TELEGRAM_BOT_TOKEN. Copy .env.example to .env and set your token.");
}

const API_BASE = `https://api.telegram.org/bot${token}`;

async function telegram(method, params = {}) {
  const response = await fetch(`${API_BASE}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from Telegram API (${method})`);
  }

  const payload = await response.json();
  if (!payload.ok) {
    throw new Error(`Telegram API error (${method}): ${payload.description}`);
  }
  return payload.result;
}

async function sendMessage(chatId, text) {
  return telegram("sendMessage", { chat_id: chatId, text });
}

async function handleUpdate(update) {
  const message = update.message;
  if (!message || !message.chat) return;

  const chatId = message.chat.id;
  const userText = (message.text || "").trim();
  if (!userText) return;

  if (userText === "/start") {
    await sendMessage(
      chatId,
      "Bot is connected. Commands: /chatid, /ping, /notify <message>."
    );
    return;
  }

  if (userText === "/chatid") {
    await sendMessage(chatId, `Your chat id is: ${chatId}`);
    return;
  }

  if (userText === "/ping") {
    await sendMessage(chatId, "pong");
    return;
  }

  if (userText.startsWith("/notify")) {
    const targetChatId = (process.env.TELEGRAM_CHAT_ID || "").trim();
    if (!targetChatId) {
      await sendMessage(chatId, "TELEGRAM_CHAT_ID is not set on the server.");
      return;
    }

    if (String(chatId) !== String(targetChatId)) {
      await sendMessage(chatId, "You are not allowed to use /notify.");
      return;
    }

    const notifyText = userText.replace(/^\/notify(@\w+)?\s*/, "").trim();
    if (!notifyText) {
      await sendMessage(chatId, "Usage: /notify Your message here");
      return;
    }

    await sendMessage(targetChatId, `Notification: ${notifyText}`);
    return;
  }

  await sendMessage(chatId, `You said: ${userText}`);
}

module.exports = {
  token,
  telegram,
  sendMessage,
  handleUpdate
};
