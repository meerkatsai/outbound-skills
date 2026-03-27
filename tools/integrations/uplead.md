# UpLead

B2B contact and company data API for enrichment, combined person+company lookups, prospecting, industries search, credits, and company-name-to-domain workflows.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | Public REST API documented at `api.uplead.com/v2` |
| MCP | - | No public MCP server documented |
| CLI | [✓](../clis/uplead.js) | Local zero-dependency CLI in this repo |
| SDK | - | Public docs focus on direct HTTP API usage |

## Authentication

- **Type**: API key in `Authorization` header
- **Header**: `Authorization: {UPLEAD_API_KEY}`
- **Base URL**: `https://api.uplead.com/v2`
- **Env var**: `UPLEAD_API_KEY`

## Common Agent Operations

### Credits

```bash
node tools/clis/uplead.js credits
```

Endpoint: `GET /credits`

### Company lookup

```bash
node tools/clis/uplead.js company search --domain amazon.com
node tools/clis/uplead.js company search --name Amazon
```

Endpoint: `POST /company-search`

### Person lookup

```bash
node tools/clis/uplead.js person search --email marc@salesforce.com
node tools/clis/uplead.js person search --first-name Marc --last-name Benioff --domain salesforce.com
```

Endpoint: `POST /person-search`

### Combined person + company lookup

```bash
node tools/clis/uplead.js combined search --email marc@salesforce.com
```

Endpoint: `POST /combined-search`

### Prospector and Prospector Pro

```bash
node tools/clis/uplead.js prospector search --body-file prospector.json
node tools/clis/uplead.js prospector-pro search --body-file prospector-pro.json
```

Endpoints:

- `POST /prospector-search`
- `POST /prospector-pro-search`

### Industries and company-name-to-domain

```bash
node tools/clis/uplead.js industries search --text finance
node tools/clis/uplead.js name-to-domain search --company "Amazon.com, Inc."
```

Endpoints:

- `POST /industries`
- `POST /company-name-to-domain-search`

## Notes

- UpLead documents a rate limit of 500 requests per minute.
- The logo API is a separate public asset surface: `https://logo.uplead.com/{domain}`.
- Billing is credit-based and UpLead documents that repeat access to the same contact/company does not double-charge.
- Prospector Pro is plan-restricted according to the docs.

## Relevant Skills

- email-find-verify
- apollo-outbound
- smartlead-outbound

