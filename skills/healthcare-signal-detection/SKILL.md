---
name: healthcare-signal-detection
description: "Use when the user wants to detect healthcare hiring signals from LinkedIn posts, classify intent, enrich leads, and build an outreach pipeline. Trigger on phrases like 'healthcare hiring signals,' 'nurse hiring leads,' 'staffing agency leads,' 'healthcare staffing pipeline,' 'hiring intent detection,' 'RN hiring signals,' 'CNA hiring leads,' 'healthcare outbound,' or 'signal detection pipeline.' Covers the full workflow: Apify LinkedIn scraping, Meerkats AI-powered intent classification, lead enrichment, deduplication, HubSpot CRM export, and outreach sequence generation."
metadata:
  version: 2.0.0
---

# Healthcare Hiring Signal Detection & Conversion Pipeline

You are an expert in detecting high-intent healthcare hiring signals from LinkedIn posts, classifying them, enriching leads, and converting them into outreach-ready pipeline entries.

**Tool stack**: Apify (LinkedIn scraping) → Meerkats.ai tables + AI columns (classification, enrichment, filtering, dedup) → HubSpot (CRM) → Email/LinkedIn (outreach). Meerkats replaces Clay for all AI classification, filtering, and data processing. All other tools remain unchanged.

## Objective

- **Target Segment**: US-based healthcare staffing agencies + large healthcare providers actively hiring
- **Goal**: Identify high-intent hiring signals → enrich → push to CRM → trigger outreach
- **Success Metric**: Meetings booked with hiring decision-makers (TA heads, recruiters, ops leaders)

## When to Use This Skill

- Detecting healthcare hiring signals from LinkedIn posts
- Classifying hiring intent from Apify-scraped LinkedIn posts
- Enriching healthcare leads with contact and company data
- Building qualified lead lists for healthcare staffing outreach
- Generating personalized email sequences for hiring decision-makers
- Running the end-to-end signal-to-outreach pipeline

## Pipeline Overview

| Step | Action | Tool | Output |
|------|--------|------|--------|
| 1 | Scrape LinkedIn posts (boolean queries) | **Apify** (LinkedIn Post Scraper) | Raw posts with author data |
| 2 | Ingest into table | **Meerkats** table (Input columns) | Structured rows |
| 3 | Classify hiring intent | **Meerkats** AI columns | Intent type + signal strength |
| 4 | Filter high-quality leads | **Meerkats** filter_table_rows | Qualified leads |
| 5 | Extract contact/company data | **Meerkats** AI columns | Email, role, first name |
| 6 | Deduplicate | **Meerkats** check/delete_duplicate_rows | Clean dataset |
| 7 | Push to CRM | **HubSpot** | Company + Contact + Deal |
| 8 | Generate outreach | **Meerkats** AI columns | Email sequences |

---

## Step 1 — Signal Capture (Apify)

Apify scrapes **LinkedIn feed posts** (not job listing pages). This means each result includes the **author's name, LinkedIn profile URL, company, and role** — because a real person wrote the post.

### Keyword Strategy

Feed these boolean queries into Apify's LinkedIn Post Scraper as the search input.

**Core Hiring Keywords**:

| Category | Keywords |
|----------|----------|
| Direct Hiring | "we are hiring", "now hiring", "hiring RN", "hiring nurses" |
| Urgency | "urgent hiring", "immediate joiners", "ASAP hiring" |
| Roles | RN, CNA, LPN, GNA, PCA, caregiver, clinical staff |
| Healthcare Context | hospital hiring, clinic hiring, patient care jobs |
| Hashtags | #hiring #nowhiring #nursejobs #healthcarejobs |

**High-Intent Boolean Queries** (use as Apify search input — all include US geo-signals):

```
("we are hiring" OR "now hiring" OR "urgent hiring") AND (nurse OR RN OR CNA OR LPN OR caregiver OR "patient care") AND (USA OR "United States" OR Texas OR California OR Florida OR New York OR Ohio OR Pennsylvania OR Illinois OR Georgia OR North Carolina OR Michigan)
("hiring RN" OR "hiring CNA" OR "hiring nurses") AND (hospital OR clinic OR healthcare) AND (USA OR "United States" OR Texas OR California OR Florida OR New York OR Ohio OR Pennsylvania)
("#hiring" OR "#nowhiring") AND (nurse OR healthcare OR RN) AND (USA OR "United States")
("looking for nurses" OR "need nurses urgently") AND (USA OR "United States")
("healthcare staffing" OR "nurse staffing") AND (hiring OR recruiting) AND (USA OR "United States")
```

