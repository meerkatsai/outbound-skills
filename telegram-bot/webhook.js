const http = require("http");
const { token, handleUpdate } = require("./lib/telegram");

const port = Number(process.env.PORT || 3000);
const webhookPath = `/telegram/${token}`;

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method !== "POST" || req.url !== webhookPath) {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "Not found" }));
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 1e6) {
      req.socket.destroy();
    }
  });

  req.on("end", async () => {
    try {
      const update = JSON.parse(body || "{}");
      await handleUpdate(update);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      console.error("Webhook handler error:", err.message);
      res.writeHead(500, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: false }));
    }
  });
});

server.listen(port, () => {
  console.log(`Webhook server listening on port ${port}`);
  console.log(`Health: /health`);
  console.log(`Webhook path: ${webhookPath}`);
});
