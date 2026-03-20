# Master Inbox

Shared inbox and outbound workflow platform for email and LinkedIn operations, workspace management, labels, exclusions, channel management, and webhook-driven automation.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | Public OpenAPI/Swagger docs at `api.masterinbox.com` |
| MCP | - | No official Master Inbox MCP server docs found |
| CLI | [✓](../clis/masterinbox.js) | Local zero-dependency CLI in this repo |
| SDK | - | Public API is documented as HTTPS endpoints rather than an official SDK |
| Webhook | ✓ | Incoming webhook endpoint documented in the API |

## Authentication

- **Type**: Bearer token
- **Header**: `Authorization: Bearer {token}`
- **Base URL**: `https://api.masterinbox.com`
- **Env var**: `MASTERINBOX_API_TOKEN`

## Common Agent Operations

### Send or draft a message

```bash
node tools/clis/masterinbox.js messages send --prospect-id 123 --subject "Intro" --message "Hi there" --to person@example.com
node tools/clis/masterinbox.js messages draft --prospect-id 123 --message "Draft follow-up"
```

Verified official endpoints:

- `POST /api/api-webhook/v1/api/send-message`
- `POST /api/api-webhook/v1/api/draft-message`

The documented send payload requires `prospect_id`, `subject`, `message`, `to`, `cc`, and `bcc`.

### Work with labels

```bash
node tools/clis/masterinbox.js labels list
node tools/clis/masterinbox.js labels add --label-name "Priority" --label-color "#ff6b6b"
node tools/clis/masterinbox.js prospects add-label --prospect-id 123 --email person@example.com --label-id 77
```

Verified official endpoints:

- `GET /api/api-webhook/v1/api/get-labels`
- `POST /api/api-webhook/v1/api/add-label`
- `PATCH /api/api-webhook/v1/api/update-label`
- `GET /api/api-webhook/v1/api/get-prospect-labels/{prospect_id}`
- `POST /api/api-webhook/v1/api/add-prospect-label`
- `PATCH /api/api-webhook/v1/api/update-prospect-label`

### Manage prospects and inbox placement

```bash
node tools/clis/masterinbox.js prospects create --first-name Jane --last-name Doe --email jane@example.com --custom-1 "" --custom-2 ""
node tools/clis/masterinbox.js prospects by-email --email jane@example.com
node tools/clis/masterinbox.js prospects move-to-list --prospect-ids 123,124 --inbox-type-id 9
```

Verified official endpoints:

- `POST /api/api-webhook/v1/api/create-new-prospect`
- `PATCH /api/api-webhook/v1/api/update-prospect`
- `POST /api/api-webhook/v1/api/get-prospects-by-email`
- `POST /api/api-webhook/v1/api/get-prospects-by-linkedin-url`
- `PATCH /api/api-webhook/v1/api/move-prospect-to-list`
- `GET /api/api-webhook/v1/api/get-inbox-types`

### Manage workspaces and members

```bash
node tools/clis/masterinbox.js workspaces list
node tools/clis/masterinbox.js workspaces create --name "Outbound Team" --description "Primary workspace" --timezone "Asia/Kolkata"
node tools/clis/masterinbox.js members invite --body-file member-invite.json
```

Verified official endpoints:

- `GET /api/api-webhook/v1/api/get-all-workspaces`
- `POST /api/api-webhook/v1/api/create-new-workspace`
- `PATCH /api/api-webhook/v1/api/update-workspace`
- `POST /api/api-webhook/v1/api/send-member-invitation`
- `POST /api/api-webhook/v1/api/accept-member-invitation`
- `DELETE /api/api-webhook/v1/api/remove-member-from-workspace/{member}-user-id`

### Manage channels, custom providers, and exclusions

```bash
node tools/clis/masterinbox.js channels list --page 1 --limit 25 --imap true --smtp true --provider-type all
node tools/clis/masterinbox.js providers add-custom --body-file custom-provider.json
node tools/clis/masterinbox.js exclusions get
```

Verified official endpoints:

- `POST /api/api-webhook/v1/api/get-channels`
- `DELETE /api/api-webhook/v1/api/delete-channel`
- `POST /api/api-webhook/v1/api/add-custom-provider`
- `GET /api/api-webhook/v1/api/get-exclusion-data`
- `POST /api/api-webhook/v1/api/add-exclusion-tags`
- `PATCH /api/api-webhook/v1/api/update-exclution-keywords`

### Message and reply retrieval

```bash
node tools/clis/masterinbox.js messages list --page 1 --limit 25 --sort-by createdAt --prospect-id 123 --search-keyword ""
node tools/clis/masterinbox.js replies list --page 1 --limit 25 --sort-by createdAt --prospect-id 123 --search-keyword ""
```

Verified official endpoints:

- `POST /api/api-webhook/v1/api/get-messages`
- `POST /api/api-webhook/v1/api/get-replies`

### Incoming webhook trigger

```bash
node tools/clis/masterinbox.js webhooks incoming --workflow-id wf_123 --api-key key_abc --body '{"event":"reply_received"}'
```

Verified official endpoint:

- `POST /api/api-webhook/v1/api/incoming-webhook/{workflow_id}/{api_key}`

## Notes

- The CLI supports `--dry-run` on all commands to validate request shape without sending a live API call.
- For complex payloads such as member invitations, custom providers, or exclusion updates, prefer `--body-file`.
- Some documented DTOs use API field names exactly as published, including `varification_code` and `update-exclution-keywords`. The CLI preserves those names rather than normalizing them.
- The public API surface appears to focus on operational workflows rather than bulk analytics.

## Relevant Skills

- instantly-integration
- apollo-outbound
- smartlead-outbound