> **Why US geo-terms?** The target segment is strictly US-based healthcare staffing agencies and providers. Adding state names and "USA"/"United States" to every query ensures Apify returns US-relevant posts and filters out international results (India, Philippines, UK, Middle East — all major healthcare hiring markets that would otherwise pollute the dataset).

### Freshness Rule

**CRITICAL**: Only ingest posts from the last 14 days. Older posts are stale signals and must be discarded.

- Configure Apify's `publishedAt` or date range filter to the last 14 days.
- When ingesting rows, check `post_date` — skip any post where `post_date` is older than 14 days from the current date.
- The `Post Age Check` AI column (Step 3) acts as a safety net to catch any stale posts that slip through.

### Apify Configuration

Use an Apify LinkedIn Post Scraper actor. Key configuration:

```json
{
  "searchQueries": [
    "(\"we are hiring\" OR \"now hiring\" OR \"urgent hiring\") AND (nurse OR RN OR CNA OR LPN OR caregiver OR \"patient care\") AND (USA OR \"United States\" OR Texas OR California OR Florida OR New York OR Ohio)",
    "(\"hiring RN\" OR \"hiring CNA\" OR \"hiring nurses\") AND (hospital OR clinic OR healthcare) AND (USA OR \"United States\")",
    "(\"#hiring\" OR \"#nowhiring\") AND (nurse OR healthcare OR RN) AND (USA OR \"United States\")",
    "(\"looking for nurses\" OR \"need nurses urgently\") AND (USA OR \"United States\")",
    "(\"healthcare staffing\" OR \"nurse staffing\") AND (hiring OR recruiting) AND (USA OR \"United States\")"
  ],
  "maxResults": 500,
  "dateRange": "past-14-days",
  "geo": "United States"
}
```

> **Note**: Set `geo` to "United States" if the Apify actor supports geo-filtering. The boolean queries also include US terms as a secondary filter in case the actor doesn't support native geo-filtering.

### Apify Output Fields

Each scraped post returns structured data including:

| Apify Field | Description |
|-------------|-------------|
| `post_url` | URL of the LinkedIn post |
| `post_text` | Full text content of the post |
| `author_name` | Name of the person who posted |
| `author_linkedin_url` | LinkedIn profile URL of the author |
| `author_company` | Company name from the author's profile |
| `author_info` | Author's headline/role from their profile |
| `post_date` | When the post was published |
| `contentAttributes.textLink` | Any links embedded in the post text |

### Execution

1. Configure and run the Apify LinkedIn Post Scraper with the boolean queries above.
2. Set the date range to the last 14 days.
3. Download/export the Apify results.
4. **Discard any result where `post_date` is older than 14 days.**
5. Create a Meerkats table and bulk-add the Apify results as rows.

---

## Step 2 — Ingest into Meerkats Table

Create a Meerkats table and load the Apify output as rows.

**Create table command**:

```
Use mcp tool: create_table
  name: "Healthcare Hiring Signals — {date}"
  columns: (add after creation via add_table_column)
```

**Input columns to add** (mapped from Apify output):

| Column Name | Data Type | Type | Apify Source Field |
|-------------|-----------|------|--------------------|
| Post URL | url | Input | `post_url` |
| Post Text | text | Input | `post_text` |
| Author Name | text | Input | `author_name` |
| Author LinkedIn | url | Input | `author_linkedin_url` |
| Author Company | text | Input | `author_company` |
| Author Info | text | Input | `author_info` (headline/role) |
| Post Date | date | Input | `post_date` |

Use `add_table_rows_bulk` to load all scraped posts into the table at once.

---

## Step 3 — Intent Classification (Meerkats AI Columns)

Add AI columns to classify each post. These replace Clay AI.

### AI Column: `Intent Type`

**Prompt**:
```
Analyze the LinkedIn post text in {Post Text} and classify the hiring intent into exactly one of these categories:

- URGENT_HIRING: Post mentions urgently hiring nurses, immediate joiners, ASAP hiring
- ACTIVE_HIRING: Post says "we are hiring" RN/CNA/staff — direct demand
- EXPANSION_HIRING: Post mentions expanding teams, new facility hiring, scaling
- AGENCY_HIRING: Recruiter or staffing agency hiring for clients (multiplier signal)
- PIPELINE_BUILDING: Looking to partner, build talent pipeline — longer cycle
- PASSIVE_CONTENT: Thought leadership, generic healthcare content — no hiring signal

Return ONLY the category name, nothing else.
```

