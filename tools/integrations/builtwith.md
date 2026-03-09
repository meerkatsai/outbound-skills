# BuiltWith

Technology intelligence platform for identifying website tech stacks, related domains, and market lists.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | REST-style GET endpoints for domain, relationships, and lists |
| MCP | - | Not publicly documented |
| CLI | [✓](../clis/builtwith.js) | Local zero-dependency Node.js CLI in this repo |
| SDK | - | API-first usage |

## Authentication

- **Type**: API key query parameter
- **Parameter**: `KEY={BUILTWITH_API_KEY}`
- **Base URL**: `https://api.builtwith.com`
- **Env var**: `BUILTWITH_API_KEY`

## Common Agent Operations

### Free lookup

```bash
node tools/clis/builtwith.js free --lookup example.com
```

### Full domain profile

```bash
node tools/clis/builtwith.js domain --lookup example.com
```

### Domain relationships

```bash
node tools/clis/builtwith.js relationships --lookup example.com
```

### Tech-based lead list

```bash
node tools/clis/builtwith.js lists --tech Shopify
```

### Company-to-URL lookup

```bash
node tools/clis/builtwith.js company --company "Acme Inc"
```

## Notes

- BuiltWith endpoints are GET-based with query parameters.
- `domain` supports privacy/scope flags (`--hide-text`, `--no-meta`, `--no-pii`, `--no-attr`).
- Use `--dry-run` to preview the generated API URL.

## Rate Limits

- Limits vary by BuiltWith plan and endpoint.
- Batch or list-heavy workflows should be paced to avoid throttling.
- Retry with backoff on transient failures.

## Relevant Skills

- competitor-alternatives
- web-search-scrape
- pipedrive-crm
