# LaGrowthMachine

Multi-channel outbound automation platform for email + LinkedIn sequences and lead management.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | API available; endpoint details are primarily documented inside app/workspace docs |
| MCP | - | Not publicly documented |
| CLI | - | No local `tools/clis/lagrowthmachine.js` in this repo yet |
| SDK | - | API-first usage |

## Authentication

- **Type**: API key / bearer token (workspace-level)
- **Header**: Usually `Authorization: Bearer {LGM_API_KEY}` (confirm in in-app API docs)
- **API docs access**: inside your LaGrowthMachine workspace settings/integrations area
- **Env var**: `LGM_API_KEY` (recommended convention)

## Common Agent Operations

LaGrowthMachine’s public endpoint catalog is mostly in-app. Use these as implementation patterns and replace with your workspace-documented routes.

### List campaigns (pattern)

```bash
curl -X GET "<LGM_API_BASE>/campaigns" \
  -H "Authorization: Bearer ${LGM_API_KEY}" \
  -H "Content-Type: application/json"
```

### Create/add leads (pattern)

```bash
curl -X POST "<LGM_API_BASE>/leads" \
  -H "Authorization: Bearer ${LGM_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Doe","email":"jane@example.com","linkedinUrl":"https://linkedin.com/in/janedoe"}'
```

### Trigger campaign action (pattern)

```bash
curl -X POST "<LGM_API_BASE>/campaigns/<campaign_id>/start" \
  -H "Authorization: Bearer ${LGM_API_KEY}" \
  -H "Content-Type: application/json"
```

## Notes

- Confirm exact base URL and route names from your workspace API docs before coding.
- Scope API keys to the minimum required permissions where possible.
- For high-volume imports, prefer platform bulk import APIs over many single-record calls.

## Rate Limits

- Limits depend on plan/workspace configuration.
- Apply backoff/retry on `429` responses.

## Relevant Skills

- smartlead-outbound
- email-find-verify
- pipedrive-crm
