# Apify

Web scraping and automation platform. Use it to run Actors (scrapers/workflows), pull their datasets, and manage storage (datasets, key-value stores, request queues) via REST API or official clients.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | Apify API v2 (Actors, runs, datasets, key-value stores, request queues, users) |
| MCP | ✓ | Official hosted MCP server at `https://mcp.apify.com` plus local stdio server via `@apify/actors-mcp-server` |
| CLI | [✓](../clis/apify.js) | Local zero-dependency CLI in this repo |
| SDK | ✓ | Official API clients: `apify-client` (JS) and `apify-client` (Python) |

## Authentication

- **Type**: Bearer token (recommended) or `token` query parameter (less secure)
- **Header**: `Authorization: Bearer {APIFY_API_TOKEN}`
- **Base URL**: `https://api.apify.com/v2`
- **Env var**: `APIFY_API_TOKEN`
- **Where to get token**: Apify Console -> Integrations

## MCP Integration

### Hosted MCP server

Apify documents an official hosted MCP server:

`https://mcp.apify.com`

Default hosted setup:

```json
{
  "mcpServers": {
    "apify": {
      "url": "https://mcp.apify.com"
    }
  }
}
```

You can also authenticate with a bearer token directly:

```json
{
  "mcpServers": {
    "apify": {
      "url": "https://mcp.apify.com",
      "headers": {
        "Authorization": "Bearer <APIFY_TOKEN>"
      }
    }
  }
}
```

### Local stdio MCP server

For clients that do not support remote streamable HTTP MCP servers:

```json
{
  "mcpServers": {
    "actors-mcp-server": {
      "command": "npx",
      "args": ["-y", "@apify/actors-mcp-server@latest"],
      "env": {
        "APIFY_TOKEN": "<APIFY_TOKEN>"
      }
    }
  }
}
```

### Tool selection

Apify lets you narrow the MCP surface to specific tools or Actors.

Hosted example:

```json
{
  "mcpServers": {
    "apify": {
      "url": "https://mcp.apify.com?tools=actors,docs,apify/rag-web-browser"
    }
  }
}
```

Actor-specific hosted example:

```json
{
  "mcpServers": {
    "apify": {
      "url": "https://mcp.apify.com?actors=apify/web-scraper"
    }
  }
}
```

## Common Agent Operations

### Get current user

```bash
GET https://api.apify.com/v2/users/me
```

CLI:

```bash
node tools/clis/apify.js users me
```

### Run an Actor asynchronously

```bash
POST https://api.apify.com/v2/acts/{actorId}/runs

{ "startUrls": [{"url":"https://example.com"}] }
```

CLI:

```bash
node tools/clis/apify.js actors run --id username~actor-name --input '{"startUrls":[{"url":"https://example.com"}]}'
```

### Get a run

```bash
GET https://api.apify.com/v2/actor-runs/{runId}
```

CLI:

```bash
node tools/clis/apify.js runs get --id {runId}
```

### Get dataset items for a run

```bash
GET https://api.apify.com/v2/actor-runs/{runId}/dataset/items
```

CLI:

```bash
node tools/clis/apify.js runs dataset-items --id {runId} --clean true --limit 100
```

### Get dataset items by dataset ID

```bash
GET https://api.apify.com/v2/datasets/{datasetId}/items
```

CLI:

```bash
node tools/clis/apify.js datasets items --id {datasetId} --clean true --limit 100
```

### Read and write a key-value store record

```bash
GET https://api.apify.com/v2/key-value-stores/{storeId}/records/{key}
PUT https://api.apify.com/v2/key-value-stores/{storeId}/records/{key}
```

CLI:

```bash
node tools/clis/apify.js kv get --store-id {storeId} --key INPUT
node tools/clis/apify.js kv put --store-id {storeId} --key INPUT --value '{"foo":"bar"}'
```

## Notes

- Prefer header auth (`Authorization: Bearer ...`) over `?token=` query auth.
- Named resource IDs like `username~actor-name` generally require authentication.
- Actor runs have default storages (dataset, key-value store, request queue) accessible under `/v2/actor-runs/{runId}/...`.
- Apify documents OAuth and bearer-token auth for the hosted MCP server.
- Apify documents that SSE transport is deprecated and streamable HTTP is the current recommended MCP transport.

## Rate Limits

Apify rate limits and quotas are plan-based. Use exponential backoff and retry on `429`.

For MCP specifically, Apify documents a limit of up to 30 requests per second per user.

## Relevant Skills

- web-search-scrape
- web-content-researcher
