const { telegram, handleUpdate } = require("./lib/telegram");

async function run() {
  console.log("Starting Telegram bot with long polling...");
  let offset = 0;

  while (true) {
    try {
      const updates = await telegram("getUpdates", {
        offset,
        timeout: 25,
        allowed_updates: ["message"]
      });

      for (const update of updates) {
        offset = update.update_id + 1;
        await handleUpdate(update);
      }
    } catch (err) {
      console.error("Polling error:", err.message);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
