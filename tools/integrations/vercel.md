# Vercel

Cloud platform for frontend deployments, serverless functions, domains, and environment management.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | Official REST API at `https://api.vercel.com` |
| MCP | ✓ | Official remote MCP server at `https://mcp.vercel.com` (OAuth) |
| CLI | - | No local `tools/clis/vercel.js` in this repo |
| SDK | ✓ | Official Vercel SDKs available |

## Authentication

- **REST API type**: Bearer token
- **REST API header**: `Authorization: Bearer {VERCEL_API_TOKEN}`
- **REST API base URL**: `https://api.vercel.com`
- **MCP auth**: OAuth via supported MCP clients
- **MCP URL**: `https://mcp.vercel.com`
- **Env var**: `VERCEL_API_TOKEN`

## Common Agent Operations

### List projects

```bash
curl --request GET \
  --url "https://api.vercel.com/v9/projects" \
  --header "Authorization: Bearer ${VERCEL_API_TOKEN}"
```

### List deployments

```bash
curl --request GET \
  --url "https://api.vercel.com/v6/deployments" \
  --header "Authorization: Bearer ${VERCEL_API_TOKEN}"
```

### List environment variables for a project

```bash
curl --request GET \
  --url "https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env" \
  --header "Authorization: Bearer ${VERCEL_API_TOKEN}"
```

### Use Vercel MCP (Codex CLI example)

```bash
codex mcp add vercel --url https://mcp.vercel.com
```

## Notes

- Team-scoped resources can require passing team context (`teamId` or `slug`) in request query parameters.
- Vercel MCP is OAuth-based and supports project-specific MCP URLs: `https://mcp.vercel.com/<teamSlug>/<projectSlug>`.
- Prefer MCP for agentic workflows; use REST for deterministic scripted operations.

## Rate Limits

- Vercel applies API rate limits by token/account and endpoint.
- Handle `429` responses with exponential backoff and retry.

## Relevant Skills

- web-search-scrape
- smartlead-outbound
- resend-email
