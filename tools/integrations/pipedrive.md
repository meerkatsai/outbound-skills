# Pipedrive

Sales CRM for managing leads, deals, contacts, pipelines, and activities.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | REST API (`/api/v2` preferred) |
| MCP | - | Not available |
| CLI | - | Use API scripts or custom CLI |
| SDK | ✓ | Official Node.js and PHP client libraries |

## Authentication

- **Type**: OAuth 2.0 (recommended for apps), API token (direct account usage)
- **OAuth token host**: `https://oauth.pipedrive.com`
- **API base domain**: `https://{company}.pipedrive.com`
- **OAuth header**: `Authorization: Bearer {access_token}`
- **API token (legacy/simple)**: `api_token={token}` query parameter

## Common Agent Operations

### List deals

```bash
GET https://{company}.pipedrive.com/api/v2/deals?limit=100
Authorization: Bearer {access_token}
```

### Get deal

```bash
GET https://{company}.pipedrive.com/api/v2/deals/{deal_id}
Authorization: Bearer {access_token}
```

### Create deal

```bash
POST https://{company}.pipedrive.com/api/v2/deals
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "New Enterprise Opportunity",
  "value": 15000,
  "currency": "USD",
  "person_id": 123,
  "org_id": 456
}
```

### Update deal

```bash
PATCH https://{company}.pipedrive.com/api/v2/deals/{deal_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "status": "won"
}
```

### Search deals

```bash
GET https://{company}.pipedrive.com/api/v2/deals/search?term=enterprise&status=open&limit=100
Authorization: Bearer {access_token}
```

### List persons

```bash
GET https://{company}.pipedrive.com/api/v2/persons?limit=100
Authorization: Bearer {access_token}
```

### Create person

```bash
POST https://{company}.pipedrive.com/api/v2/persons
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": [
    {
      "value": "jane@example.com",
      "primary": true
    }
  ],
  "org_id": 456
}
```

### List organizations

```bash
GET https://{company}.pipedrive.com/api/v2/organizations?limit=100
Authorization: Bearer {access_token}
```

### List activities

```bash
GET https://{company}.pipedrive.com/api/v2/activities?limit=100
Authorization: Bearer {access_token}
```

## Core Entities

- **Leads**: Pre-deal opportunities
- **Deals**: Pipeline opportunities with value/stage/status
- **Persons**: Contact records
- **Organizations**: Company accounts
- **Activities**: Calls, meetings, tasks
- **Pipelines/Stages**: Deal progression model

## Pagination and Filtering

- Most list endpoints support `limit` and cursor-based pagination parameters
- Common filters: `owner_id`, `filter_id`, `updated_since`, `status`
- Use search endpoints (`/search`) for user-facing query flows

## When to Use

- Syncing leads/deals between outbound systems and CRM
- Updating pipeline status after campaign replies or meetings
- Enriching contact/account records from external data providers
- Building GTM reporting on deal progression and activity volume

## Rate Limits

- Pipedrive uses **token-based daily budgets** for API requests
- Exceeding budget returns `429 Too Many Requests` until reset window
- API v2 endpoints are preferred for lower token cost and performance

## Relevant Skills

- pipedrive-deal-ops
- pipedrive-contact-ops
- smartlead-outbound
- apollo-outbound
