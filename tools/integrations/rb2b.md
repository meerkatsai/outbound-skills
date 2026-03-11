# RB2B

Website visitor identification platform that routes identified visitor data into downstream tools through native integrations, Zapier, or generic webhooks.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | - | RB2B says it does not currently offer a user API; partner-only API access exists separately |
| MCP | - | No public MCP server documented |
| CLI | - | No local `tools/clis/rb2b.js` in this repo |
| SDK | - | No public SDK documented |
| Webhook | ✓ | Generic webhook integration is available for RB2B Pro users |

## Authentication

- **RB2B app auth**: Dashboard login
- **Webhook auth model**: Include any required auth directly in the destination URL query string
- **Webhook setup URL**: `https://app.rb2b.com/integrations/webhook`
- **Plan note**: Webhook and many integrations are documented as RB2B Pro features

## Common Agent Operations

### Configure a generic webhook destination

1. Open RB2B Integrations in the dashboard.
2. Select `Webhook`.
3. Paste a fully self-contained HTTPS webhook URL.
4. Save, then send a test event.

RB2B’s webhook integration does not support adding custom headers or request-time auth fields, so any authentication must be embedded in the URL itself.

### Expected webhook payload

RB2B documents a JSON payload with fields such as:

- `LinkedIn URL`
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
- `Zipcode`
- `Seen At`
- `Referrer`
- `Captured URL`
- `Tags`

### Custom integration path

If the target platform is not natively supported:

1. Accept RB2B’s webhook payload on your own endpoint.
2. Transform/map fields into the target platform.
3. Submit the integration to RB2B for review if you want it recognized as a custom integration.

## Notes

- RB2B’s help center states that RB2B does not currently provide a public API for users.
- RB2B supports direct integrations, Zapier, and a generic webhook route for unsupported tools.
- Many setup guides mention optional toggles such as syncing company-only profiles and sending repeat visitor data.
- For unsupported platforms, Zapier is the lowest-friction bridge if you do not want to host your own webhook receiver.

## Rate Limits

- No public API rate-limit guidance is documented for end-user webhook integrations.
- If you build a receiving endpoint, make it idempotent and tolerant of retries/duplicate deliveries.

## Relevant Skills

- smartlead-outbound
- pipedrive-crm
- resend-email
