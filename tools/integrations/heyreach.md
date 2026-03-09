# HeyReach

LinkedIn outreach automation platform for multi-account campaigns, inbox workflows, and lead operations.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | Public REST API for auth checks, campaigns, inbox, and account resources |
| MCP | ✓ | Official HeyReach MCP endpoint is available |
| CLI | - | No local `tools/clis/heyreach.js` in this repo yet |
| SDK | - | API-first usage |

## Authentication

- **Type**: API key header
- **Header**: `X-API-KEY: {HEYREACH_API_KEY}`
- **Base URL**: `https://api.heyreach.io/api/public`
- **Env var**: `HEYREACH_API_KEY`

## Common Agent Operations

### Check API key

```bash
curl -X GET "https://api.heyreach.io/api/public/auth/CheckApiKey" \
  -H "X-API-KEY: ${HEYREACH_API_KEY}"
```

### List campaigns

```bash
curl -X POST "https://api.heyreach.io/api/public/campaign/GetAll" \
  -H "X-API-KEY: ${HEYREACH_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"offset":0,"limit":20}'
```

### Fetch inbox conversations

```bash
curl -X POST "https://api.heyreach.io/api/public/inbox/GetConversations" \
  -H "X-API-KEY: ${HEYREACH_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"offset":0,"limit":20}'
```

### Add leads to campaign

```bash
curl -X POST "https://api.heyreach.io/api/public/campaign/AddLeadsToCampaignV2" \
  -H "X-API-KEY: ${HEYREACH_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"campaignId":"<campaign_id>","leads":[{"linkedinUrl":"https://linkedin.com/in/example"}]}'
```

## Notes

- Shared account rate limit: about 60 requests/minute.
- HeyReach exposes MCP for AI workflows; use it when MCP clients are preferred over direct REST calls.
- Use campaign/inbox pagination to avoid large payload spikes.

## Rate Limits

- Public docs indicate global request limits per workspace/API key.
- Back off and retry on `429` responses.

## Relevant Skills

- smartlead-outbound
- email-find-verify
- pipedrive-crm