### AI Column: `Signal Strength`

**Prompt**:
```
Based on the post in {Post Text} and the intent type {Intent Type}, assign a signal strength:

- VERY_HIGH: Urgent requirements, immediate openings, ASAP language
- HIGH: Active hiring posts, multi-role hiring, agency hiring for clients
- MEDIUM: Pipeline building, partnership seeking
- LOW: Thought leadership, generic content, no hiring signal

Return ONLY the strength level.
```

### AI Column: `Is Healthcare Hiring`

**Prompt**:
```
Does the post in {Post Text} specifically relate to healthcare hiring (nurses, RN, CNA, LPN, GNA, PCA, caregiver, clinical staff, hospital, clinic, patient care)?

Return "YES" or "NO" only.
```

### AI Column: `Is US Based`

**Prompt**:
```
This pipeline targets ONLY US-based healthcare hiring. Determine if this post is about hiring in the United States.

Analyze {Post Text}, {Author Company}, and {Author Info} for US indicators:
- US state names (Texas, California, Florida, New York, Ohio, etc.)
- US city names (Houston, Los Angeles, Miami, Chicago, etc.)
- US-based company (check if {Author Company} is a known US healthcare staffing agency or US hospital/health system)
- US-specific terms: "travel nurse", "per diem", "PRN", state license abbreviations

If there are ANY non-US indicators (India, UK, Philippines, UAE, Canada, Australia, NHS, etc.), return "NO" even if US terms are also present.

If there are clear US indicators, return "YES".
If there are NO location indicators at all, return "NO".

Return ONLY "YES" or "NO". Do NOT return "UNCLEAR" — when in doubt, return "NO".
```

> **Strict US filter**: Unlike previous versions, "UNCLEAR" is not an option. If the post can't be confirmed as US-based, it's excluded. This prevents international leads from polluting the pipeline.

### AI Column: `Company Type`

**Prompt**:
```
Based on {Post Text} and {Author Company}, classify the company into one of these categories. We ONLY target US-based healthcare staffing agencies and large healthcare providers.

- STAFFING_AGENCY: US healthcare staffing or recruitment agency (e.g., AMN Healthcare, Aya Healthcare, Cross Country Healthcare, Medical Solutions, Supplemental Health Care, or similar staffing firms)
- HEALTHCARE_PROVIDER: US hospital, clinic, health system, large care facility (e.g., HCA Healthcare, Ascension, CommonSpirit, Kaiser Permanente, or similar provider organizations)
- RECRUITER_INDEPENDENT: Independent recruiter or small talent consultant specializing in healthcare
- OTHER: Not a US healthcare staffing agency or provider — includes non-healthcare companies, international companies, job boards, or unrelated organizations

Return ONLY the category name.
```

### AI Column: `Post Age Check`

**Prompt**:
```
Today's date is {{current_date}}. The post date is {Post Date}.

Calculate the number of days between the post date and today. If the post is older than 14 days, return "STALE". If 14 days or fewer, return "FRESH".

Return ONLY "FRESH" or "STALE".
```

> **Important**: After running this column, filter out all rows where `Post Age Check` = "STALE". These are expired signals and should not proceed through the pipeline.

### AI Column: `Pain Signal`

**Prompt**:
```
From {Post Text}, extract the core hiring pain or urgency. Examples: "urgent need for RNs", "scaling clinical team for new facility", "immediate CNA openings".

If no clear pain signal exists, return "No clear pain signal".

Keep the response under 15 words.
```

---

## Step 4 — Filter Qualified Leads

After AI columns have run, filter the table to keep only qualified leads.

**Filter criteria** (ALL must be true — strict US-only targeting):

- `Post Age Check` = "FRESH" (discard anything older than 14 days)
- `Is Healthcare Hiring` = "YES"
- `Is US Based` = "YES" (strict — no "UNCLEAR", no exceptions)
- `Signal Strength` IN ("VERY_HIGH", "HIGH", "MEDIUM")
- `Intent Type` NOT "PASSIVE_CONTENT"
- `Company Type` IN ("STAFFING_AGENCY", "HEALTHCARE_PROVIDER", "RECRUITER_INDEPENDENT") — exclude "OTHER"

