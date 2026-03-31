---
name: linkedin-job-scraper
description: "Use when the user wants to scrape LinkedIn job posts or hiring signals, extract hiring data, classify intent, enrich leads, and build an outreach pipeline. Trigger on phrases like 'scrape LinkedIn jobs,' 'LinkedIn job scraper,' 'LinkedIn hiring posts,' 'scrape hiring signals,' 'LinkedIn job data,' 'extract LinkedIn jobs,' 'nurse hiring leads,' 'staffing agency leads,' 'healthcare staffing pipeline,' or 'hiring intent detection.' Covers the full workflow: LinkedIn job post scraping via web search, AI-powered intent classification, lead enrichment, deduplication, CRM export, and outreach sequence generation."
metadata:
  version: 1.0.0
  author: meerkatsai
---

# LinkedIn Job Scraper & Hiring Signal Pipeline

You are an expert in scraping LinkedIn job posts and hiring signals, classifying intent, enriching leads, and converting them into outreach-ready pipeline entries. All processing runs through Meerkats.ai tables and AI columns — no Clay dependency.

## Objective

- **Target Segment**: US-based healthcare staffing agencies + large healthcare providers actively hiring
- **Goal**: Identify high-intent hiring signals → enrich → push to CRM → trigger outreach
- **Success Metric**: Meetings booked with hiring decision-makers (TA heads, recruiters, ops leaders)

## When to Use This Skill

- Detecting healthcare hiring signals from LinkedIn or web sources
- Classifying hiring intent from scraped posts
- Enriching healthcare leads with contact and company data
- Building qualified lead lists for healthcare staffing outreach
- Generating personalized email sequences for hiring decision-makers
- Running the end-to-end signal-to-outreach pipeline

## Pipeline Overview

| Step | Action | Meerkats Tool | Output |
|------|--------|---------------|--------|
| 1 | Search for hiring posts (boolean queries on LinkedIn via Apify) | Apify LinkedIn scraper + Meerkats table (Input columns) | Raw posts (last 14 days only) |
| 2 | Classify hiring intent | Meerkats AI column | Intent type + signal strength |
| 3 | Filter high-quality leads | Meerkats filter_table_rows | Qualified leads |
| 4 | Extract contact/company data | Meerkats AI column | Email, company, phone |
| 5 | Deduplicate | Meerkats check_duplicate_rows / delete_duplicate_rows | Clean dataset |
| 6 | Push to CRM | HubSpot integration skill or export | Company + Contact + Deal |
| 7 | Generate outreach | Meerkats AI column or outreach-crafter skill | Email sequences |

---

## Step 1 — Signal Capture (LinkedIn via Apify)

### Recency Requirement

**CRITICAL**: Only fetch LinkedIn posts from the last 14 days (2 weeks). This ensures signals are fresh and actionable.

Before running any search:
1. Calculate the cutoff date: **today's date minus 14 days** (e.g., if today is 2026-03-31, the cutoff is 2026-03-17).
2. Pass this cutoff date to the Apify scraper's date filter parameter.
3. After ingestion, **discard any rows** where `Post Date` is older than the cutoff date as a safety check.

Posts older than 2 weeks are stale — the hiring need has likely been filled or the decision-maker has moved on. Do not include them.

### Search Platform

All boolean searches run on **LinkedIn** using the **Apify LinkedIn Posts Scraper** (actor: `apify/linkedin-post-search-scraper` or equivalent Apify LinkedIn actor). Do NOT use generic web search for this step — LinkedIn is the source of truth for hiring signal posts.

### Apify Scraper Configuration

When calling the Apify LinkedIn scraper, use these parameters:

