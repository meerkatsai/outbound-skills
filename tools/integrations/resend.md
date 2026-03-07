# Resend

Transactional and marketing email platform with APIs for sends, domains, audiences, templates, and webhooks.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | REST API for emails, domains, audiences, templates, webhooks |
| MCP | ✓ | Available via Resend MCP server |
| CLI | [✓](../clis/resend.js) | Zero-dependency Node.js CLI in this repo |
| SDK | ✓ | Official SDKs (Node.js, Python, Go, and more) |

## Authentication

- **Type**: API Key
- **Header**: `Authorization: Bearer {api_key}`
- **Env var**: `RESEND_API_KEY`
- **Get key**: Resend dashboard > API Keys

## Common Agent Operations

### Send transactional email

```bash
node tools/clis/resend.js send \
  --from hello@example.com \
  --to user@example.com \
  --subject "Welcome" \
  --html "<h1>Welcome</h1>"
```

### Get email status

```bash
node tools/clis/resend.js emails get re_123
```

### List recent emails

```bash
node tools/clis/resend.js emails list --limit 20
```

### Cancel scheduled email

```bash
node tools/clis/resend.js emails cancel re_123
```

### Domain management

```bash
# list domains
node tools/clis/resend.js domains list --limit 20

# verify domain
node tools/clis/resend.js domains verify dom_123
```

### Audience and contacts

```bash
# create audience
node tools/clis/resend.js audiences create --name "Newsletter"

# add contact
node tools/clis/resend.js contacts aud_123 create --email user@example.com --first-name Jane --last-name Doe
```

### Templates

```bash
# list templates
node tools/clis/resend.js templates list --limit 20

# publish template
node tools/clis/resend.js templates publish tpl_123
```

### Webhooks

```bash
# list webhooks
node tools/clis/resend.js webhooks list

# create webhook
node tools/clis/resend.js webhooks create --url https://example.com/webhooks/resend --events email.sent,email.delivered,email.bounced
```

## Key Metrics

| Metric | Description |
|--------|-------------|
| `queued` | Accepted for processing |
| `sent` | Sent to receiving mail server |
| `delivered` | Delivered to recipient mailbox |
| `opened` | Open event (when tracking enabled) |
| `clicked` | Click event (when tracking enabled) |
| `bounced` | Delivery failed |
| `complained` | Marked as spam |

## Webhook Events

| Event | Meaning |
|-------|---------|
| `email.sent` | Email accepted/sent |
| `email.delivered` | Delivered successfully |
| `email.opened` | Recipient opened |
| `email.clicked` | Recipient clicked a link |
| `email.bounced` | Bounce occurred |
| `email.complained` | Spam complaint recorded |

## When to Use

- Transactional emails (OTP, reset, receipts, notifications)
- Lifecycle and operational messaging
- Domain verification and sender setup
- Delivery status troubleshooting
- Lightweight audience/contact management

## Rate Limits

- Rate limits and quotas vary by plan
- Back off and retry on `429` responses
- Use batch endpoints for high-volume sends

## Relevant Skills

- resend
- send-email
- templates
- resend-inbound
- agent-email-inbox
