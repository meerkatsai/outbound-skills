---
name: healthcare-hiring-signals-v2
description: "Detects healthcare hiring signals from LinkedIn via Apify boolean search, classifies intent, tags posts as Company Post or Person Post, enriches leads, and generates 5-email outreach sequences. Trigger on 'healthcare hiring signals v2,' 'hiring signal detection,' 'nurse hiring leads,' 'staffing agency pipeline,' 'healthcare staffing leads,' 'LinkedIn hiring scraper,' or 'signal-to-outreach pipeline.' Single-table variant with Poster Type tagging. Replaces Clay-based workflows."
metadata:
  version: 2.1.0
  author: meerkatsai
---

# LinkedIn Job Scraper & Hiring Signal Pipeline (v2 — Single Table)

Scrapes LinkedIn hiring posts via Apify boolean search, classifies hiring intent, tags each post as `COMPANY_POST` or `PERSON_POST`, enriches leads with contact data, and generates 5-email outreach sequences. All data stays in **one Meerkats table** — no split. All processing runs through Meerkats.ai tables and AI columns.

**Key difference from v1**: Instead of splitting into two tables (Individual vs Agency), this version keeps everything in a single table and adds a `Poster Type` AI column to tag each row. Use `filter_table_rows` to segment when needed.

## Objective

- **Target Segment**: US-based healthcare staffing agencies + large healthcare providers actively hiring
- **Goal**: Identify high-intent hiring signals → enrich → push to CRM → trigger outreach
- **Success Metric**: Meetings booked with hiring decision-makers (TA heads, recruiters, ops leaders)

## Pipeline Overview

| Step | Action | Tool | Output |
|------|--------|------|--------|
| 1 | Scrape LinkedIn posts (boolean queries) | Apify | Raw posts (last 14 days) |
| 2 | Classify intent + tag poster type | Meerkats AI column | Intent, signal strength, poster type |
| 3 | Filter qualified leads | Meerkats filter_table_rows | Qualified leads (source table intact) |
| 3b | Split into Person + Company derived tables | Meerkats create_table + add_table_rows_bulk | 2 derived tables; source unchanged |
| 4 | Enrich contact/company data | Meerkats AI column | Email, phone, company domain |
| 5 | Deduplicate | Meerkats dedup tools | Clean dataset |
| 6 | Email lookup + verification | email-find-verify skill | Verified emails |
| 7 | Generate outreach (5 emails) | Meerkats AI column | Email sequences |
| 8 | Push to CRM | hubspot-integration skill | Company + Contact + Deal |

**Reference files**:
- **[Email templates](references/email-templates.md)**: All 5 email draft AI column prompts (Day 0–10 sequence)
- **[Classification tables](references/classification-tables.md)**: Intent types, post types, qualification matrix, conversion factors

---

## Step 1 — Signal Capture (LinkedIn via Apify)

**CRITICAL**: Only fetch posts from the **last 14 days**. Calculate cutoff: `today - 14 days` in ISO format (YYYY-MM-DD). Posts older than 2 weeks are stale — discard them.

All boolean searches run on **LinkedIn** via **Apify LinkedIn Posts Scraper**. Do NOT use generic web search.

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

Set `publishedAfter` to `today - 14 days` ISO string. The exact Apify actor name may vary — use whichever LinkedIn post search actor is available.

### Execution

1. **Run Apify scraper** with the boolean queries and `publishedAfter` date filter.
2. **Extract fields**: `post_url`, `post_text`, `author_name`, `author_linkedin_url`, `author_company`, `post_date`.
3. **Validate recency**: Discard any posts where `post_date` is older than the cutoff.
4. Create a **single** Meerkats table **"Healthcare Hiring Signals — {date}"** with these Input columns:

| Column Name | Data Type | Type |
|-------------|-----------|------|
| Post URL | url | Input |
| Post Text | text | Input |
| Author Name | text | Input |
| Author LinkedIn | url | Input |
| Author Company | text | Input |
| Post Date | date | Input |

---

## Step 2 — Intent Classification + Poster Type Tagging (AI Columns)

Add AI columns to classify each post. See [classification-tables.md](references/classification-tables.md) for intent type reference and post types mapping.

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
Based on the post in {Post Text} and the intent type {Intent Type}, assign a signal strength:

