# Tavily AI

Web access layer for AI agents with APIs for search, extract, crawl, and map workflows.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | REST API for Search, Extract, Crawl, and Map |
| MCP | ✓ | Hosted Tavily MCP endpoint and local MCP server |
| CLI | [✓](../clis/tavily-ai.js) | Local zero-dependency CLI in this repo |
| SDK | ✓ | Official Python and JavaScript/TypeScript SDKs |

## Authentication

### REST API

- **Type**: Bearer token
- **Header**: `Authorization: Bearer {TAVILY_API_KEY}`
- **Base URL**: `https://api.tavily.com`
- **Get key**: `https://app.tavily.com`

### MCP

- **Remote MCP URL**: `https://mcp.tavily.com/mcp/?tavilyApiKey={TAVILY_API_KEY}`
- **Alternate auth mode**: `https://mcp.tavily.com/mcp` with OAuth or bearer auth
- **Local MCP package**: `@tavily/mcp` (run via `npx`)

### CLI

- **Script**: `tools/clis/tavily-ai.js`
- **Runtime**: Node.js 18+
- **Env var**: `TAVILY_API_KEY`

## Common Agent Operations

### Search API

```bash
curl -X POST https://api.tavily.com/search \
  -H "Authorization: Bearer ${TAVILY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "best B2B outbound tools",
    "search_depth": "advanced",
    "max_results": 10
  }'
```

### Extract API

```bash
curl -X POST https://api.tavily.com/extract \
  -H "Authorization: Bearer ${TAVILY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["https://example.com/pricing"]
  }'
```

### Crawl API

```bash
curl -X POST https://api.tavily.com/crawl \
  -H "Authorization: Bearer ${TAVILY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://docs.example.com",
    "max_depth": 2,
    "limit": 50
  }'
```

### Map API

```bash
curl -X POST https://api.tavily.com/map \
  -H "Authorization: Bearer ${TAVILY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://docs.example.com"
  }'
```

### MCP setup examples

```bash
# Remote MCP (API key in URL)
codex mcp add tavily --url "https://mcp.tavily.com/mcp/?tavilyApiKey=${TAVILY_API_KEY}"

# Local bridge for MCP clients that require stdio servers
npx -y mcp-remote "https://mcp.tavily.com/mcp/?tavilyApiKey=${TAVILY_API_KEY}"
```

### Local CLI examples

```bash
# Search
node tools/clis/tavily-ai.js search --query "best B2B outbound tools" --search-depth advanced --max-results 10

# Extract
node tools/clis/tavily-ai.js extract --urls https://example.com/pricing,https://example.com/faq

# Crawl
node tools/clis/tavily-ai.js crawl --url https://docs.example.com --max-depth 2 --limit 50

# Map
node tools/clis/tavily-ai.js map --url https://docs.example.com
```

## Notes

- Tavily search depth affects credit usage.
- Use extract/crawl/map for full-content retrieval beyond search snippets.
- Tavily MCP supports both API-key URL auth and OAuth-based flows.

## Rate Limits

- Limits and credit consumption are plan-based.
- Search, extract, crawl, and map may have different credit costs.
- Apply backoff/retry on `429` responses.

## Relevant Skills

- competitor-alternatives
- product-marketing-context
