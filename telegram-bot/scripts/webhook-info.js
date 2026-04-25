const { loadEnv } = require("../lib/env");
loadEnv();
const { telegram } = require("../lib/telegram");

async function main() {
  const info = await telegram("getWebhookInfo");
  console.log(JSON.stringify(info, null, 2));
}

main().catch((err) => {
  console.error("Failed to fetch webhook info:", err.message);
  process.exit(1);
});
