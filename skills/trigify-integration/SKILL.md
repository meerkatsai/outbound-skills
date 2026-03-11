---
name: trigify-integration
description: Use when a user needs to set up, test, or troubleshoot Trigify automations and integrations, including native destinations, webhook delivery, and HTTP Request actions to custom APIs.
metadata:
  version: 1.0.0
---

# Trigify Integration

Use this skill for Trigify integration setup and validation workflows.

## Execution Preference

1. Use a Trigify native integration when the destination is supported.
2. Use Trigify `HTTP Request` action for unsupported API destinations.
3. Use Trigify webhook flows when event push or external workflow triggers are required.

Do not assume a public Trigify REST API is available for end users.

## Required First Step

Before making changes, confirm:

- destination system (native integration name, custom API, or webhook URL)
- objective (`setup`, `test`, or `troubleshoot`)
- data/event type to move (lead, signal, post, enrichment event)

If any are missing, ask first.

## Core Rules

- For custom API pushes, prefer Trigify's `HTTP Request` node.
- Require explicit auth configuration for destination APIs (for example `Authorization` header).
- For webhook-based flows, require a valid HTTPS endpoint and clear event subscription scope.
- If the destination requires complex auth or transformation, recommend an intermediate relay service.

## Common Workflows

### Configure a native integration

1. Open the integration in Trigify.
2. Authenticate the target app (OAuth or API key).
3. Map required Trigify fields to target fields.
4. Save and activate.
5. Run a test event and verify delivery in the destination app.

### Configure an HTTP Request action

1. Add `HTTP Request` action in the workflow.
2. Set method, URL, headers, and JSON body.
3. Use Trigify variables in payload fields.
4. Run a test and inspect destination logs.

Example payload pattern:

```json
{
  "name": "{{firstName}} {{lastName}}",
  "email": "{{email}}",
  "signal": "{{text}}",
  "source": "{{postUrl}}",
  "sentiment": "{{sentiment}}"
}
```

### Configure webhook flow

1. Choose webhook integration/trigger in Trigify.
2. Set destination or inbound trigger endpoint.
3. Save and activate.
4. Send a test event and inspect payload delivery.

### Troubleshoot failed delivery

Check in order:

1. Workflow is active and trigger conditions are met.
2. Endpoint URL and auth are valid.
3. Destination accepts payload shape and required fields.
4. Destination-side rate limits or error responses are handled.

## Output Expectations

Return:

- path used (`native`, `http-request`, or `webhook`)
- destination and event scope
- setup/test steps executed
- observed or expected payload fields
- smallest next corrective step if it fails

## Reference

- Integration guide: `tools/integrations/trigify.md`
