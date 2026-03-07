---
name: pipedrive-deal-ops
description: "Operate Pipedrive deal pipelines for GTM teams. Use when users ask to create/update/list/search deals, move deals between stages, mark deals won/lost, inspect pipeline health, or sync campaign outcomes into CRM deal records."
metadata:
  version: 1.0.0
---

# Pipedrive Deal Operations

Use this skill for deal lifecycle operations in Pipedrive.

## Prerequisites

- OAuth access token (recommended) or API token access
- Pipedrive company domain (`https://{company}.pipedrive.com`)
- Understand target pipeline/stage IDs before mutating deals

## Core Workflow

1. Confirm scope: pipeline, stage, owner, and date range.
2. Start read-only: list/search current deals before updates.
3. Apply minimal updates: change only required fields.
4. Return IDs and state transitions clearly (`deal_id`, old/new stage, status).

## Common Operations

### List open deals

```bash
GET https://{company}.pipedrive.com/api/v2/deals?status=open&limit=100
Authorization: Bearer {access_token}
```

### Search deals

```bash
GET https://{company}.pipedrive.com/api/v2/deals/search?term={query}&status=open&limit=100
Authorization: Bearer {access_token}
```

### Create deal

```bash
POST https://{company}.pipedrive.com/api/v2/deals
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "Inbound - Enterprise ACME",
  "value": 25000,
  "currency": "USD",
  "person_id": 123,
  "org_id": 456
}
```

### Move deal stage

```bash
PATCH https://{company}.pipedrive.com/api/v2/deals/{deal_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "stage_id": 12
}
```

### Mark deal won/lost

```bash
PATCH https://{company}.pipedrive.com/api/v2/deals/{deal_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "status": "won"
}
```

## Operating Guidelines

- Prefer API v2 endpoints.
- Avoid bulk destructive edits without explicit user approval.
- On stage/status changes, log reason and source (e.g., meeting booked, no response).
- Use pagination for all list flows (`limit`, cursor params).

## Output Expectations

- Always include:
  - affected `deal_id` values
  - previous and new stage/status (if changed)
  - any skipped records with reason

## Related Guides

- [../../tools/integrations/pipedrive.md](../../tools/integrations/pipedrive.md)