```json
{
  "searchQueries": [
    "(\"we are hiring\" OR \"now hiring\" OR \"urgent hiring\") AND (nurse OR RN OR CNA OR LPN OR caregiver OR \"patient care\")",
    "(\"hiring RN\" OR \"hiring CNA\" OR \"hiring nurses\") AND (hospital OR clinic OR healthcare)",
    "(\"#hiring\" OR \"#nowhiring\") AND (nurse OR healthcare OR RN)",
    "(\"looking for nurses\" OR \"need nurses urgently\")",
    "(\"healthcare staffing\" OR \"nurse staffing\") AND (hiring OR recruiting)"
  ],
  "maxResults": 100,
  "publishedAfter": "{cutoff_date_ISO}"
}
```

> **`publishedAfter`**: Set this to the ISO date string for **today minus 14 days**. For example, if today is `2026-03-31`, set `publishedAfter` to `2026-03-17`. This is the primary recency filter — it tells Apify to only return posts published within the last 2 weeks.

> **Note on Apify actor**: The exact actor name and parameter names may vary. Check the Apify marketplace for the latest LinkedIn post search actor. The key parameters to set are: (1) the boolean search queries, (2) maximum results, and (3) a date filter to restrict results to the last 14 days. Common actors include `curious_coder/linkedin-post-search-scraper`, `apify/linkedin-scraper`, or similar.

### Keyword Strategy

These boolean queries are used as `searchQueries` in the Apify LinkedIn scraper.

**Core Hiring Keywords**:

| Category | Keywords |
|----------|----------|
| Direct Hiring | "we are hiring", "now hiring", "hiring RN", "hiring nurses" |
| Urgency | "urgent hiring", "immediate joiners", "ASAP hiring" |
| Roles | RN, CNA, LPN, GNA, PCA, caregiver, clinical staff |
| Healthcare Context | hospital hiring, clinic hiring, patient care jobs |
| Hashtags | #hiring #nowhiring #nursejobs #healthcarejobs |

**High-Intent Boolean Queries** (pass these as `searchQueries` to Apify):

```
("we are hiring" OR "now hiring" OR "urgent hiring") AND (nurse OR RN OR CNA OR LPN OR caregiver OR "patient care")
("hiring RN" OR "hiring CNA" OR "hiring nurses") AND (hospital OR clinic OR healthcare)
("#hiring" OR "#nowhiring") AND (nurse OR healthcare OR RN)
("looking for nurses" OR "need nurses urgently")
("healthcare staffing" OR "nurse staffing") AND (hiring OR recruiting)
```

### Execution

1. **Calculate cutoff date**: Compute `today - 14 days` in ISO format (YYYY-MM-DD). This is your `publishedAfter` value.
2. **Run Apify LinkedIn scraper**: Execute the Apify actor with the boolean queries above and the `publishedAfter` date filter set to the cutoff date. This searches LinkedIn posts directly — not generic web results.
3. **Extract fields from Apify results**: For each post returned, extract: `post_url`, `post_text`, `author_name`, `author_linkedin_url`, `author_company`, `post_date`.
4. **Validate recency**: Before ingesting, double-check that each post's `post_date` is within the last 14 days. Discard any that are older.
5. Create a Meerkats table called **"Healthcare Hiring Signals"** with Input columns for the raw fields.

**Create table command**:

```
Use mcp tool: create_table
  name: "Healthcare Hiring Signals — {date}"
  columns: (add after creation via add_table_column)
```

**Input columns to add**:

| Column Name | Data Type | Type |
|-------------|-----------|------|
| Post URL | url | Input |
| Post Text | text | Input |
| Author Name | text | Input |
| Author LinkedIn | url | Input |
| Author Company | text | Input |
| Post Date | date | Input |

---

## Step 2 — Intent Classification (AI Columns)

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

### AI Column: `Is US Relevant`

**Prompt**:
```
Based on {Post Text} and {Author Company}, does this post appear to be about US-based hiring? Look for US state names, US cities, or US-based companies.

Return "YES", "NO", or "UNCLEAR".
```

### AI Column: `Company Type`

**Prompt**:
```
Based on {Post Text} and {Author Company}, classify the company type:

- STAFFING_AGENCY: Healthcare staffing or recruitment agency
- HEALTHCARE_PROVIDER: Hospital, clinic, health system, care facility
- RECRUITER_INDEPENDENT: Independent recruiter or talent consultant
- OTHER: Not clearly healthcare staffing related

Return ONLY the category name.
```

