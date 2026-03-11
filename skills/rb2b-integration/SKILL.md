---
name: rb2b-integration
description: Use when a user needs to set up, test, or troubleshoot RB2B integrations, especially webhook-based lead routing, native integrations, or custom downstream mappings. Prefer RB2B's native integrations first, then webhook or Zapier for unsupported destinations.
metadata:
  version: 1.0.0
---

# RB2B Integration

Use this skill for RB2B setup and testing workflows.

## Execution Preference

1. Use an RB2B native integration first when the destination is supported.
2. Use RB2B webhook delivery second for custom destinations.
3. Use Zapier when the user wants a no-code bridge instead of hosting a webhook receiver.

Do not assume RB2B exposes a general public user API.

## Required First Step

Before doing anything else, confirm:

- destination system (`webhook`, `zapier`, or a named native integration)
- whether the user wants initial setup or troubleshooting
- whether the workspace is on RB2B Pro if webhook functionality is required

If any of those are missing, ask for them first.

## Core Rules

- For webhook setups, require a complete HTTPS destination URL.
- Treat webhook auth as URL-based unless the destination supports an unauthenticated receiver.
- If the destination requires custom headers, state that RB2B's generic webhook flow is a poor fit and recommend Zapier or an intermediate relay endpoint.
- If the user wants to "test RB2B," default to sending a test event through the configured webhook/native integration and inspecting the received payload.

## Common Workflows

### Set up a generic webhook

1. Open RB2B Integrations.
2. Select `Webhook`.
3. Paste the destination URL.
4. Save configuration.
5. Send a test event.

### Troubleshoot webhook delivery

Check these in order:

1. Confirm the workspace has webhook access.
2. Verify the webhook URL is valid and publicly reachable over HTTPS.
3. Verify authentication is embedded in the URL if needed.
4. Check whether the receiver accepts RB2B's JSON payload shape.
5. Inspect whether repeat-visitor or company-only sync settings affect the expected event volume.

### Map RB2B data into another system

Typical fields to map:

- `First Name`
- `Last Name`
- `Title`
- `Company Name`
- `Business Email`
- `Website`
- `Industry`
- `Employee Count`
- `Estimate Revenue`
- `City`
- `State`
- `Seen At`
- `Referrer`
- `Captured URL`
- `Tags`

## Output Expectations

Return:

- integration path used (`native`, `webhook`, or `zapier`)
- target destination
- setup or test steps performed
- payload fields expected or observed
- smallest next corrective step if delivery or mapping fails

## Reference

- Integration guide: `tools/integrations/rb2b.md`
