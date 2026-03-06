---
name: apollo-outbound
description: "When the user wants to use Apollo.io for B2B outbound sales and marketing. Also use when the user mentions 'Apollo,' 'Apollo.io,' 'prospect search,' 'people search,' 'contact enrichment,' 'lead enrichment,' 'company lookup,' 'firmographic data,' 'outbound prospecting,' 'ABM with Apollo,' 'lead scoring,' 'cold email,' 'email sequence,' 'Apollo API,' 'sales intelligence,' or 'B2B data.' Covers Apollo.io API usage for people search, company search, contact enrichment, lead scoring, ABM targeting, and cold email campaigns."
metadata:
  version: 1.0.0
---

# Apollo.io Outbound

You are an expert in using Apollo.io for B2B outbound sales and marketing. Apollo.io is a B2B prospecting and data enrichment platform with 210M+ contacts and 35M+ companies. Your goal is to help users leverage Apollo's data and APIs to build prospect lists, enrich leads, score accounts, and run effective outbound campaigns.

## When to Use This Skill

- Searching for prospects by title, seniority, location, or company attributes
- Enriching contacts or companies with verified data
- Building target account lists for ABM campaigns
- Scoring leads based on firmographic and behavioral fit
- Writing cold email sequences with Apollo-sourced personalization
- Any workflow involving Apollo.io data or APIs

## Apollo.io Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | Yes | People Search, Company Search, Enrichment, Sequences |
| MCP | No | Not available |
| CLI | Yes | See apollo.js |
| SDK | No | REST API only |

## Authentication

**Type**: API Key
**Header**: `x-api-key: {api_key}` or `Authorization: Bearer {token}`
**Get key**: Settings > Integrations > API at https://app.apollo.io

## Rate Limits

- Standard: 100 requests/minute for most endpoints
- Bulk enrichment: up to 10 people per request
- Search: max 50,000 records (100 per page, 500 pages)
- Rate limits vary by plan tier

---

## Core API Operations

### People Search

Find prospects matching specific criteria.

```bash
POST https://api.apollo.io/api/v1/mixed_people/api_search

{
  "person_titles": ["Sales Manager"],
  "person_locations": ["United States"],
  "organization_num_employees_ranges": ["1,100"],
  "page": 1,
  "per_page": 25
}
```

**Parameters**:
- `person_titles` — Array of job titles
- `person_locations` — Array of locations
- `person_seniorities` — Array: owner, founder, c_suite, partner, vp, head, director, manager, senior, entry
- `organization_num_employees_ranges` — Array of ranges (e.g., "1,100", "101,500")
- `organization_ids` — Filter by specific Apollo org IDs
- `page` — Page number (default: 1)
- `per_page` — Results per page (default: 25, max: 100)

**Person data returned**:
- `first_name`, `last_name` — Name
- `title` — Job title
- `email` — Verified email
- `linkedin_url` — LinkedIn profile
- `organization` — Company details
- `seniority` — Seniority level
- `departments` — Department list

---

### Person Enrichment

Enrich a single contact with verified data.

```bash
POST https://api.apollo.io/api/v1/people/match

{
  "first_name": "Tim",
  "last_name": "Zheng",
  "domain": "apollo.io"
}
```

**Parameters**:
- `email` — Email address (strongest single-field match)
- `first_name` + `last_name` + `domain` — Alternative lookup
- `linkedin_url` — LinkedIn URL (highest match rate)
- `reveal_personal_emails` — Include personal emails (boolean)
- `reveal_phone_number` — Include phone numbers (boolean)

**Lookup reliability order**: LinkedIn URL > email > name + domain > name + company name

---

### Bulk People Enrichment

Enrich up to 10 contacts per request.

```bash
POST https://api.apollo.io/api/v1/people/bulk_match

{
  "details": [
    { "email": "tim@apollo.io" },
    { "first_name": "Jane", "last_name": "Doe", "domain": "example.com" }
  ]
}
```

**Best practices**:
- Deduplicate records before sending
- Group by lookup method (email-based vs. name+domain)
- Log match rates and flag low-confidence results

