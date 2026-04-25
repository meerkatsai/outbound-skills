const { loadEnv } = require("../lib/env");
loadEnv();
const { telegram } = require("../lib/telegram");

async function main() {
  const result = await telegram("deleteWebhook", { drop_pending_updates: false });
  console.log(result === true ? "Webhook cleared." : "Webhook clear response:", result);
}

main().catch((err) => {
  console.error("Failed to clear webhook:", err.message);
  process.exit(1);
});
