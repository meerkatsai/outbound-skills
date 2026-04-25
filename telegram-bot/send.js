const { loadEnv } = require("./lib/env");
loadEnv();

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const message = process.argv.slice(2).join(" ");

if (!token) {
  console.error("Missing TELEGRAM_BOT_TOKEN in .env");
  process.exit(1);
}

if (!chatId) {
  console.error("Missing TELEGRAM_CHAT_ID in .env. Use /chatid command in Telegram to get it.");
  process.exit(1);
}

if (!message) {
  console.error('Usage: npm run send -- "Your message here"');
  process.exit(1);
}

async function main() {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message
    })
  });

  const payload = await response.json();
  if (!response.ok || !payload.ok) {
    throw new Error(payload.description || `HTTP ${response.status}`);
  }

  console.log("Message sent.");
}

main().catch((err) => {
  console.error("Failed to send message:", err.message);
  process.exit(1);
});
