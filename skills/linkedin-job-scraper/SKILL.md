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

**CRITICAL**: Only fetch posts from the **last 14 days**. Calculate cutoff: `today - 14 days` in ISO format (YYYY-MM-DD). Posts older than 2 weeks are stale — discard them.

### Search Platform & Configuration

All boolean searches run on **LinkedIn** via **Apify LinkedIn Posts Scraper**. Do NOT use generic web search — LinkedIn is the source of truth.

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

Set `publishedAfter` to `today - 14 days` ISO string. The exact Apify actor name may vary — use whichever LinkedIn post search actor is available (e.g., `curious_coder/linkedin-post-search-scraper`, `apify/linkedin-scraper`).

### Execution

1. **Run Apify LinkedIn scraper** with the boolean queries and `publishedAfter` date filter.
2. **Extract fields**: `post_url`, `post_text`, `author_name`, `author_linkedin_url`, `author_company`, `post_date`.
3. **Validate recency**: Discard any posts where `post_date` is older than the cutoff.
4. Create a Meerkats table called **"Healthcare Hiring Signals"** with Input columns.

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

### Intent Type Reference

Use this mapping to understand intent types, their priority, and why they matter for conversion:

| Intent Type | Description | Priority | Why It Matters |
|-------------|-------------|----------|----------------|
| URGENT_HIRING | Urgently hiring nurses / immediate joiners | HIGH | Strong pain — fastest conversion |
| ACTIVE_HIRING | "We are hiring" RN / CNA / staff | HIGH | Direct demand |
| EXPANSION_HIRING | Expanding teams / new facility hiring | HIGH | Scale-driven demand |
| AGENCY_HIRING | Recruiters hiring for clients | HIGH | Multipliers (1 contact → many roles) |
| PIPELINE_BUILDING | Looking to partner / build talent pipeline | MEDIUM | Slightly longer cycle |
| PASSIVE_CONTENT | Thought leadership / generic | LOW | No immediate value |

### Post Types Reference

Use this table to map post patterns to signal strength during classification:

| Post Type | Example Pattern | Signal Strength |
|-----------|----------------|-----------------|
| Direct job post | "We are hiring RNs in Texas" | HIGH |
| Recruiter post | "Hiring nurses for multiple hospitals" | HIGH |
| Urgent requirement | "Immediate openings for CNAs" | VERY_HIGH |
| Multi-role hiring | "Hiring across clinical roles" | HIGH |
| Pipeline/collab | "Looking to partner for healthcare staffing" | MEDIUM |
| Content/insight | "Healthcare staffing trends" | LOW |

### AI Column: `Intent Type`

**Prompt**:
```
Analyze the LinkedIn post text in {Post Text} and classify the hiring intent into exactly one of these categories:

- URGENT_HIRING: Post mentions urgently hiring nurses, immediate joiners, ASAP hiring (Priority: HIGH — strong pain, fastest conversion)
- ACTIVE_HIRING: Post says "we are hiring" RN/CNA/staff — direct demand (Priority: HIGH)
- EXPANSION_HIRING: Post mentions expanding teams, new facility hiring, scaling (Priority: HIGH — scale-driven demand)
- AGENCY_HIRING: Recruiter or staffing agency hiring for clients (Priority: HIGH — multiplier, 1 contact → many roles)
- PIPELINE_BUILDING: Looking to partner, build talent pipeline — longer cycle (Priority: MEDIUM)
- PASSIVE_CONTENT: Thought leadership, generic healthcare content — no hiring signal (Priority: LOW)

Return ONLY the category name, nothing else.
```

### AI Column: `Signal Strength`

