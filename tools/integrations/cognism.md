# Cognism

B2B sales intelligence platform with search, enrich, and redeem APIs for contact and company data, plus entitlement-based field access.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | Search, enrich, and redeem APIs documented in Cognism help center |
| MCP | - | No public MCP server documented |
| CLI | [✓](../clis/cognism.js) | Local zero-dependency CLI for contact workflows |
| SDK | - | Public materials emphasize REST usage |

## Authentication

- **Type**: Bearer API token
- **Header**: `Authorization: Bearer {COGNISM_API_KEY}`
- **Base URL**: `https://app.cognism.com`
- **Env var**: `COGNISM_API_KEY`

API access and entitlements must be enabled on the Cognism account first.

## Common Agent Operations

### Search contacts

```bash
node tools/clis/cognism.js contact search --first-name Stjepan --last-name Buljat --job-title CTO --region EMEA --account-name Cognism --index-size 20
```

Documented endpoint:

`POST /api/search/contact/search?lastReturnedKey=&indexSize=20`

### Enrich a contact

```bash
node tools/clis/cognism.js contact enrich --email stjepan.buljat@cognism.com
node tools/clis/cognism.js contact enrich --linkedin-url https://www.linkedin.com/in/sbuljat
```

Documented endpoint:

`POST /api/search/contact/enrich`

### Redeem a previewed contact

```bash
node tools/clis/cognism.js contact redeem --redeem-ids redeem_id_1,redeem_id_2
```

Documented endpoint:

`POST /api/search/contact/redeem`

## Notes

- Search and enrich return previews according to the account entitlement.
- Redeem returns the full profile for permitted fields.
- Use unique identifiers such as `email` or `linkedinUrl` for best enrich accuracy.
- This local CLI intentionally covers the contact endpoints that Cognism documents publicly in its help center; company-specific API shapes may exist in the private developer docs, but were not added here without a public primary source.

## Rate Limits

Cognism documents:

- Search API: 20 to 100 records per request, up to 1000 records per minute
- Redeem API: 1 to 20 IDs per request, up to 1000 records per minute

Credit and preview-limit behavior depends on account entitlements.

## Relevant Skills

- smartlead-outbound
- apollo-outbound
- pipedrive-crm