Use `filter_table_rows` or create a Meerkats sheet called **"Qualified Leads"** containing only rows that pass ALL filters.

> **Why so strict?** The client targets only US-based healthcare staffing agencies and large healthcare providers actively hiring. Every lead that passes this filter should be a real US healthcare hiring signal from a relevant company type. False positives waste outreach effort and damage sender reputation.

---

## Step 5 — Contact & Company Enrichment (Meerkats AI Columns)

The author data from Apify gives us the person who posted. Now extract additional fields for outreach.

### AI Column: `Contact First Name`

**Prompt**:
```
Extract ONLY the first name from {Author Name}.

Examples:
- "Sarah Johnson" → "Sarah"
- "Dr. Michael Chen" → "Michael"
- "Jennifer Smith-Rodriguez" → "Jennifer"

Return ONLY the first name, nothing else.
```

### AI Column: `Hiring Role`

**Prompt**:
```
From {Post Text}, extract the specific role(s) being hired for. Examples: "RN", "CNA", "LPN", "Clinical Staff", "Nurses".

Return a comma-separated list of roles. If unclear, return "Healthcare Staff".
```

### AI Column: `Role Hint`

**Prompt**:
```
Based on {Author Name}, {Author Company}, and {Author Info}, what is the likely job title/role of this person? Examples: "Recruiter", "TA Head", "Staffing Agency Owner", "HR Director", "Ops Leader".

Return the most likely title in 1-3 words.
```

### AI Column: `Email`

**Prompt**:
```
Check if {Post Text} contains any email address. If yes, extract it. If no, return "NOT_FOUND".
```

### AI Column: `Phone`

**Prompt**:
```
Check if {Post Text} contains any phone number. If yes, extract it in standard format. If no, return "NOT_FOUND".
```

> **Note**: For leads where email is NOT_FOUND, use the `email-find-verify` skill to look up emails using `{Author Name}` and the company domain.

---

## Step 6 — Deduplication

Run deduplication on the qualified leads table to remove duplicate entries. Dedup on `post_url` (same post scraped twice) and `Author Company` (multiple posts from same company).

```
Use mcp tool: check_duplicate_rows
  tableId: {table_id}
  attributeKeys: ["Post URL", "Author Company"]

If duplicates found:
  Use mcp tool: delete_duplicate_rows
    tableId: {table_id}
    attributeKeys: ["Post URL", "Author Company"]
```

---

## Step 7 — Lead Qualification & Prioritization

Apply this qualification logic to determine outreach priority:

| Condition | Action | Priority |
|-----------|--------|----------|
| VERY_HIGH/HIGH signal + STAFFING_AGENCY | Immediate outreach | P1 |
| VERY_HIGH/HIGH signal + HEALTHCARE_PROVIDER | Standard outreach | P2 |
| MEDIUM signal + any company type | Light outreach / nurture | P3 |
| LOW signal | Skip — no outreach | — |

### AI Column: `Outreach Priority`

**Prompt**:
```
Based on signal strength {Signal Strength} and company type {Company Type}, assign an outreach priority:

- P1_IMMEDIATE: Signal is VERY_HIGH or HIGH and company is STAFFING_AGENCY or RECRUITER_INDEPENDENT
- P2_STANDARD: Signal is VERY_HIGH or HIGH and company is HEALTHCARE_PROVIDER
- P3_NURTURE: Signal is MEDIUM
- SKIP: Signal is LOW or company is OTHER

Return ONLY the priority code.
```

---

## Step 8 — CRM Export (HubSpot)

When pushing to HubSpot, use this mapping:

**Company object**:
- `name` ← Author Company
- `industry` ← "Healthcare" or Company Type
- `signal_strength` ← Signal Strength (custom property)

**Contact object**:
- `firstname` ← Contact First Name
- `lastname` ← (extracted from Author Name)
- `linkedin_url` ← Author LinkedIn
- `email` ← Email
- `jobtitle` ← Role Hint

**Deal object**:
- `dealname` ← "Hiring Signal — {Author Company}"
- `hiring_signal` ← Intent Type
- `post_url` ← Post URL
- `pain_signal` ← Pain Signal
- `priority` ← Outreach Priority

> Use the `hubspot-integration` skill for actual CRM push, or export the qualified leads table for manual import.