**Prompt**:
```
Based on the post in {Post Text} and the intent type {Intent Type}, assign a signal strength using these rules:

- VERY_HIGH: Urgent requirements, immediate openings, ASAP language (e.g., "Immediate openings for CNAs")
- HIGH: Active hiring posts, multi-role hiring, agency hiring for clients, direct job posts, recruiter posts (e.g., "We are hiring RNs in Texas", "Hiring nurses for multiple hospitals")
- MEDIUM: Pipeline building, partnership seeking (e.g., "Looking to partner for healthcare staffing")
- LOW: Thought leadership, generic content, no hiring signal (e.g., "Healthcare staffing trends")

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

Use `filter_table_rows` to apply these filters on the main table.

---

## Step 3b — Split into Two Tables (Individuals vs Agencies/Companies)

After filtering, **split data into two separate Meerkats tables** using the `Company Type` column. Outreach strategy, messaging tone, and deal value differ between these segments.

**Table 1 — "Individual Hiring Signals — {date}"**:
- `Company Type` = `HEALTHCARE_PROVIDER` or `OTHER`
- Direct hiring need, shorter sales cycle, personalized 1:1 outreach

**Table 2 — "Agency Hiring Signals — {date}"**:
- `Company Type` = `STAFFING_AGENCY` or `RECRUITER_INDEPENDENT`
- Multiplier effect (1 contact → many roles), partnership-oriented outreach

**Execution**:
1. Create both tables via `create_table`
2. Use `filter_table_rows` on the main table by `Company Type` → copy matching rows to the appropriate table via `add_table_rows_bulk`
3. All subsequent steps (enrichment, email lookup, outreach) run on **both tables independently**. Report counts per table.

---

## Step 4 — Contact & Company Enrichment (AI Columns)

Add AI columns to **both** the Individual and Agency tables for enrichment. The columns below apply to both tables.

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

### AI Column: `Phone`

**Prompt**:
```
Check if {Post Text} contains any phone number or contact number. If yes, extract it in standard format (e.g., "+1-555-123-4567"). If no phone number is found, return "NOT_FOUND".
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

Find emails for leads where `Email (from post)` = "NOT_FOUND". Without a verified email, the lead cannot be contacted.

**Process**:
1. Filter rows where `Email (from post)` = "NOT_FOUND" AND `Company Domain` ≠ "UNKNOWN".
2. Call `email-find-verify` skill with `First Name` + `Last Name` + `Company Domain`. The skill supports multiple providers (icypeas, findymail, prospeo, rocketreach, hunter, apollo, etc.) — use whichever the user prefers. Do not hardcode a provider.
3. Write found email to `Verified Email` column via `update_table_row`.
4. Verify deliverability using `email-find-verify` verification step (or neverbounce, millionverifier). Write status to `Email Status` column.
5. For leads where `Company Domain` = "UNKNOWN": use `Author LinkedIn` URL with a provider that supports LinkedIn URL lookup.

**Additional Input columns** for email results: `Verified Email` (text), `Email Status` (text).

**Email precedence**: (1) Post-extracted email → verify → use as `Verified Email`. (2) Lookup email from provider. (3) If both empty → `Email Status` = "NO_EMAIL_FOUND", skip outreach.

**Only generate outreach drafts for rows where `Email Status` is "VERIFIED" or "LIKELY_VALID".**

---

## Step 5 — Deduplication

Run `check_duplicate_rows` then `delete_duplicate_rows` on both tables using `attributeKeys: ["Post URL", "Author Company"]`.

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

CRM mapping (HubSpot or other): **Company** → name, industry, signal_strength | **Contact** → name, linkedin_url, Verified Email, Role Hint | **Deal** → "Hiring Signal — {Company}", Intent Type, Post URL, Pain Signal, Outreach Priority. Use `hubspot-integration` skill or export tables.

---

## Step 8 — Email Outreach Sequence

**Target Personas**: Recruiters, TA Heads, Staffing agency operators, Ops leaders in healthcare orgs

| Step | Day | Goal |
|------|-----|------|
| Email 1 | Day 0 | Contextual hook — reference their hiring post |
| Email 2 | Day 2 | Pain amplification — healthcare hiring struggles |
| Email 3 | Day 4 | Value proposition — how teams are solving this |
| Email 4 | Day 7 | Soft CTA — 15-minute call |
| Email 5 | Day 10 | Breakup — close the loop |

### AI Column: `Email 1 Draft` — Contextual Hook (Day 0)

**Prompt**:
```
Write a short, personalized cold email (under 100 words) for {First Name} at {Author Company}.

Context: They posted about hiring {Hiring Role} on LinkedIn. Their pain signal is: {Pain Signal}.

Subject line: "Saw your hiring post – quick question"

Structure:
- Open with: "Came across your post about hiring {Hiring Role} — looks like you're actively scaling your team."
- Middle: Mention you've been working with healthcare teams facing similar hiring spikes, especially for roles like {Hiring Role}, where speed and quality both matter.
- Close with a question: "Are you currently able to fill these roles fast enough, or is it becoming a bottleneck?"

Tone: Casual, peer-to-peer, no hard sell. Sign off with "– {{Your Name}}".
```

### AI Column: `Email 2 Draft` — Pain Amplification (Day 2)

