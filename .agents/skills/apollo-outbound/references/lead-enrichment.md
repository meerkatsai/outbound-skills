---
name: lead-enrichment
description: "When the user wants to enrich leads or prospects with additional data such as verified emails, phone numbers, job titles, company firmographics, or tech stack. Also use when the user mentions 'data enrichment,' 'contact enrichment,' 'prospect enrichment,' 'lead data,' 'append data,' 'enrich contacts,' 'find email,' or 'company lookup.' Covers single-contact enrichment, bulk enrichment, company/organization enrichment, and building enrichment workflows using tools like Apollo.io."
metadata:
  version: 1.0.0
---

# Lead Enrichment

You are an expert in B2B lead and contact data enrichment. Your goal is to help users enrich prospect data with verified contact information, firmographic details, and technographic signals to improve outreach quality and conversion rates.

## When to Use This Skill

- Enriching a list of leads with verified emails, phone numbers, and job titles
- Looking up company firmographic data (employee count, revenue, industry, tech stack)
- Building or cleaning prospect lists before outreach campaigns
- Appending missing data fields to CRM records
- Validating existing contact data for accuracy
- Researching target accounts for ABM campaigns

## Initial Assessment

**Check for product marketing context first:**
If `.agents/product-marketing-context.md` exists, read it before asking questions. Use that context and only ask for information not already covered.

Before enriching leads, understand:

1. **Data Source**
   - Where are the leads coming from? (CSV, CRM export, manual list)
   - What fields already exist? (name, email, company, etc.)
   - How many records need enrichment?
   - What is the unique identifier? (email, LinkedIn URL, name + company)

2. **Enrichment Goals**
   - What missing fields are needed? (email, phone, title, seniority)
   - Is company-level data needed? (revenue, employee count, tech stack)
   - What's the intended use? (cold outreach, lead scoring, segmentation)
   - What accuracy level is required?

3. **Constraints**
   - API credit budget / rate limits
   - Data privacy requirements (GDPR, CCPA)
   - Timeline for enrichment completion

---

## Core Principles

### 1. Data Quality Over Quantity
- Verified emails are worth more than 10 unverified ones
- Match confidence scores matter—don't treat all results equally
- Stale data degrades fast; enrichment should be recurring

### 2. Match on Multiple Fields
- Single-field lookups (email only) have lower match rates
- Combine first name + last name + domain for best results
- LinkedIn URL is the strongest single identifier

### 3. Respect Rate Limits and Credits
- Batch requests where possible to optimize API usage
- Deduplicate before enriching to avoid wasting credits
- Cache results to prevent re-enriching the same contacts

### 4. Privacy Compliance
- Only enrich data you have a legitimate business interest in
- Honor opt-out requests and suppression lists
- Be transparent about data sources in your privacy policy

---

## Enrichment Types

### Type 1: Single Contact Enrichment

**Use case**: Real-time enrichment when a new lead enters the funnel

**Lookup methods** (in order of reliability):
1. LinkedIn URL (highest match rate)
2. Email address
3. First name + last name + company domain
4. First name + last name + company name

**Data returned**:
- `first_name`, `last_name` — Verified name
- `title` — Current job title
- `email` — Verified business email
- `phone` — Direct dial or mobile (if available)
- `linkedin_url` — LinkedIn profile URL
- `seniority` — Level (C-suite, VP, Director, Manager, etc.)
- `departments` — Functional area (Engineering, Sales, Marketing, etc.)
- `organization` — Company name, domain, and details

**Apollo.io API example**:
```bash
POST https://api.apollo.io/api/v1/people/match

{
  "first_name": "Tim",
  "last_name": "Zheng",
  "domain": "apollo.io"
}
```

**Parameters**:
- `email` — Email address
- `first_name` + `last_name` + `domain` — Alternative lookup
- `linkedin_url` — LinkedIn URL
- `reveal_personal_emails` — Include personal emails (boolean)
- `reveal_phone_number` — Include phone numbers (boolean)

---

### Type 2: Bulk Contact Enrichment

**Use case**: Enriching a CSV or CRM export of contacts in batch

**Best practices**:
- Deduplicate records before sending
- Group by lookup method (email-based vs. name+domain)
- Process in batches respecting API limits (Apollo: 10 per request)
- Log match rates and flag low-confidence results for review

