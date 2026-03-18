---
name: apify-integration
description: Use when the user needs to set up, test, or troubleshoot an Apify integration, run an Apify Actor, pull Apify dataset results, manage Apify key-value store records, or configure Apify MCP. Trigger on phrases like "Apify integration," "Apify Actor," "Apify dataset," "Apify MCP," or "run this Apify scraper."
metadata:
  version: 1.0.0
---

# Apify Integration

Use this skill for Apify API, CLI, and MCP workflows.

## Execution Preference

1. Use Apify MCP when the user wants agent-native access to Actors and docs from an MCP client.
2. Use the local Apify CLI in this repo for repeatable API testing and operational workflows.
3. Use direct REST API calls only when the user needs a custom request shape not covered by the CLI.

Do not default to query-string token auth when bearer auth is available.

## Required First Step

Before making changes, confirm or infer:

- objective (`setup`, `test`, `troubleshoot`, or `build`)
- Apify workflow type (`actor-run`, `dataset`, `key-value-store`, `mcp`, or `user/account`)
- whether the user already has an Apify token and target Actor or dataset ID

If the request is vague, narrow it to the smallest Apify operation first.

## Core Rules

- Prefer `Authorization: Bearer {APIFY_API_TOKEN}` over `?token=...`.
- Use `username~actor-name` or Actor ID explicitly when running Actors.
- Keep input payloads in JSON files when they are more than a few fields.
- When retrieving dataset items, prefer `--clean true` unless the user needs raw metadata.
- For MCP setups, prefer the hosted server at `https://mcp.apify.com` unless the client only supports stdio.

## Common Workflows

### Run an Actor

1. Identify the Actor ID or `username~actor-name`.
2. Prepare JSON input.
3. Start the run.
4. Poll run status or fetch dataset output.

CLI path:

```bash
node tools/clis/apify.js actors run --id username~actor-name --input-file actor-input.json
node tools/clis/apify.js runs get --id <run_id>
node tools/clis/apify.js runs dataset-items --id <run_id> --clean true --limit 100
```

### Fetch dataset output

1. Get the dataset ID directly or from a run.
2. Pull items with filters for format, fields, offset, and limit.
3. Use clean output for downstream tools unless raw fields are required.

CLI path:

```bash
node tools/clis/apify.js datasets items --id <dataset_id> --clean true --limit 100
```

### Manage a key-value store record

1. Identify the store ID and record key.
2. Read or write the record.
3. Use explicit content types for non-JSON values.

CLI path:

```bash
node tools/clis/apify.js kv get --store-id <store_id> --key INPUT
node tools/clis/apify.js kv put --store-id <store_id> --key INPUT --value '{"startUrls":[{"url":"https://example.com"}]}'
```

### Configure Apify MCP

Use one of these approaches:

1. Hosted MCP: `https://mcp.apify.com`
2. Local stdio MCP: `npx -y @apify/actors-mcp-server@latest`

Hosted example:

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

## Troubleshooting Order

Check these in order:

1. `APIFY_API_TOKEN` is present and valid.
2. The Actor, run, dataset, or store ID is correct.
3. Input JSON matches what the target Actor expects.
4. Dataset queries are not hiding needed fields via `clean`, `fields`, or `format`.
5. MCP client transport matches the chosen Apify MCP mode (hosted HTTP vs stdio).

## Output Expectations

Return:

- workflow used (`actor-run`, `dataset`, `key-value-store`, `mcp`, or `user/account`)
- whether the task was `setup`, `test`, `troubleshoot`, or `build`
- commands run or API/MCP configuration proposed
- IDs involved (`actor`, `run`, `dataset`, `store`) when applicable
- smallest next corrective step if anything is blocked

## References

- Integration guide: `tools/integrations/apify.md`
- CLI: `tools/clis/apify.js`
- Tool registry: `tools/REGISTRY.md`