**Prompt**:
```
Write a follow-up email (under 80 words) for {First Name} about hiring {Hiring Role}.

Subject line: "Re: hiring {Hiring Role}"

Structure:
- Open with: "Following up — one pattern we're seeing across healthcare hiring:"
- Middle: "Even when demand is high, teams struggle with:" then list these three pain points:
  • Inconsistent candidate quality
  • Delays in screening
  • Drop-offs before joining
- Add: "This usually slows down hiring much more than expected."
- Close: "Are you seeing something similar on your end?"

Tone: Conversational, empathetic. Sign off with "– {{Your Name}}".
```

### AI Column: `Email 3 Draft` — Value Proposition (Day 4)

**Prompt**:
```
Write a value-proposition email (under 80 words) for {First Name}.

Subject line: "How teams are fixing this"

Structure:
- Open with: "Some teams we work with solved this by automating parts of sourcing + screening, while keeping control on final decisions."
- Middle: "This helped them:" then list:
  • Reduce time-to-hire significantly
  • Improve candidate quality
  • Handle higher volumes without scaling recruiters
- Close: "Happy to share what's working if relevant."

Tone: Helpful, no hard CTA. Sign off with "– {{Your Name}}".
```

### AI Column: `Email 4 Draft` — Soft CTA (Day 7)

**Prompt**:
```
Write a short soft-CTA email (under 60 words) for {First Name}.

Subject line: "Worth exploring?"

Structure:
- Open with: "If hiring demand is still high on your side, this might be worth a quick discussion."
- Close with: "Would it make sense to compare notes for 15 mins this week?"

Tone: Low-pressure, brief, respectful of their time. Sign off with "– {{Your Name}}".
```

### AI Column: `Email 5 Draft` — Breakup (Day 10)

**Prompt**:
```
Write a short breakup email (under 60 words) for {First Name}.

Subject line: "Should I close this?"

Structure:
- Open with: "Not sure if this is relevant right now."
- Middle: "If hiring is already under control, I'll close this out."
- Close: "If not, happy to reconnect later when it becomes a priority."

Tone: Graceful exit, no guilt. Sign off with "– {{Your Name}}".
```

### LinkedIn Outreach (Optional but Recommended)

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
5. **Split Tables**: Create two separate Meerkats tables — "Individual Hiring Signals" (HEALTHCARE_PROVIDER, OTHER) and "Agency Hiring Signals" (STAFFING_AGENCY, RECRUITER_INDEPENDENT). Copy filtered rows into the appropriate table based on Company Type.
6. **Enrich** (both tables): Add enrichment AI columns (First Name, Last Name, Company Domain, Hiring Role, Role Hint, Phone, Email from post) and run them
7. **Deduplicate** (both tables): Run dedup on Post URL + Author Company
8. **Qualify** (both tables): Add Outreach Priority AI column and run it
9. **Email Lookup** (both tables): For leads where `Email (from post)` is NOT_FOUND, call `email-find-verify` skill with First Name + Last Name + Company Domain. Use whichever email data provider the user has configured. Write results to `Verified Email` and `Email Status` columns. Verify all found emails for deliverability.
10. **Email Mapping** (both tables): Set `Verified Email` for all rows — use post-extracted email if available (verify it too), otherwise use lookup result. Mark rows with no email as NO_EMAIL_FOUND.
11. **Outreach** (both tables): Add all 5 email draft AI columns (Email 1–5) and run them — **only for rows where Email Status is VERIFIED or LIKELY_VALID**
12. **Export**: Push to CRM via `hubspot-integration` skill or export both tables

## Dependencies on Other Skills

- `apify` — Apify LinkedIn Posts Scraper for running boolean search queries on LinkedIn (primary data source)
- `email-find-verify` — for finding and verifying email addresses (supports multiple providers: icypeas, findymail, prospeo, rocketreach, hunter, apollo, neverbounce, millionverifier — use whichever the user prefers)
- `hubspot-integration` — for CRM push (optional)

## Output

After running the full pipeline, deliver:
- Total posts scraped (with recency: all within last 14 days)
- Number of qualified leads split by table:
  - **Individual Hiring Signals**: count by priority tier (P1/P2/P3)
  - **Agency Hiring Signals**: count by priority tier (P1/P2/P3)
- Meerkats table links for both tables with all enriched data
- Email drafts ready for review (Emails 1–5 for each qualified lead with verified email)
- CRM export summary (if applicable)
