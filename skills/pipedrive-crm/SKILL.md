---
name: pipedrive-crm
description: Use when operating Pipedrive CRM for leads, deals, people, organizations, activities, and pipeline stage updates. Use for deal tracking, contact/account sync, activity logging, and CRM cleanup workflows.
metadata:
  version: 1.0.0
---

# Pipedrive CRM

Use this skill for day-to-day CRM operations in Pipedrive.

## Prerequisites

- Pipedrive company domain: `https://{company}.pipedrive.com`
- OAuth access token (recommended) or API token
- Clear scope before edits: pipeline, owner, stage, and date range

## Core Workflow

1. Start read-only: list/search records before changes.
2. De-duplicate before creates (email for person, name/domain for org).
3. Apply the smallest update needed.
4. Return IDs and changes clearly (`deal_id`, `person_id`, `organization_id`, `activity_id`).

## Common Operations

### Deal operations

- List open deals by pipeline/stage
- Search deals by term/status/owner
- Create new deals linked to person/org
- Move deals across stages
- Mark deals won/lost with outcome notes

### Contact and org operations

- Create/update persons
- Create/update organizations
- Associate people with organizations and deals
- Maintain field hygiene (title, phone, owner, tags/custom fields)

### Activity operations

- Log calls, meetings, tasks, and email follow-ups
- Attach activities to deal/person/org
- Set due dates and owners for next actions

## API Patterns

Use API v2 endpoints where available.

```bash
GET https://{company}.pipedrive.com/api/v2/deals?status=open&limit=100
POST https://{company}.pipedrive.com/api/v2/deals
PATCH https://{company}.pipedrive.com/api/v2/deals/{deal_id}
GET https://{company}.pipedrive.com/api/v2/persons?limit=100
GET https://{company}.pipedrive.com/api/v2/organizations?limit=100
GET https://{company}.pipedrive.com/api/v2/activities?limit=100
```

Auth:

- OAuth: `Authorization: Bearer {access_token}`
- API token: `api_token={token}` query parameter

## Output Expectations

- Report changed records and their IDs.
- For updates, include before/after key fields (stage, status, owner).
- Flag skipped or ambiguous matches with reason.
