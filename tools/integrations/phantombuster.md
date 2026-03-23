# PhantomBuster

Cloud automation platform for launching "Phantoms" (automation agents), monitoring runs, and retrieving structured outputs for scraping and GTM workflows.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | Official API v2 on `api.phantombuster.com` |
| MCP | - | No official PhantomBuster MCP server docs found |
| CLI | [✓](../clis/phantombuster.js) | Local zero-dependency CLI in this repo |
| SDK | - | Official docs focus on HTTP API endpoints |

## Authentication

- **Type**: API key header
- **Header**: `X-Phantombuster-Key: {api_key}`
- **Base URL**: `https://api.phantombuster.com/api/v2`
- **Env var**: `PHANTOMBUSTER_API_KEY`

## Common Agent Operations

### Fetch workspace/org details

```bash
node tools/clis/phantombuster.js orgs fetch
node tools/clis/phantombuster.js orgs running-containers
```

### Fetch and launch agents

```bash
node tools/clis/phantombuster.js agents fetch --id 123456
node tools/clis/phantombuster.js agents fetch-all --limit 20 --skip 0
node tools/clis/phantombuster.js agents launch --id 123456 --argument '{"spreadsheetUrl":"https://..."}'
node tools/clis/phantombuster.js agents launch-sync --id 123456 --argument '{"numberOfProfiles":50}'
node tools/clis/phantombuster.js agents stop --id 123456
```

### Retrieve outputs from agents and containers

```bash
node tools/clis/phantombuster.js agents fetch-output --id 123456
node tools/clis/phantombuster.js containers fetch-all --id 123456 --limit 10
node tools/clis/phantombuster.js containers fetch-output --id 987654321
node tools/clis/phantombuster.js containers fetch-result-object --id 987654321
```

### Call any endpoint via generic passthrough

```bash
node tools/clis/phantombuster.js request --method GET --path /agents/fetch --query-json '{"id":123456}'
node tools/clis/phantombuster.js request --method POST --path /agents/launch --body '{"id":123456,"argument":"{\"foo\":\"bar\"}"}'
```

## Notes

- The CLI supports `--dry-run` on all commands to validate request shape without executing a live API call.
- For complex request payloads, use `--body-file` with a JSON file.
- PhantomBuster IDs are typically numeric (`agentId`, `containerId`), and date/timestamp fields in API v2 are millisecond-based.
- If your workflow needs an endpoint not mapped to a dedicated subcommand, use the `request` command.

## Relevant Skills

- apify-integration
- web-search-scrape
- apollo-outbound