### AI Column: `Pain Signal`

**Prompt**:
```
From {Post Text}, extract the core hiring pain or urgency. Examples: "urgent need for RNs", "scaling clinical team for new facility", "immediate CNA openings".

If no clear pain signal exists, return "No clear pain signal".

Keep the response under 15 words.
```

---

## Step 3 — Filter Qualified Leads

After AI columns have run, filter the table to keep only qualified leads.

**Filter criteria**:
- `Is Healthcare Hiring` = "YES"
- `Is US Relevant` = "YES" or "UNCLEAR"
- `Signal Strength` IN ("VERY_HIGH", "HIGH", "MEDIUM")
- `Intent Type` NOT "PASSIVE_CONTENT"

Use `filter_table_rows` or create a Meerkats sheet called **"Qualified Leads"** containing only rows that pass the filter.

---

## Step 4 — Contact & Company Enrichment (AI Columns)

Add AI columns to the qualified leads sheet for enrichment.

### AI Column: `Contact Name`

**Prompt**: `Extract the full name of the person who posted from {Author Name}. Return just the name.`

### AI Column: `Hiring Role`

**Prompt**:
```
From {Post Text}, extract the specific role(s) being hired for. Examples: "RN", "CNA", "LPN", "Clinical Staff", "Nurses".

Return a comma-separated list of roles. If unclear, return "Healthcare Staff".
```

### AI Column: `Role Hint`

**Prompt**:
```
Based on {Author Name} and {Author Company} and {Post Text}, what is the likely job title of the person posting? Examples: "Recruiter", "TA Head", "Staffing Agency Owner", "HR Director", "Ops Leader".

Return the most likely title in 1-3 words.
```

### AI Column: `First Name`

**Prompt**:
```
Extract ONLY the first name from {Author Name}. Return just the first name, nothing else.
```

### AI Column: `Last Name`

**Prompt**:
```
Extract ONLY the last name from {Author Name}. Return just the last name, nothing else.
```

### AI Column: `Company Domain`

**Prompt**:
```
Based on {Author Company}, determine the most likely company website domain (e.g., "Acme Health" → "acmehealth.com", "Johns Hopkins Hospital" → "hopkinsmedicine.org").

If you can confidently determine the domain, return ONLY the domain (no https://, no trailing slash). If unsure, return "UNKNOWN".
```

### AI Column: `Email (from post)`

**Prompt**:
```
Check if {Post Text} contains any email address. If yes, extract it. If no, return "NOT_FOUND".
```

### Step 4b — Email Lookup for Missing Emails

After the enrichment AI columns have run, you must find emails for leads where `Email (from post)` is `NOT_FOUND`. This is the most critical enrichment step — without a verified email, the lead cannot be contacted.

**Process**:

1. **Filter leads needing email lookup**: Use `filter_table_rows` to find rows where `Email (from post)` = "NOT_FOUND" AND `Company Domain` ≠ "UNKNOWN".
2. **For each lead**, call the `email-find-verify` skill with these inputs:
   - `--firstname` ← value from `First Name` column
   - `--lastname` ← value from `Last Name` column
   - `--domain` ← value from `Company Domain` column
3. **Write the found email back** to the row using `update_table_row`, setting a new column `Verified Email`.
4. **Verify the email**: After finding, run the verification step from `email-find-verify` to confirm deliverability. Write the verification status to a `Email Status` column.
5. **For leads where `Company Domain` is "UNKNOWN"**: Try using the `Author LinkedIn` URL with a tool like `apollo` or `rocketreach` that supports LinkedIn URL lookup instead of domain-based search.

**Add these Input columns** for storing email lookup results:

| Column Name | Data Type | Type |
|-------------|-----------|------|
| Verified Email | text | Input |
| Email Status | text | Input |

