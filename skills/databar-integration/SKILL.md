---
name: databar-integration
description: Use when the user needs to set up, test, troubleshoot, or build a Databar.ai integration for enrichments, waterfalls, tables, CLI workflows, or MCP-based agent access. Trigger on phrases like "Databar integration," "Databar API," "Databar enrichment," "Databar waterfall," or "Databar table sync."
metadata:
  version: 1.0.0
---

# Databar Integration

Use this skill for Databar.ai enrichment and table automation workflows.

## Execution Preference

1. Use Databar CLI workflows first for fast, repeatable execution.
2. Use Python SDK when the user needs scriptable orchestration in code.
3. Use direct API requests only when the user needs endpoint-level payload control.

## Required First Step

Before making changes, confirm or infer:

- objective (`setup`, `test`, `troubleshoot`, or `build`)
- Databar workflow type (`enrichments`, `waterfalls`, `tables`, `mcp`, or `webhooks`)
- whether `DATABAR_API_KEY` is available in the environment
- target enrichment ID, table name, or webhook destination (if applicable)

If the request is broad, narrow to one enrichment run first.

## Core Rules

- Prefer smallest runnable test (one enrichment input) before bulk runs.
- Use dry-run style checks where available before live mutations.
- For async/pending jobs, confirm callback or polling path before closing tasks.
- Keep provider-specific expectations explicit (input schema, rate limits, freshness).
- For strict email deliverability checks, use dedicated verification providers when needed.

## Common Workflows

### Discover enrichments

1. Search enrichments by keyword.
2. Pick the best-matching enrichment ID.
3. Validate required params before execution.

CLI path:

```bash
databar enrich list --query "linkedin"
```

### Run an enrichment

1. Start with one record input.
2. Review response schema.
3. Scale to batch only after shape is validated.

CLI path:

```bash
databar enrich run 123 --params '{"email":"alice@example.com"}'
```

Python SDK path:

```python
from databar import DatabarClient

client = DatabarClient()
result = client.run_enrichment_sync(123, {"email": "alice@example.com"})
print(result)
```

### Build webhook-aware async flow

1. Configure webhook destination.
2. Trigger enrichment that may return pending.
3. Verify completion payload handling.

## Troubleshooting Order

Check these in order:

1. `DATABAR_API_KEY` is present and valid.
2. Enrichment ID exists and accepts the provided input fields.
3. Request payload schema matches endpoint requirements.
4. Webhook endpoint is reachable and auth headers are correct.
5. Rate limits or provider-side delays are not blocking completion.

## Output Expectations

Return:

- workflow used (`enrichments`, `waterfalls`, `tables`, `mcp`, or `webhooks`)
- whether the task was `setup`, `test`, `troubleshoot`, or `build`
- commands run or API/SDK calls proposed
- enrichment IDs, table names, or webhook endpoints involved
- smallest next corrective step if blocked

## References

- Integration guide: `tools/integrations/databar-ai.md`
- Tool registry: `tools/REGISTRY.md`
