# Firecrawl

Web data extraction platform for scraping, crawling, mapping, searching, and structured extraction.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | REST API at `https://api.firecrawl.dev/v2` |
| MCP | ✓ | Hosted MCP endpoint + local MCP server |
| CLI | [✓](../clis/firecrawl.js) | Local zero-dependency CLI in this repo |
| SDK | ✓ | Official SDKs (Node, Python, Go, etc.) |

## Authentication

### REST API

- **Type**: Bearer token
- **Header**: `Authorization: Bearer {FIRECRAWL_API_KEY}`
- **Base URL**: `https://api.firecrawl.dev/v2`
- **Get key**: `https://firecrawl.dev/app/api-keys`

### MCP

- **Hosted URL**: `https://mcp.firecrawl.dev/{FIRECRAWL_API_KEY}/v2/mcp`
- **Alt hosted auth mode**: `https://mcp.firecrawl.dev/v2/mcp` with `Authorization: Bearer {FIRECRAWL_API_KEY}`
- **Local MCP**: `env FIRECRAWL_API_KEY=fc-YOUR_API_KEY npx -y firecrawl-mcp`

### CLI

- **Script**: `tools/clis/firecrawl.js`
- **Runtime**: Node.js 18+
- **Env var**: `FIRECRAWL_API_KEY`

## Common Agent Operations

### REST: Scrape a page

```bash
curl -X POST https://api.firecrawl.dev/v2/scrape \
  -H "Authorization: Bearer ${FIRECRAWL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "formats": ["markdown"],
    "onlyMainContent": true
  }'
```

### REST: Start crawl job

```bash
curl -X POST https://api.firecrawl.dev/v2/crawl \
  -H "Authorization: Bearer ${FIRECRAWL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://docs.example.com",
    "limit": 50
  }'
```

### REST: Map site URLs

```bash
curl -X POST https://api.firecrawl.dev/v2/map \
  -H "Authorization: Bearer ${FIRECRAWL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "limit": 50
  }'
```

### REST: Search web + scrape results

```bash
curl -X POST https://api.firecrawl.dev/v2/search \
  -H "Authorization: Bearer ${FIRECRAWL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "site:example.com pricing",
    "limit": 5,
    "scrapeOptions": {
      "formats": ["markdown"]
    }
  }'
```

### REST: Structured extraction

```bash
curl -X POST https://api.firecrawl.dev/v2/extract \
  -H "Authorization: Bearer ${FIRECRAWL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["https://example.com/*"],
    "prompt": "Extract product names and prices."
  }'
```

### Local CLI examples

```bash
# Scrape
node tools/clis/firecrawl.js scrape --url https://example.com --formats markdown --only-main-content

# Crawl
node tools/clis/firecrawl.js crawl --url https://docs.example.com --limit 50 --max-depth 2

# Map
node tools/clis/firecrawl.js map --url https://example.com --limit 50

# Search
node tools/clis/firecrawl.js search --query "site:example.com pricing" --limit 5

# Extract
node tools/clis/firecrawl.js extract --urls https://example.com/pricing,https://example.com/faq --prompt "Extract product names and prices"
```

### MCP examples

- Hosted endpoint for MCP clients:
  - `https://mcp.firecrawl.dev/{FIRECRAWL_API_KEY}/v2/mcp`
- Tool families exposed through MCP:
  - scrape
  - crawl
  - map
  - search
  - extract

## When to Use

- Building LLM-ready markdown from websites
- Crawling docs and knowledge bases for retrieval pipelines
- Discovering site link maps before selective scraping
- Running web search + content extraction in one flow
- Extracting structured entities from one or many URLs

## Rate Limits

- Account limits are plan-based (credits + concurrency)
- Monitor usage/credits in the Firecrawl dashboard
- Use crawl limits and pagination to control credit burn
- Retry with backoff on `429`/transient failures

## Relevant Skills

- competitor-alternatives
- product-marketing-context