- VERY_HIGH: Urgent requirements, immediate openings, ASAP language
- HIGH: Active hiring posts, multi-role hiring, agency hiring for clients, direct job posts
- MEDIUM: Pipeline building, partnership seeking
- LOW: Thought leadership, generic content, no hiring signal

Return ONLY the strength level.
```

### AI Column: `Poster Type`

**Prompt**:
```
Determine who posted this LinkedIn content based on {Post Text}, {Author Name}, and {Author Company}.

- PERSON_POST: Posted by an individual person (e.g., a recruiter, TA head, HR director, ops leader, hiring manager) sharing their own hiring need or their company's openings. The post reads as a personal update, uses first-person language ("I'm hiring", "we need", "my team"), or comes from someone at a hospital/clinic/health system.
- COMPANY_POST: Posted by or on behalf of a company, staffing agency, or recruitment firm. The post reads as an official company announcement, uses the company name as the author, promotes agency services, or is hiring for multiple clients. Includes posts from staffing agencies, recruitment firms, and independent recruiters posting on behalf of their business.

Return ONLY "PERSON_POST" or "COMPANY_POST".
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

If no clear pain signal exists, return "No clear pain signal". Keep under 15 words.
```

---

## Step 3 — Filter Qualified Leads

**Filter criteria** (applied to the single table):
- `Is Healthcare Hiring` = "YES"
- `Is US Relevant` = "YES" or "UNCLEAR"
- `Signal Strength` IN ("VERY_HIGH", "HIGH", "MEDIUM")
- `Intent Type` NOT "PASSIVE_CONTENT"

Use `filter_table_rows` to apply filters. Optionally create a Meerkats sheet **"Qualified Leads"** for the filtered view.

---

## Step 3b — Split into Two Derived Tables (by Poster Type)

**The source table remains intact.** After the `Poster Type` AI column has run on all rows, create two additional Meerkats tables by copying rows from the source table. The source table is never modified or deleted.

**Table 1 — "Person Hiring Signals — {date}"**:
- Filter source table: `Poster Type` = `PERSON_POST`
- Represents individual recruiters, TA heads, HR directors, ops leaders posting their own hiring needs
- Use for personalized 1:1 outreach

**Table 2 — "Company Hiring Signals — {date}"**:
- Filter source table: `Poster Type` = `COMPANY_POST`
- Represents staffing agencies, recruitment firms, companies posting on behalf of their business
- Use for partnership-oriented outreach

**Execution**:
1. Run `filter_table_rows` on the source table with `Poster Type` = `PERSON_POST` → capture rows
2. `create_table` named **"Person Hiring Signals — {date}"** with the same columns as the source table
3. `add_table_rows_bulk` — copy the filtered rows into the new table
4. Repeat for `Poster Type` = `COMPANY_POST` → create **"Company Hiring Signals — {date}"**
5. Confirm source table still has all original rows (no deletions)

All subsequent enrichment, dedup, email lookup, and outreach steps run on **all three tables** — the source table plus both derived tables — or on the derived tables only, depending on your workflow preference.

---

## Step 4 — Contact & Company Enrichment (AI Columns)

### AI Column: `Contact Name`
**Prompt**: `Extract the full name of the person who posted from {Author Name}. Return just the name.`

### AI Column: `Hiring Role`
**Prompt**: `From {Post Text}, extract the specific role(s) being hired for. Return a comma-separated list (e.g., "RN, CNA"). If unclear, return "Healthcare Staff".`

### AI Column: `Role Hint`
**Prompt**: `Based on {Author Name}, {Author Company}, and {Post Text}, what is the likely job title of the poster? Return 1-3 words (e.g., "Recruiter", "TA Head", "Staffing Agency Owner").`

### AI Column: `Phone`
**Prompt**: `Check if {Post Text} contains any phone number. If yes, extract it in standard format (e.g., "+1-555-123-4567"). If not found, return "NOT_FOUND".`

### AI Column: `First Name`
**Prompt**: `Extract ONLY the first name from {Author Name}. Return just the first name.`

### AI Column: `Last Name`
**Prompt**: `Extract ONLY the last name from {Author Name}. Return just the last name.`

### AI Column: `Company Domain`
**Prompt**: `Based on {Author Company}, determine the most likely company website domain (e.g., "Acme Health" → "acmehealth.com"). Return ONLY the domain. If unsure, return "UNKNOWN".`

### AI Column: `Email (from post)`
**Prompt**: `Check if {Post Text} contains any email address. If yes, extract it. If no, return "NOT_FOUND".`

---

## Step 4b — Email Lookup for Missing Emails

Find emails for leads where `Email (from post)` = "NOT_FOUND".

1. Filter rows where `Email (from post)` = "NOT_FOUND" AND `Company Domain` ≠ "UNKNOWN".
2. Call `email-find-verify` skill with `First Name` + `Last Name` + `Company Domain`. Supports multiple providers — use whichever the user prefers. Do not hardcode a provider.
3. Write found email to `Verified Email` column via `update_table_row`.
4. Verify deliverability. Write status to `Email Status` column.
5. For leads where `Company Domain` = "UNKNOWN": use `Author LinkedIn` URL with a provider that supports LinkedIn URL lookup.

**Email precedence**: (1) Post-extracted email → verify → use as `Verified Email`. (2) Lookup email from provider. (3) If both empty → `Email Status` = "NO_EMAIL_FOUND", skip outreach.

---

## Step 5 — Deduplication

Run `check_duplicate_rows` then `delete_duplicate_rows` using `attributeKeys: ["Post URL", "Author Company"]`.

---

## Step 6 — Lead Qualification & Prioritization

See [classification-tables.md](references/classification-tables.md) for the full qualification matrix.

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

## Step 7 — CRM Export

CRM mapping (HubSpot or other): **Company** → name, industry, signal_strength | **Contact** → name, linkedin_url, Verified Email, Role Hint | **Deal** → "Hiring Signal — {Company}", Intent Type, Post URL, Pain Signal, Outreach Priority, Poster Type. Use `hubspot-integration` skill or export table.

---

## Step 8 — Email Outreach Sequence

**Target Personas**: Recruiters, TA Heads, Staffing agency operators, Ops leaders

| Step | Day | Goal | Subject Line |
|------|-----|------|-------------|
| Email 1 | Day 0 | Contextual hook | "Saw your hiring post – quick question" |
| Email 2 | Day 2 | Pain amplification | "Re: hiring {Hiring Role}" |
| Email 3 | Day 4 | Value proposition | "How teams are fixing this" |
| Email 4 | Day 7 | Soft CTA | "Worth exploring?" |
| Email 5 | Day 10 | Breakup | "Should I close this?" |

**Full AI column prompts for all 5 emails**: See [email-templates.md](references/email-templates.md)

Only generate drafts for rows where `Email Status` is "VERIFIED" or "LIKELY_VALID".

### LinkedIn Outreach (Optional)

| Step | Message Strategy |
|------|-----------------|
| Connect | Reference their specific hiring post as connection reason |
| Follow-up | Ask about their hiring challenges and current process |
| CTA | Suggest a short call to compare notes |

---

## Execution Checklist

1. **Search**: Run boolean queries on LinkedIn via Apify — only posts from last 14 days
2. **Ingest**: Create single Meerkats source table and bulk-add raw post data
3. **Classify + Tag**: Add AI columns (Intent Type, Signal Strength, **Poster Type**, Is Healthcare Hiring, Is US Relevant, Company Type, Pain Signal) and run them
4. **Filter**: Filter to qualified leads (HIGH/MEDIUM signal, healthcare, US-relevant)
5. **Split**: Create **"Person Hiring Signals"** and **"Company Hiring Signals"** derived tables from source by `Poster Type`. Source table stays intact.
6. **Enrich**: Add enrichment AI columns (First/Last Name, Company Domain, Hiring Role, Role Hint, Phone, Email from post) — on all tables
7. **Dedup**: Run dedup on Post URL + Author Company — on all tables
8. **Qualify**: Add Outreach Priority AI column — on all tables
9. **Email Lookup**: Call `email-find-verify` for missing emails. Write to Verified Email + Email Status.
10. **Outreach**: Add all 5 email draft AI columns — only for verified emails. See [email-templates.md](references/email-templates.md)
11. **Export**: Push to CRM or export tables

## Dependencies

- `apify` — Apify LinkedIn Posts Scraper (primary data source)
- `email-find-verify` — email lookup and verification (provider-agnostic)
- `hubspot-integration` — CRM push (optional)

## Output

- Total posts scraped (all within last 14 days)
- Qualified leads count by priority (P1/P2/P3) and by poster type (PERSON_POST / COMPANY_POST)
- 3 Meerkats tables: source table (all rows) + "Person Hiring Signals" + "Company Hiring Signals"
- Email drafts (1–5) for each lead with verified email
- CRM export summary (if applicable)
