const { loadEnv } = require("../lib/env");
loadEnv();
const { token, telegram } = require("../lib/telegram");

async function main() {
  const base = process.env.WEBHOOK_BASE_URL;
  if (!base) {
    throw new Error("Missing WEBHOOK_BASE_URL in .env");
  }

  const normalized = base.replace(/\/+$/, "");
  const url = `${normalized}/telegram/${token}`;

  const result = await telegram("setWebhook", { url });
  console.log(result === true ? `Webhook set: ${url}` : "Webhook set response:", result);
}

main().catch((err) => {
  console.error("Failed to set webhook:", err.message);
  process.exit(1);
});
