# Databar.ai

Data enrichment platform for running provider-based enrichments, waterfalls, and table workflows.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | REST API reference available in Databar docs |
| MCP | ✓ | MCP Server listed as Beta |
| CLI | ✓ | `databar` CLI |
| SDK | ✓ | Python SDK |

## Authentication

- **Type**: Workspace API key
- **Get key**: Databar workspace > Integrations
- **Docs**: https://build.databar.ai

## Common Agent Operations

### List enrichments (CLI)

```bash
databar enrich list --query "linkedin"
```

### Run enrichment sync (CLI)

```bash
databar enrich run 123 --params '{"email":"alice@example.com"}'
```

### Run enrichment sync (Python SDK)

```python
from databar import DatabarClient

client = DatabarClient()
result = client.run_enrichment_sync(123, {"email": "alice@example.com"})
print(result)
```

### Use webhooks for async flows

- Configure webhook destinations for async completion callbacks.
- Use this when enrichment providers return pending/queued jobs.

## When to Use

- Enrich leads/accounts from multiple data providers
- Build waterfall enrichment logic with fallback providers
- Automate repeatable data pulls into structured tables
- Power agent workflows through API, SDK, CLI, or MCP

## Notes

- Databar supports custom connectors and bring-your-own API keys for supported data sources.
- Prefer provider-specific validation tools (for example, dedicated email verification providers) when you need strict deliverability checks.
