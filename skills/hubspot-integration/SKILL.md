---
name: hubspot-integration
description: Use when the user needs to set up, test, or troubleshoot a HubSpot integration, work with HubSpot contacts, companies, deals, tickets, forms, marketing emails, or use the HubSpot CLI. Trigger on phrases like "HubSpot integration," "HubSpot contacts," "HubSpot deals," "HubSpot form submissions," "HubSpot marketing emails," or "HubSpot CLI."
metadata:
  version: 1.0.0
---

# HubSpot Integration

Use this skill for HubSpot API and CLI workflows.

## Execution Preference

1. Use HubSpot's REST API patterns in this repo when the user wants CRM, forms, or marketing operations.
2. Use the official `hs` CLI when the user is working on HubSpot local development, CMS assets, or account/project setup.
3. Use direct API requests before proposing a custom wrapper, since this repo does not currently include a local `hubspot.js` CLI.

Do not assume OAuth is required. HubSpot private app tokens are often the fastest path for internal integrations.

## Required First Step

Before making changes, confirm or infer:

- objective (`setup`, `test`, `troubleshoot`, or `build`)
- HubSpot workflow type (`contacts`, `companies`, `deals`, `tickets`, `forms`, `marketing`, or `cli`)
- whether the user already has a HubSpot private app token or OAuth app
- the target object IDs, pipeline IDs, form GUIDs, or property names involved

If the request is broad, narrow it to the smallest HubSpot operation first.

## Core Rules

- Use `Authorization: Bearer {token}` for API requests.
- Prefer private app tokens for internal scripts and operational workflows.
- Work with HubSpot object properties explicitly instead of assuming default fields.
- When dealing with contacts or deals, define which properties need to be read or written before making the request.
- Use the official `hs` CLI for local asset upload, watch, and account setup tasks.

## Common Workflows

### Manage contacts

1. List or search contacts.
2. Create or update the contact with explicit properties.
3. Confirm lifecycle stage or lead status fields if downstream workflows depend on them.

API path:

```bash
GET /crm/v3/objects/contacts?limit=10
POST /crm/v3/objects/contacts/search
POST /crm/v3/objects/contacts
PATCH /crm/v3/objects/contacts/{contact_id}
```

### Manage deals and associations

1. List or create the deal.
2. Set key properties such as `dealname`, `amount`, `dealstage`, and `pipeline`.
3. Associate the deal with a contact when needed.

API path:

```bash
GET /crm/v3/objects/deals?limit=10&properties=dealname,amount,dealstage
POST /crm/v3/objects/deals
PUT /crm/v3/objects/deals/{deal_id}/associations/contacts/{contact_id}/deal_to_contact
```

### Work with forms and marketing email

Use this when the user needs lead capture data or outbound marketing assets.

API path:

```bash
GET /form-integrations/v1/submissions/forms/{form_guid}
GET /marketing/v3/emails?limit=10
```

### Use the HubSpot CLI

Use the official CLI for local development workflows:

```bash
npm install -g @hubspot/cli
hs init
hs upload src dest
hs watch src dest
hs accounts list
```

## Troubleshooting Order

Check these in order:

1. The bearer token or OAuth token is present and valid.
2. The target object type and object ID are correct.
3. Required properties match HubSpot's expected internal property names.
4. Pipeline stages, associations, or form GUIDs exist in the target portal.
5. If using the CLI, confirm the correct HubSpot account/portal is selected.

## Output Expectations

Return:

- workflow used (`contacts`, `companies`, `deals`, `tickets`, `forms`, `marketing`, or `cli`)
- whether the task was `setup`, `test`, `troubleshoot`, or `build`
- API calls or CLI commands proposed
- object IDs, form GUIDs, or property names involved
- smallest next corrective step if anything is blocked

## References

- Integration guide: `tools/integrations/hubspot.md`
- Tool registry: `tools/REGISTRY.md`
