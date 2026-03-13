# Ocean.io

B2B data and lookalike API for company discovery, people discovery, enrichment, lookup, autocomplete, and database warmup workflows.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | Public HTTPS API with `v2` and `v3` endpoints |
| MCP | ✓ | Ocean.io pricing page currently lists MCP support |
| CLI | [✓](../clis/ocean.js) | Local zero-dependency CLI added in this repo |
| SDK | - | Official docs show HTTP examples, not a standalone SDK |
| Webhook | ✓ | Supported for async enrich flows such as batch people enrichment |

## Authentication

- **Type**: API token
- **Header**: `X-Api-Token: {api_token}`
- **Alternative**: `apiToken` query parameter
- **Base URL**: `https://api.ocean.io`
- **Local CLI env var**: `OCEAN_API_TOKEN`

Ocean.io documents header auth and query-param auth. Prefer the header and do not send both at once.

## Common Agent Operations

### Get searchable industries, technologies, regions, seniorities, and departments

```bash
GET https://api.ocean.io/v2/data-fields
```

### Warm up companies by domain

```bash
POST https://api.ocean.io/v2/warmup/companies

{
  "domains": ["ocean.io", "example.com"]
}
```

Ocean.io documents this endpoint as not consuming credits.

### Autocomplete companies

```bash
POST https://api.ocean.io/v2/autocomplete/companies

{
  "name": "ocea",
  "countryFilters": ["dk", "se"]
}
```

### Enrich a company

```bash
POST https://api.ocean.io/v2/enrich/company

{
  "company": {
    "domain": "ocean.io"
  },
  "fields": ["domain", "name", "employeeCountOcean", "technologies"]
}
```

Ocean.io documents current credit cost as:

- 1 credit when the request contains the company domain
- 5 credits when the request does not contain the company domain

### Enrich a person

```bash
POST https://api.ocean.io/v2/enrich/person

{
  "person": {
    "linkedinHandle": "john-doe"
  },
  "company": {
    "domain": "example.com"
  }
}
```

Ocean.io documents current cost as 3 credits per enriched person. Email and phone reveal options are also supported.

### Batch enrich people asynchronously

```bash
POST https://api.ocean.io/v2/enrich/people

{
  "peopleDataMapping": {
    "lead-1": {
      "person": {
        "linkedinHandle": "john-doe"
      }
    }
  },
  "webhookUrl": "https://example.com/ocean-webhook"
}
```

### Lookup people by LinkedIn handle or Ocean ID

```bash
POST https://api.ocean.io/v2/lookup/people

{
  "linkedinHandles": ["john-doe", "jane-smith"]
}
```

Ocean.io documents a maximum combined batch size of 1000 IDs/handles.

### Search companies

```bash
POST https://api.ocean.io/v3/search/companies

{
  "size": 50,
  "companiesFilters": {
    "domains": ["ocean.io"]
  }
}
```

Use `searchAfter` from the previous response for pagination.

### Search people

```bash
POST https://api.ocean.io/v3/search/people

{
  "size": 25,
  "peopleFilters": {
    "countries": ["us"],
    "jobTitles": ["Head of Marketing"]
  }
}
```

Ocean.io documents current pricing for this endpoint as:

- 3 credits per person when the request includes lookalike people or lookalike companies
- 1 credit per person otherwise

## Local CLI examples

```bash
node tools/clis/ocean.js data-fields list
node tools/clis/ocean.js warmup companies --domains ocean.io,example.com
node tools/clis/ocean.js autocomplete companies --name ocea --countries dk,se
node tools/clis/ocean.js enrich company --domain ocean.io --fields domain,name,employeeCountOcean
node tools/clis/ocean.js enrich person --linkedin-handle john-doe --company-domain example.com
node tools/clis/ocean.js lookup people --linkedin-handles john-doe,jane-smith
node tools/clis/ocean.js search companies --body-file company-search.json
node tools/clis/ocean.js search people --body-file people-search.json
```

## When to Use

- Build lookalike prospecting workflows from seed accounts or contacts
- Enrich CRM companies and people with Ocean.io data
- Warm up unseen domains before larger search jobs
- Build account and contact discovery tools for outbound or RevOps
- Feed AI agents with structured B2B company and people data

## Rate Limits

Ocean.io documents that rate limits vary by pricing plan rather than a single global number.

When exceeded, Ocean.io says responses include headers such as:

- `Retry-After`
- `X-RateLimit-Limit`

## Notes

- Prefer `v3` search endpoints over the older deprecated company search docs.
- Do not send both `X-Api-Token` and `apiToken` together; Ocean.io documents that conflicting tokens return an error.
- Batch people enrichment is webhook-oriented rather than immediate synchronous retrieval.
- Ocean.io’s pricing page currently advertises Platform, API, MCP, Webhook, and Clay support.

## Relevant Skills

- revops
- sales-enablement
- paid-ads