---

### Organization Search

Find companies matching criteria.

```bash
POST https://api.apollo.io/api/v1/mixed_companies/search

{
  "organization_locations": ["United States"],
  "organization_num_employees_ranges": ["1,100"],
  "page": 1
}
```

---

### Organization Enrichment

Get firmographic data for a company.

```bash
POST https://api.apollo.io/api/v1/organizations/enrich

{
  "domain": "apollo.io"
}
```

**Organization data returned**:
- `name` — Company name
- `website_url` — Website
- `estimated_num_employees` — Employee count
- `industry` — Industry
- `annual_revenue` — Revenue
- `technologies` — Tech stack
- `funding_total` — Total funding

---

## Use Case Guides

Apollo.io supports four major outbound workflows. Each has a detailed reference guide:

### 1. Lead Enrichment
Enrich prospect data with verified emails, phone numbers, job titles, and company firmographics. Covers single-contact, bulk, and company enrichment workflows.

**See**: [references/lead-enrichment.md](references/lead-enrichment.md)

### 2. ABM Strategy
Build account-based marketing campaigns using Apollo data for account selection, tiering, buying committee mapping, and multi-channel engagement.

**See**: [references/abm-strategy.md](references/abm-strategy.md)

### 3. Lead Scoring
Design scoring models using Apollo firmographic and demographic data for fit scoring, combined with behavioral engagement scoring.

**See**: [references/lead-scoring.md](references/lead-scoring.md)

### 4. Cold Email
Write and sequence cold emails using Apollo-sourced personalization data (title, seniority, tech stack, company size, industry).

**See**: [references/cold-email.md](references/cold-email.md)

---

## Quick-Start Workflows

### Workflow A: Build a Prospect List

1. Define ICP criteria (title, seniority, company size, industry, location)
2. Run People Search with ICP filters
3. Enrich top results for verified emails and phone numbers
4. Export to CRM or email sequencing tool
5. Score and prioritize leads before outreach

### Workflow B: Enrich Existing Contacts

1. Export contacts from CRM with best available identifier
2. Deduplicate on email or LinkedIn URL
3. Run Bulk People Enrichment in batches of 10
4. Append firmographic data via Organization Enrichment
5. Push enriched data back to CRM
6. Segment based on new data (seniority, company size, tech stack)

### Workflow C: ABM Account Research

1. Search for target companies matching ICP firmographics
2. Enrich each company for full firmographic profile
3. Run People Search filtered by organization ID to find buying committee
4. Enrich each contact for verified email and seniority
5. Tier accounts (1:1, 1:few, 1:many)
6. Build personalized outreach per tier

### Workflow D: Personalized Cold Email Campaign

1. Build prospect list via People Search
2. Enrich contacts for personalization fields
3. Segment by seniority + industry for message tailoring
4. Write email sequences using Apollo data fields:
   - `title` — Role-specific messaging
   - `seniority` — Adjust formality (strategic vs. tactical)
   - `organization.technologies` — Tech-stack-aware messaging
   - `organization.estimated_num_employees` — Scale-appropriate examples
   - `organization.industry` — Industry-specific case studies
5. A/B test subject lines and CTAs
6. Monitor reply rates and iterate

---

## Apollo Data Best Practices

### Data Quality
- Verified emails are worth more than 10 unverified ones
- Match on multiple fields for best results (name + domain > name alone)
- Cache results with 30-90 day TTL to avoid re-enriching
- Deduplicate before enriching to conserve API credits

### Credit Optimization
- Batch requests where possible
- Prioritize enrichment for leads in active pipeline
- Use search to qualify before enriching (search is cheaper)
- Set up automated re-enrichment quarterly (people change jobs every 2-3 years)

### Compliance
- Only enrich data with legitimate business interest
- Honor opt-out requests and suppression lists
- Be transparent about data sources in privacy policy
- GDPR/CCPA apply to enriched data

---

## Related Skills

- **competitor-alternatives**: Research competitor customers as target accounts
