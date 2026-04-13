---
name: chatmitra-integration
description: Use when the user needs to set up, test, troubleshoot, or automate ChatMitra WhatsApp Business API messaging workflows, including text/media sends, template-window decisions, and delivery-status handling. Trigger on phrases like "ChatMitra integration," "WhatsApp API via ChatMitra," "send WhatsApp from API," or "ChatMitra webhook."
metadata:
  version: 1.0.0
---

# ChatMitra Integration

Use this skill for ChatMitra WhatsApp Business API setup, testing, and operational troubleshooting.

## Execution Preference

1. Use the local CLI in this repo for repeatable ChatMitra API testing and payload validation.
2. Use direct REST calls only when the user needs a payload shape not yet implemented in the CLI.
3. Treat template-vs-raw decisioning as a first-class rule, not an afterthought.

Do not assume raw message sends always work; enforce 24-hour window logic.

## Required First Step

Before making changes, confirm or infer:

- objective (`setup`, `test`, `troubleshoot`, or `build`)
- ChatMitra workflow type (`send-text`, `send-media`, `templates`, `status-tracking`, or `webhooks`)
- whether the user has a valid bearer token and verified sender setup

If the request is vague, narrow it to the smallest end-to-end send operation first.

## Core Rules

- Use bearer auth: `Authorization: Bearer {CHATMITRA_API_TOKEN}`.
- Default base URL: `https://backend.chatmitra.com/developer/api`.
- Use `POST /send_message` for standard send operations.
- Use raw text/media payloads only inside the active 24-hour customer window.
- Outside the 24-hour window, use approved template messaging per Meta rules.
- For media sends, require public HTTPS file URLs.
- Prefer `--dry-run` before live sends when the user is validating payload shape.

## Common Workflows

### Send a plain text WhatsApp message

1. Confirm recipient MSISDN format and token.
2. Send text payload.
3. Capture queued/job response for tracking.

CLI path:

```bash
node tools/clis/chatmitra.js send-text --to 919999999999 --message "Hello from ChatMitra"
```

### Send image or document media

1. Confirm public HTTPS link for media.
2. Build raw media payload (`type: image` or `type: document`).
3. Submit send request and capture response.

CLI path:

```bash
node tools/clis/chatmitra.js send-image --to 919999999999 --link "https://example.com/image.jpg" --caption "Update"
node tools/clis/chatmitra.js send-document --to 919999999999 --link "https://example.com/invoice.pdf" --filename "Invoice_123.pdf"
```

### Validate request shape before production send

1. Build the command with realistic values.
2. Run with `--dry-run`.
3. Verify endpoint, headers, and JSON body.

CLI path:

```bash
node tools/clis/chatmitra.js send-text --to 919999999999 --message "test" --dry-run
```

### Decide raw vs template strategy

1. If last inbound user message is within 24 hours, raw is valid.
2. If outside 24 hours, route to approved templates.
3. Use templates for proactive outreach and re-engagement.

## Troubleshooting Order

Check these in order:

1. `CHATMITRA_API_TOKEN` exists and is valid.
2. Base URL is correct and points to ChatMitra backend API.
3. Recipient number format is valid for WhatsApp routing.
4. Raw-message sends are within the active 24-hour window.
5. Media URLs are public, HTTPS, and directly accessible.
6. Payload shape matches endpoint expectations.

## Output Expectations

Return:

- workflow used (`send-text`, `send-media`, `templates`, `status-tracking`, or `webhooks`)
- whether the task was `setup`, `test`, `troubleshoot`, or `build`
- commands run or API calls proposed
- payload shape summary and auth assumptions
- smallest next corrective step if blocked

## References

- Integration guide: `tools/integrations/chatmitra.md`
- CLI: `tools/clis/chatmitra.js`
- Tool registry: `tools/REGISTRY.md`