---

## Step 9 — Email Outreach Sequence

### Target Personas

- Recruiters
- TA Heads
- Staffing agency operators
- Ops leaders in healthcare orgs

### Sequence Overview

| Step | Day | Goal |
|------|-----|------|
| Email 1 | Day 0 | Contextual hook — reference their hiring post |
| Email 2 | Day 2 | Pain amplification — common healthcare hiring struggles |
| Email 3 | Day 4 | Value proposition — how teams are solving this |
| Email 4 | Day 7 | Soft CTA — 15-minute call |
| Email 5 | Day 10 | Breakup — close the loop |

### AI Column: `Email 1 Draft`

**Prompt**:
```
Write a short, personalized cold email (under 100 words) for {Contact First Name} at {Author Company}.

Context: They posted on LinkedIn about hiring {Hiring Role}. Their pain signal is: {Pain Signal}.

Structure:
- Subject line: Reference their hiring post
- Opening: Mention you saw their post about hiring {Hiring Role}
- Middle: Briefly mention you work with healthcare teams facing similar hiring challenges
- Close: Ask if filling these roles fast enough is a challenge

Tone: Casual, peer-to-peer, no hard sell. Sign off with "– {{Your Name}}".
```

### AI Column: `Email 2 Draft`

**Prompt**:
```
Write a follow-up email (under 80 words) for {Contact First Name} about hiring {Hiring Role}.

Theme: Pain amplification. Mention common healthcare hiring struggles:
- Inconsistent candidate quality
- Delays in screening
- Drop-offs before joining

Ask if they are experiencing something similar. Keep it conversational.

Subject line: "Re: hiring {Hiring Role}"
Sign off with "– {{Your Name}}".
```

### AI Column: `Email 3 Draft`

**Prompt**:
```
Write a value-proposition email (under 80 words) for {Contact First Name}.

Theme: How other teams solved healthcare hiring challenges by automating parts of sourcing and screening. Benefits: reduced time-to-hire, improved candidate quality, handling higher volumes.

Offer to share what is working. No hard CTA.

Subject line: "How teams are fixing this"
Sign off with "– {{Your Name}}".
```

### LinkedIn Outreach (Optional)

| Step | Message Strategy |
|------|-----------------|
| Connect | Reference their specific hiring post as connection reason |
| Follow-up | Ask about their hiring challenges and current process |
| CTA | Suggest a short call to compare notes |

---

## Conversion Factors

| Factor | Impact |
|--------|--------|
| Real-time signals (posts < 24h old) | Very high |
| Personalization (referencing their actual post) | Critical |
| Targeting staffing agencies | Multiplier effect (1 contact → many roles) |
| Speed of outreach | Decisive — first responder wins |

---

## Execution Checklist

When running this pipeline, follow these steps in order:

1. **Scrape**: Run Apify LinkedIn Post Scraper with the boolean queries (last 14 days only)
2. **Ingest**: Create Meerkats table and bulk-add Apify results as rows
3. **Classify**: Add AI columns (Intent Type, Signal Strength, Is Healthcare Hiring, Is US Based, Company Type, Post Age Check, Pain Signal) and run them
4. **Filter**: Filter to qualified leads only (FRESH + US-based YES + healthcare YES + STAFFING_AGENCY/HEALTHCARE_PROVIDER/RECRUITER_INDEPENDENT + HIGH/MEDIUM signal)
5. **Enrich**: Add enrichment AI columns (Contact First Name, Hiring Role, Role Hint, Email, Phone) and run them
6. **Deduplicate**: Run dedup on Post URL + Author Company
7. **Qualify**: Add Outreach Priority AI column and run it
8. **Email Lookup**: For leads with no email, use `email-find-verify` skill with Author Name + company domain
9. **Outreach**: Add email draft AI columns and run them
10. **Export**: Push to CRM via `hubspot-integration` skill or export table

## Dependencies on Other Skills

- `email-find-verify` — for finding missing email addresses
- `hubspot-integration` — for CRM push (optional)

## External Tool Dependencies

- **Apify** — LinkedIn Post Scraper actor for signal capture (Step 1). Requires an Apify account and API key.

## Output

After running the full pipeline, deliver:
- Total posts scraped from Apify
- Number of qualified leads (by priority tier)
- Meerkats table link with all enriched data
- Email drafts ready for review
- CRM export summary (if applicable)
