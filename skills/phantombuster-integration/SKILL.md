---
name: phantombuster-integration
description: Use when the user needs to set up, test, or troubleshoot a PhantomBuster integration, launch or stop a Phantom, fetch Phantom output, inspect container runs, or automate PhantomBuster API operations. Trigger on phrases like "PhantomBuster integration," "launch phantom," "fetch phantom results," "PhantomBuster API," or "Phantom output."
metadata:
  version: 1.0.0
---

# PhantomBuster Integration

Use this skill for PhantomBuster agent, container, and output workflows.

## Execution Preference

1. Use the local PhantomBuster CLI in this repo for repeatable operations and testing.
2. Use direct API requests through the CLI passthrough (`request`) when a specific endpoint is not covered by a subcommand.
3. Use raw HTTP requests only if the CLI cannot represent the needed request shape.

## Required First Step

Before making changes, confirm or infer:

- objective (`setup`, `test`, `troubleshoot`, or `build`)
- workflow type (`agents`, `containers`, `output`, or `org/workspace`)
- whether the user already has `PHANTOMBUSTER_API_KEY`
- target IDs (`agentId`, `containerId`) if the request is scoped

If the request is broad, narrow it to the smallest PhantomBuster operation first.

## Core Rules

- Use `X-Phantombuster-Key` authentication via env var, never hardcode keys.
- Use `--dry-run` before mutating operations like launch/stop/schedule changes.
- Treat IDs as explicit inputs and echo them back in outputs for traceability.
- Prefer `--body-file` for large or complex payloads.
- If endpoint behavior is unclear, use `request` with explicit method/path to keep progress unblocked.

## Common Workflows

### Validate org access

1. Fetch org/workspace metadata.
2. Check active running containers if troubleshooting "stuck" automations.

CLI path:

```bash
node tools/clis/phantombuster.js orgs fetch
node tools/clis/phantombuster.js orgs running-containers
```

### Launch or stop a Phantom (agent)

1. Confirm `agentId` and argument payload.
2. Dry run first.
3. Execute launch/stop once request shape is validated.

CLI path:

```bash
node tools/clis/phantombuster.js agents launch --id 123456 --argument '{"spreadsheetUrl":"https://..."}' --dry-run
node tools/clis/phantombuster.js agents launch --id 123456 --argument '{"spreadsheetUrl":"https://..."}'
node tools/clis/phantombuster.js agents stop --id 123456 --dry-run
node tools/clis/phantombuster.js agents stop --id 123456
```

### Fetch outputs

1. Fetch agent metadata/output for the target Phantom.
2. Inspect recent containers for run-level output and result object.

CLI path:

```bash
node tools/clis/phantombuster.js agents fetch-output --id 123456
node tools/clis/phantombuster.js containers fetch-all --id 123456 --limit 10
node tools/clis/phantombuster.js containers fetch-output --id 987654321
node tools/clis/phantombuster.js containers fetch-result-object --id 987654321
```

### Use passthrough for unsupported endpoints

CLI path:

```bash
node tools/clis/phantombuster.js request --method GET --path /agents/fetch --query-json '{"id":123456}'
```

## Troubleshooting Order

Check these in order:

1. `PHANTOMBUSTER_API_KEY` is present and valid.
2. Base URL is correct (`https://api.phantombuster.com/api/v2` unless intentionally overridden).
3. Agent/container IDs are valid and belong to the active workspace.
4. Input argument payload matches what the Phantom expects.
5. The most recent container output indicates completion rather than error/timeout.

## Output Expectations

Return:

- workflow used (`agents`, `containers`, `output`, or `org/workspace`)
- whether task was `setup`, `test`, `troubleshoot`, or `build`
- commands run (or proposed), including dry-run when relevant
- IDs used (`agentId`, `containerId`)
- minimal next corrective step when blocked

## References

- Integration guide: `tools/integrations/phantombuster.md`
- CLI: `tools/clis/phantombuster.js`
- Tool registry: `tools/REGISTRY.md`
