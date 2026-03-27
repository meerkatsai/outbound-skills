---
name: dripify-integration
description: Use when the user needs to set up, test, or troubleshoot a Dripify integration, configure Dripify webhook automations, validate Dripify lead-event payloads, or forward Dripify events to Zapier/Make/custom endpoints. Trigger on phrases like "Dripify integration," "Dripify webhook," "Dripify to Zapier," "Dripify to Make," or "Dripify lead events."
metadata:
  version: 1.0.0
---

# Dripify Integration

Use this skill for Dripify webhook-based automation and event routing workflows.

## Execution Preference

1. Use the local Dripify CLI in this repo to generate payloads, inspect payload shape, and send test webhooks.
2. Use direct webhook forwarding for endpoint-level validation.
3. Avoid assuming undocumented Dripify REST endpoints.

## Required First Step

Before making changes, confirm or infer:

- objective (`setup`, `test`, `troubleshoot`, or `build`)
- webhook destination (`Zapier`, `Make`, or custom endpoint)
- target event type (`invite_sent`, `message_sent`, or `response`)
- whether endpoint authentication headers are required

If the request is broad, start with `webhook template` and `webhook send-test --dry-run`.

## Core Rules

- Treat Dripify integration as webhook-first unless the user provides a documented API endpoint.
- Use `--dry-run` before sending test payloads to live endpoints.
- Prefer `--payload-file` for non-trivial event payloads.
- Keep headers explicit with `--headers "Name:Value,Another:Value"` for secure endpoints.
- Echo event type and destination URL in outputs for traceability.

## Common Workflows

### Generate and review a payload template

1. Pick an event type.
2. Generate a template payload.
3. Adjust shape if the destination system requires extra fields.

CLI path:

```bash
node tools/clis/dripify.js webhook template --event invite_sent
```

### Inspect an incoming event payload

1. Save event JSON to file.
2. Extract normalized keys (`event`, `campaign_id`, `lead_id`).

CLI path:

```bash
node tools/clis/dripify.js webhook inspect --payload-file dripify-event.json
```

### Send a test event to Zapier/Make/custom endpoint

1. Dry-run first to validate request shape.
2. Send live test request with optional auth headers.

CLI path:

```bash
node tools/clis/dripify.js webhook send-test --url "https://hooks.zapier.com/hooks/catch/123/abc" --event response --dry-run
node tools/clis/dripify.js webhook send-test --url "https://hooks.zapier.com/hooks/catch/123/abc" --event response
node tools/clis/dripify.js webhook send-test --url "https://example.com/webhooks/dripify" --event invite_sent --headers "Authorization:Bearer token"
```

### Forward custom payloads

Use this when migrating from another system or replaying historical webhook events.

CLI path:

```bash
node tools/clis/dripify.js webhook forward --url "https://example.com/webhooks/dripify" --payload-file payload.json
```

## Troubleshooting Order

Check these in order:

1. Destination URL is public/reachable and correct.
2. Required destination auth headers are included.
3. Payload is valid JSON and event type is expected by downstream automation.
4. Destination automation step is configured for the same event schema.
5. Webhook condition in Dripify campaign matches intended trigger.

## Output Expectations

Return:

- workflow used (`template`, `inspect`, `send-test`, or `forward`)
- objective (`setup`, `test`, `troubleshoot`, or `build`)
- command(s) run or proposed
- destination URL and event type used
- smallest next corrective step when blocked

## References

- Integration guide: `tools/integrations/dripify.md`
- CLI: `tools/clis/dripify.js`
- Tool registry: `tools/REGISTRY.md`