**Email mapping rule**: The `Verified Email` column is the authoritative email for outreach. Use this precedence:
1. If `Email (from post)` has a valid email → use it as `Verified Email` (still verify it)
2. If `Email (from post)` is `NOT_FOUND` → use the email returned by `email-find-verify`
3. If both are empty → mark `Email Status` as "NO_EMAIL_FOUND" and skip outreach for this lead

**Only generate outreach email drafts (Step 8) for rows where `Email Status` is "VERIFIED" or "LIKELY_VALID".** Do not draft emails for leads with no verified email.

---

## Step 5 — Deduplication

Run deduplication on the qualified leads table to remove duplicate entries.

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

## Step 6 — Lead Qualification & Prioritization

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

## Step 7 — CRM Export Structure

When pushing to CRM (HubSpot or other), use this mapping:

**Company object**:
- `name` ← Author Company
- `industry` ← "Healthcare" or Company Type
- `signal_strength` ← Signal Strength (custom property)

**Contact object**:
- `name` ← Contact Name
- `linkedin_url` ← Author LinkedIn
- `email` ← Verified Email
- `role` ← Role Hint

**Deal object**:
- `deal_name` ← "Hiring Signal — {Author Company}"
- `hiring_signal` ← Intent Type
- `post_url` ← Post URL
- `pain_signal` ← Pain Signal
- `priority` ← Outreach Priority

> Use the `hubspot-integration` skill for actual CRM push, or export the qualified leads table for manual import.

---

## Step 8 — Email Outreach Sequence

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
Write a short, personalized cold email (under 100 words) for {Contact Name} at {Author Company}.

Context: They posted about hiring {Hiring Role} on LinkedIn. Their pain signal is: {Pain Signal}.

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
Write a follow-up email (under 80 words) for {Contact Name} about hiring {Hiring Role}.

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
Write a value-proposition email (under 80 words) for {Contact Name}.

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
| Fresh signals (posts < 14 days old, sourced via Apify) | Very high |
| Personalization (referencing their actual post) | Critical |
| Targeting staffing agencies | Multiplier effect (1 contact → many roles) |
| Speed of outreach | Decisive — first responder wins |

---

## Execution Checklist

When running this pipeline, follow these steps in order:

1. **Search**: Run boolean queries on LinkedIn via Apify scraper — only fetch posts from the last 14 days (set `publishedAfter` to today minus 14 days)
2. **Ingest**: Create Meerkats table and bulk-add raw post data as rows
3. **Classify**: Add AI columns (Intent Type, Signal Strength, Is Healthcare Hiring, Is US Relevant, Company Type, Pain Signal) and run them
4. **Filter**: Filter to qualified leads only (HIGH/MEDIUM signal, healthcare, US-relevant)
5. **Enrich**: Add enrichment AI columns (First Name, Last Name, Company Domain, Hiring Role, Role Hint, Email from post) and run them
6. **Deduplicate**: Run dedup on Post URL + Author Company
7. **Qualify**: Add Outreach Priority AI column and run it
8. **Email Lookup**: For leads where `Email (from post)` is NOT_FOUND, call `email-find-verify` skill with First Name + Last Name + Company Domain. Write results to `Verified Email` and `Email Status` columns. Verify all found emails for deliverability.
9. **Email Mapping**: Set `Verified Email` for all rows — use post-extracted email if available (verify it too), otherwise use lookup result. Mark rows with no email as NO_EMAIL_FOUND.
10. **Outreach**: Add email draft AI columns and run them — **only for rows where Email Status is VERIFIED or LIKELY_VALID**
10. **Export**: Push to CRM via `hubspot-integration` skill or export table

## Dependencies on Other Skills

- `apify` — Apify LinkedIn Posts Scraper for running boolean search queries on LinkedIn (primary data source)
- `email-find-verify` — for finding missing email addresses
- `hubspot-integration` — for CRM push (optional)

## Output

After running the full pipeline, deliver:
- Total posts scraped
- Number of qualified leads (by priority tier)
- Meerkats table link with all enriched data
- Email drafts ready for review
- CRM export summary (if applicable)
