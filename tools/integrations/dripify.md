# Dripify

LinkedIn outreach automation platform. Dripify’s documented automation path is webhook-based integrations (Zapier, Make, or any public webhook URL that accepts HTTP POST).

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | - | No public REST API reference found in official docs |
| MCP | - | No official Dripify MCP server docs found |
| CLI | [✓](../clis/dripify.js) | Local zero-dependency webhook utility for Dripify event flows |
| SDK | - | Official docs center on webhook integrations |
| Webhook | ✓ | Dripify can POST lead event data to public webhook URLs |

## Authentication

- **Dripify -> Your endpoint**: No token standard documented by Dripify; secure your endpoint with URL secrets and/or custom headers.
- **CLI env vars**: none required.

## Common Agent Operations

### Generate a sample payload template

```bash
node tools/clis/dripify.js webhook template --event response
```

### Inspect webhook payload shape

```bash
node tools/clis/dripify.js webhook inspect --payload-file dripify-event.json
```

### Send a test webhook event to Zapier/Make/custom endpoint

```bash
node tools/clis/dripify.js webhook send-test --url "https://hooks.zapier.com/hooks/catch/123/abc" --event invite_sent
node tools/clis/dripify.js webhook send-test --url "https://example.com/webhooks/dripify" --event response --headers "Authorization:Bearer token"
```

### Forward custom payloads to your destination

```bash
node tools/clis/dripify.js webhook forward --url "https://example.com/webhooks/dripify" --payload-file payload.json
```

## Notes

- Use `--dry-run` to preview outbound request body/headers before sending.
- Dripify’s help docs note that one condition is supported per webhook integration in a campaign.
- Dripify docs also note webhook transfers lead data and not message content.
- For response-trigger behavior, Dripify documents that the first response triggers the webhook; subsequent triggers depend on lead pause/resume state.

## Relevant Skills

- smartlead-outbound
- instantly-integration
- apollo-outbound