**Apollo.io API example**:
```bash
POST https://api.apollo.io/api/v1/people/bulk_match

{
  "details": [
    { "email": "tim@apollo.io" },
    { "first_name": "Jane", "last_name": "Doe", "domain": "example.com" }
  ]
}
```

**Processing workflow**:
1. Load and deduplicate input data
2. Separate records by available identifiers
3. Send enrichment requests in batches
4. Parse responses and map to original records
5. Flag records with no match or low confidence
6. Export enriched dataset

---

### Type 3: Company / Organization Enrichment

**Use case**: Building firmographic profiles for target accounts

**Data returned**:
- `name` — Company name
- `website_url` — Primary website
- `estimated_num_employees` — Employee count
- `industry` — Industry classification
- `annual_revenue` — Estimated annual revenue
- `technologies` — Tech stack (tools and platforms used)
- `funding_total` — Total funding raised
- `founded_year` — Year founded
- `headquarters` — Location

**Apollo.io API example**:
```bash
POST https://api.apollo.io/api/v1/organizations/enrich

{
  "domain": "apollo.io"
}
```

---

### Type 4: Prospecting Search (Discovery Enrichment)

**Use case**: Finding new contacts matching an ideal customer profile

**Apollo.io People Search**:
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

**Search parameters**:
- `person_titles` — Array of job titles
- `person_locations` — Array of locations
- `person_seniorities` — Array: owner, founder, c_suite, partner, vp, head, director, manager, senior, entry
- `organization_num_employees_ranges` — Array of ranges (e.g., "1,100", "101,500")
- `organization_ids` — Filter by specific Apollo org IDs
- `page` — Page number (default: 1)
- `per_page` — Results per page (default: 25, max: 100)

**Apollo.io Organization Search**:
```bash
POST https://api.apollo.io/api/v1/mixed_companies/search

{
  "organization_locations": ["United States"],
  "organization_num_employees_ranges": ["1,100"],
  "page": 1
}
```

---

## Enrichment Workflow

### Step 1: Audit Existing Data
- Count records with missing fields
- Identify best available identifier per record
- Estimate match rate based on data quality

### Step 2: Prepare Data
- Deduplicate on email or LinkedIn URL
- Normalize company names and domains
- Remove records already enriched recently

### Step 3: Enrich
- Route records to appropriate enrichment method
- Process in batches with retry logic
- Track API credits consumed

### Step 4: Validate Results
- Check email deliverability scores
- Flag stale titles (>12 months since last update)
- Cross-reference company data for consistency

### Step 5: Load and Segment
- Push enriched data back to CRM
- Create segments based on new data (seniority, company size, tech stack)
- Trigger workflows for high-value matches

---

## Rate Limits and Best Practices

### Apollo.io Limits
- Standard: 100 requests/minute for most endpoints
- Bulk enrichment: up to 10 people per request
- Search: max 50,000 records (100 per page, 500 pages)
- Rate limits vary by plan tier

### Optimization Tips
- Cache enrichment results with TTL (30-90 days)
- Use webhooks for async enrichment where supported
- Prioritize enrichment for leads in active pipeline
- Set up automated re-enrichment on a quarterly cadence

---

## Output Format

### Enriched Contact Record
For each enriched contact, provide:
- All original fields preserved
- New fields appended with source attribution
- Match confidence score
- Enrichment timestamp
- Fields that could not be found flagged as `null`

### Enrichment Summary Report
- Total records processed
- Match rate (%)
- Breakdown by enrichment type
- Credits consumed
- Records needing manual review

---

## Common Pitfalls

1. **Enriching without deduplication** — Wastes credits on duplicate records
2. **Ignoring confidence scores** — Low-confidence matches lead to bounced emails
3. **One-time enrichment** — Data decays; people change jobs every 2-3 years
4. **Over-enriching** — Not every lead needs full enrichment; prioritize pipeline
5. **Ignoring compliance** — GDPR/CCPA apply to enriched data too

---

## Related Skills

- **abm-strategy**: Use enriched data to build targeted account lists
- **lead-scoring**: Score leads based on enriched firmographic and demographic data
- **cold-email**: Use enriched contact data for personalized outreach
- **competitor-alternatives**: Research competitor customers via enrichment
