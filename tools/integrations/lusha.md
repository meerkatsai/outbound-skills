# Lusha

B2B data platform for person enrichment, company enrichment, prospecting, signals, recommendations, and account usage workflows.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | Public REST API with person, company, signals, recommendations, and usage endpoints |
| MCP | ✓ | Lusha documents a remote MCP server |
| CLI | [✓](../clis/lusha.js) | Local zero-dependency CLI in this repo |
| SDK | - | Public docs emphasize HTTPS API and MCP, not a standalone SDK |

## Authentication

- **Type**: API key header
- **Header**: `api_key: {LUSHA_API_KEY}`
- **Base URL**: `https://api.lusha.com`
- **Env var**: `LUSHA_API_KEY`

## Common Agent Operations

### Person enrichment

```bash
node tools/clis/lusha.js person get --email person@example.com
node tools/clis/lusha.js person get --linkedin-url https://www.linkedin.com/in/example
node tools/clis/lusha.js person search --body-file person-search.json
```

Primary endpoint: `GET/POST /v2/person`

### Company enrichment

```bash
node tools/clis/lusha.js company get --domain lusha.com
node tools/clis/lusha.js company search --body-file company-search.json
```

Primary endpoint: `GET/POST /v2/company`

### Account usage

```bash
node tools/clis/lusha.js account usage
```

Primary endpoint: `GET /account/usage`

### Other documented API surfaces

Lusha also documents:

- Signals: `https://api.lusha.com/v2/signals`
- Recommendations / lookalikes: `https://api.lusha.com/v2/recommendations`

Use the official docs for payload shapes when you need those flows.

## Notes

- Lusha documents person and company APIs as both `GET` and `POST`.
- For bulk or more complex searches, prefer `POST` payloads via `--body-file`.
- Lusha documents a remote MCP server at `https://mcp.lusha.com`.

## Rate Limits

Lusha documents:

- General: 25 requests per second per endpoint
- Credit usage API: 5 requests per minute

Limits may vary by plan.

## Relevant Skills

- email-find-verify
- apollo-outbound
- smartlead-outbound

