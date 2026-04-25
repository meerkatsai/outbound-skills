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
      "Bot is connected. Send /chatid anytime and I will return this chat id."
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

  await sendMessage(chatId, `You said: ${userText}`);
}

module.exports = {
  token,
  telegram,
  sendMessage,
  handleUpdate
};
