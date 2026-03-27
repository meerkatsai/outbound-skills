# TimelinesAI

WhatsApp shared inbox and automation platform for managing multiple WhatsApp numbers, retrieving chats and messages, and integrating workflows through webhooks, CRM sync, and AI agents.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | Public API docs for chats, messages, files, labels, WhatsApp accounts, quotas, teammates, and webhooks |
| MCP | - | No official TimelinesAI-hosted MCP server docs found; third-party MCP wrappers exist |
| CLI | [✓](../clis/timelinesai.js) | Local zero-dependency CLI added in this repo for verified read operations |
| SDK | - | Public docs emphasize HTTPS API and no-code integrations |
| Webhook | ✓ | Official webhook reference for chat, message, label, note, and WhatsApp account events |

## Authentication

- **Type**: Bearer token
- **Header**: `Authorization: Bearer {token}`
- **Base URL**: `https://app.timelines.ai/integrations/api`
- **Env var**: `TIMELINESAI_API_TOKEN`

## Common Agent Operations

### List chats

```bash
node tools/clis/timelinesai.js chats list
node tools/clis/timelinesai.js chats list --phone +14155550123 --read false
node tools/clis/timelinesai.js chats list --whatsapp-account-id 14155550000@s.whatsapp.net --group false
```

Verified official endpoint:

`GET /chats`

Supported official filters include `label`, `whatsapp_account_id`, `group`, `responsible`, `name`, `phone`, `read`, `closed`, `chatgpt_autoresponse_enabled`, `page`, `created_after`, and `created_before`.

### List messages for a chat

```bash
node tools/clis/timelinesai.js messages list --chat-id 1000001
node tools/clis/timelinesai.js messages list --chat-id 1000001 --from-me false --sorting-order desc
```

Verified official endpoint:

`GET /chats/{chat_id}/messages`

Supported official filters include `from_me`, `after`, `before`, `after_message`, `before_message`, and `sorting_order`.

### Other official public API surfaces

TimelinesAI’s official public API navigation also documents:

- `GET Get Chat`
- `PATCH Update Chat`
- `GET Get Message`
- `GET Get Message Status`
- `POST Send Message to Chat`
- `POST Send Message to Phone`
- `POST Send Message to JID`
- `POST Send Message to Chat Name`
- `POST Send Voice Message`
- `POST Add Note`
- `GET/POST/DEL Files`
- `GET/PUT/POST Labels`
- `GET List WhatsApp Accounts`
- `GET List Teammates`
- `GET Get Quotas`
- `GET/POST/GET/PUT/DEL Webhooks`

This repo’s CLI currently implements the endpoints I could directly verify from the official public docs in this session plus conservative GET routes for `whatsapp_accounts`, `webhooks`, and `quotas` based on the documented resource names.

### Webhook events

TimelinesAI’s official webhook reference includes events for:

- chats
- messages
- labels
- notes
- WhatsApp account lifecycle events such as `whatsapp:account:connected`

Use webhooks when you want CRM sync, lead routing, or inbound automation triggered by new WhatsApp activity.

## When to Use

- Centralize team handling of multiple WhatsApp numbers
- Sync WhatsApp activity into CRM or RevOps systems
- Build WhatsApp follow-up and routing workflows
- Monitor unread or unattended chats programmatically
- Add AI-assisted WhatsApp handling through TimelinesAI’s built-in agent features

## Notes

- TimelinesAI works through connected WhatsApp accounts and does not require WhatsApp Business API approval for the core product workflow.
- Public API and webhook access use the `app.timelines.ai/integrations/api` surface.
- The CLI in this repo is intentionally conservative and focuses on verified read operations from the official docs.
- If you need send-message or webhook-mutation commands added, I can extend the CLI once you confirm the exact payload shape you want to use or after a fuller docs pass.

## Relevant Skills

- rb2b-integration
- pipedrive-crm
- smartlead-outbound
- apollo-outbound

