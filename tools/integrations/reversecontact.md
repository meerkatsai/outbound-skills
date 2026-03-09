# Reverse Contact

People/company enrichment platform for reverse email lookup, email finder, email verification, and domain lookup.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | REST-style GET endpoints with query params |
| MCP | - | Not publicly documented |
| CLI | - | No local `tools/clis/reversecontact.js` in this repo yet |
| SDK | - | API-first usage |

## Authentication

- **Type**: API key query parameter
- **Parameter**: `apikey={REVERSECONTACT_API_KEY}`
- **Base URL**: `https://api.reversecontact.com`
- **Env var**: `REVERSECONTACT_API_KEY`

## Common Agent Operations

### Reverse email lookup

```bash
curl --request GET \
  --url "https://api.reversecontact.com/enrichment?apikey=${REVERSECONTACT_API_KEY}&email=bill.gates@microsoft.com"
```

### Email finder

```bash
curl --request GET \
  --url "https://api.reversecontact.com/enrichment/email-finder?apikey=${REVERSECONTACT_API_KEY}&full_name=John%20Doe&domain=microsoft.com"
```

### Email verification

```bash
curl --request GET \
  --url "https://api.reversecontact.com/enrichment/email-verification?apikey=${REVERSECONTACT_API_KEY}&email=jdoe@microsoft.com"
```

### Reverse domain lookup

```bash
curl --request GET \
  --url "https://api.reversecontact.com/enrichment/company/domain?apikey=${REVERSECONTACT_API_KEY}&domain=microsoft.com"
```

### Workspace quotas

```bash
curl --request GET \
  --url "https://api.reversecontact.com/workspaces/quotas?apikey=${REVERSECONTACT_API_KEY}"
```

## Notes

- Docs indicate each request consumes credits.
- API returns standard HTTP status codes and includes `credits_left` and `rate_limit_left`.
- Reported rate limit is 500 requests per minute.

## Rate Limits

- 500 requests per minute (per docs).
- Back off and retry on `429` responses.

## Relevant Skills

- email-find-verify
- pipedrive-crm
- smartlead-outbound
