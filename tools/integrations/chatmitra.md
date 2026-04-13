# ChatMitra

WhatsApp Business API provider for sending raw WhatsApp messages (text/media/interactive) and template-based communication through a REST API.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | Official WhatsApp Business API docs and endpoint examples |
| MCP | - | No official ChatMitra-hosted MCP server docs found |
| CLI | [✓](../clis/chatmitra.js) | Local zero-dependency CLI in this repo for common send operations |
| SDK | - | Official docs currently center on HTTPS REST examples |
| Webhook | ✓ | ChatMitra docs describe delivery tracking and webhook-based status workflows |

## Authentication

- **Type**: Bearer token
- **Header**: `Authorization: Bearer {token}`
- **Base URL**: `https://backend.chatmitra.com/developer/api`
- **Env var**: `CHATMITRA_API_TOKEN` (fallback `CHATMITRA_API_KEY`)

## Common Agent Operations

### Send text

```bash
node tools/clis/chatmitra.js send-text --to 919999999999 --message "Hello from ChatMitra"
```

### Send image

```bash
node tools/clis/chatmitra.js send-image --to 919999999999 --link "https://example.com/image.jpg" --caption "Product update"
```

### Send document

```bash
node tools/clis/chatmitra.js send-document --to 919999999999 --link "https://example.com/invoice.pdf" --filename "Invoice_123.pdf"
```

### Dry-run request preview (no API call)

```bash
node tools/clis/chatmitra.js send-text --to 919999999999 --message "test" --dry-run
```

## Verified endpoint used by this CLI

- `POST /send_message`

Payload styles used:

- Simple text:
  - `recipient_mobile_number`
  - `message`
- Raw media message:
  - `recipient_mobile_number`
  - `messages[].kind = "raw"`
  - `messages[].payload` with `type` and typed object (`image`, `document`)

## Notes

- Raw messages require an active WhatsApp 24-hour conversation window.
- Outside the 24-hour window, use approved message templates as documented by ChatMitra/Meta WhatsApp rules.
- This repo CLI currently targets conservative send operations with payload shapes shown in the official docs.

## Relevant Skills

- chatmitra-integration
- smartlead-outbound
- apollo-outbound
- hubspot-integration
