# Parallel AI

Web research and extraction platform for AI agents, with APIs for Search, Extract, Task runs, and MCP-based tool access.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | REST APIs for Search, Extract, Tasks, and more |
| MCP | ✓ | Hosted Search MCP and Task MCP servers |
| CLI | [✓](../clis/parallel-ai.js) | Local zero-dependency CLI in this repo |
| SDK | ✓ | Official TypeScript and Python SDKs |

## Authentication

### REST API

- **Type**: API key header
- **Header**: `x-api-key: {PARALLEL_API_KEY}`
- **Base URL**: `https://api.parallel.ai`
- **Get key**: `https://platform.parallel.ai`

### MCP

- **Search MCP URL**: `https://search-mcp.parallel.ai/mcp`
- **Task MCP URL**: `https://task-mcp.parallel.ai/mcp`
- **Programmatic auth**: `Authorization: Bearer {PARALLEL_API_KEY}`

### CLI

- **Script**: `tools/clis/parallel-ai.js`
- **Runtime**: Node.js 18+
- **Env var**: `PARALLEL_API_KEY`

## Common Agent Operations

### Search API (web search with LLM-optimized excerpts)

```bash
curl https://api.parallel.ai/v1beta/search \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${PARALLEL_API_KEY}" \
  -d '{
    "objective": "Find recent pricing changes for cloud LLM APIs",
    "processor": "base",
    "max_results": 10
  }'
```

### Extract API (clean markdown from URLs)

```bash
curl https://api.parallel.ai/v1beta/extract \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${PARALLEL_API_KEY}" \
  -d '{
    "url": "https://example.com/pricing",
    "objective": "Extract pricing tiers and limits"
  }'
```

### Task API (async deep research run)

```bash
curl -X POST "https://api.parallel.ai/v1/tasks/runs" \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${PARALLEL_API_KEY}" \
  -d '{
    "input": "Compare top 5 B2B outbound tools by deliverability features",
    "processor": "base"
  }'
```

### Retrieve task run status/result

```bash
curl "https://api.parallel.ai/v1/tasks/runs/{run_id}" \
  -H "x-api-key: ${PARALLEL_API_KEY}"
```

### MCP setup examples

```bash
# Search MCP
codex mcp add parallel-search --url https://search-mcp.parallel.ai/mcp

# Task MCP
codex mcp add parallel-task --url https://task-mcp.parallel.ai/mcp
```

### Local CLI examples

```bash
# Search
node tools/clis/parallel-ai.js search --objective "Find recent pricing changes for cloud LLM APIs" --max-results 10

# Extract
node tools/clis/parallel-ai.js extract --url https://example.com/pricing --objective "Extract pricing tiers"

# Start task run
node tools/clis/parallel-ai.js tasks run --input "Compare top 5 B2B outbound tools" --processor base

# Get task run
node tools/clis/parallel-ai.js tasks get --id run_123
```

## Notes

- Search and Extract endpoints are in beta and may evolve.
- Some Task features require beta headers (see API reference for exact values).
- Parallel has endpoint-specific limits; check current limits before high-volume runs.

## Rate Limits

- Limits are endpoint-specific (Search, Extract, Tasks, Chat, FindAll, Monitor).
- Check the latest limits in Parallel docs before production rollout.
- Use async task workflows for large jobs instead of aggressive polling.

## Relevant Skills

- competitor-alternatives
- product-marketing-context
- pipedrive-crm
