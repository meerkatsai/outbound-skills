---
name: pipedrive-contact-ops
description: "Manage Pipedrive contacts, organizations, and activities. Use when users ask to create/update/find persons or organizations, log activities (calls/emails/meetings/tasks), or keep CRM contact data synced with outbound tools."
metadata:
  version: 1.0.0
---

# Pipedrive Contact Operations

Use this skill for contact/account data hygiene and activity logging in Pipedrive.

## Prerequisites

- OAuth access token (recommended) or API token access
- Pipedrive company domain (`https://{company}.pipedrive.com`)
- Unique matching keys for upsert logic (email/domain/external ID)

## Core Workflow

1. Resolve identity first (person/org lookup before create).
2. De-duplicate by strongest key (email for person, domain/name for organization).
3. Update only changed fields.
4. Log important actions as activities tied to person/org/deal.

## Common Operations

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

### Update person

```bash
PATCH https://{company}.pipedrive.com/api/v2/persons/{person_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "phone": [
    {
      "value": "+14155551212",
      "primary": true
    }
  ]
}
```

### List organizations

```bash
GET https://{company}.pipedrive.com/api/v2/organizations?limit=100
Authorization: Bearer {access_token}
```

### Create organization

```bash
POST https://{company}.pipedrive.com/api/v2/organizations
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Example Inc",
  "address": "San Francisco, CA"
}
```

### List activities

```bash
GET https://{company}.pipedrive.com/api/v2/activities?limit=100
Authorization: Bearer {access_token}
```

## Activity Logging Pattern

When recording outbound/sales outcomes:

1. Resolve person and org.
2. Resolve or create linked deal where relevant.
3. Create activity with clear type and due date.
4. Attach outcome notes and next action.

## Output Expectations

- Always include:
  - `person_id`, `organization_id`, and `activity_id` created/updated
  - dedupe decision (created vs matched existing)
  - fields changed

## Related Guides

- [../../tools/integrations/pipedrive.md](../../tools/integrations/pipedrive.md)
