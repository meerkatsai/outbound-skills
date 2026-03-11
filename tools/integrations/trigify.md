# Trigify

Signal intelligence and workflow automation platform for listening to social activity, enriching leads, and pushing qualified prospects into downstream GTM tools.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | - | No public Trigify REST API is documented for end users |
| MCP | - | No public MCP server documented |
| CLI | - | No local `tools/clis/trigify.js` in this repo |
| SDK | - | No public SDK documented |
| Webhook | ✓ | Trigify supports inbound webhook triggers and outbound webhook/HTTP request actions |
| Native Integrations | ✓ | Trigify documents native integrations for tools like HubSpot, Smartlead, Instantly, HeyReach, and others |

## Authentication

- **Trigify app auth**: Dashboard login
- **Native integration auth**: Depends on the connected tool, usually OAuth or pasted API key inside Trigify
- **HTTP Request auth**: Add headers such as `Authorization` and `Content-Type` directly in the HTTP Request node
- **Webhook trigger auth**: Secure the receiving endpoint on your side because Trigify supports starting workflows from inbound webhooks

## Common Agent Operations

### Push Trigify workflow data to a custom API

Use Trigify's `HTTP Request` node when the destination has an API but no native Trigify integration.

Typical configuration:

- Method: `POST`
- URL: target API endpoint
- Headers:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- Body: JSON using Trigify variables such as `{{firstName}}`, `{{lastName}}`, `{{email}}`, `{{text}}`, `{{postUrl}}`, `{{sentiment}}`

Example body:

```json
{
  "name": "{{firstName}} {{lastName}}",
  "email": "{{email}}",
  "signal": "{{text}}",
  "source": "{{postUrl}}",
  "sentiment": "{{sentiment}}"
}
```

### Auto-push leads to a webhook

Trigify documents webhook auto-push for sending newly discovered leads to an external endpoint.

Typical setup:

1. Open the relevant connection/integration flow in Trigify.
2. Choose `Webhook`.
3. Add the destination endpoint URL.
4. Select subscribed events.
5. Save and activate.

### Start a Trigify workflow from an external system

Trigify supports a `Webhook` workflow trigger so another system can send data into Trigify and start automation runs.

### Connect a native downstream tool

For supported tools, authenticate directly inside Trigify:

- OAuth-based connection when supported by the downstream app
- API-key paste flow when required by the downstream app

Examples documented by Trigify include HubSpot, Smartlead, Instantly, and HeyReach.

## Notes

- Trigify acts primarily as an orchestration layer, not as a public API platform.
- The `HTTP Request` node is the escape hatch for unsupported destinations.
- Auto-push webhook delivery sends data as it is discovered, so downstream qualification or filtering may be needed.
- Native integrations are preferable when available because they provide tool-specific actions and field mapping in the workflow UI.

## Rate Limits

- No public Trigify API rate-limit documentation is available for end-user integrations.
- For outbound HTTP requests from Trigify workflows, respect the destination system's rate limits and retry behavior.

## Relevant Skills

- smartlead-outbound
- pipedrive-crm
- web-search-scrape
