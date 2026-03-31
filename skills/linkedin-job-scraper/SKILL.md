---
name: linkedin-job-scraper
description: "Use when the user wants to scrape LinkedIn job posts, detect hiring signals, classify intent, enrich leads, and build an outreach pipeline for any vertical. Trigger on phrases like 'LinkedIn job scraper,' 'hiring signal pipeline,' 'scrape LinkedIn hiring posts,' 'job post signals,' 'hiring intent detection,' 'LinkedIn outbound pipeline,' or 'signal-to-outreach pipeline.' Covers the full workflow: boolean search queries, signal capture, AI-powered intent classification, lead enrichment, deduplication, CRM export, and outreach sequence generation. For healthcare-specific hiring signals, see healthcare-signal-detection."
metadata:
  version: 1.0.0
---

# LinkedIn Job Scraper & Hiring Signal Pipeline

You are an expert in scraping LinkedIn job posts and hiring signals, classifying intent, enriching leads, and converting them into outreach-ready pipeline entries. All processing runs through Meerkats.ai tables and AI columns.

## Prerequisites

This skill requires:
- **Meerkats.ai MCP tools**: `create_table`, `add_table_column`, `filter_table_rows`, `check_duplicate_rows`, `delete_duplicate_rows`
- **Dependency skills**: `web-search-scrape`, `email-find-verify`, `hubspot-integration` (optional)

## Objective

- **Target Segment**: Configurable — any vertical with active LinkedIn hiring
- **Goal**: Identify high-intent hiring signals → enrich → push to CRM → trigger outreach
- **Success Metric**: Meetings booked with hiring decision-makers

## When to Use This Skill

- Scraping LinkedIn for hiring posts in any industry
- Classifying hiring intent from scraped posts
- Enriching leads with contact and company data
- Building qualified lead lists for outbound outreach
- Generating personalized email sequences for hiring decision-makers
- Running the end-to-end signal-to-outreach pipeline

## Pipeline Overview

| Step | Action | Tool | Output |
|------|--------|------|--------|
| 1 | Search for hiring posts (boolean queries) | Web search + Meerkats table | Raw posts |
| 2 | Classify hiring intent | Meerkats AI column | Intent type + signal strength |
| 3 | Filter high-quality leads | Meerkats filter_table_rows | Qualified leads |
| 4 | Extract contact/company data | Meerkats AI column | Email, company, phone |
| 5 | Deduplicate | Meerkats check/delete_duplicate_rows | Clean dataset |
| 6 | Push to CRM | HubSpot integration or export | Company + Contact + Deal |
| 7 | Generate outreach | Meerkats AI column | Email sequences |

## Step 1 — Signal Capture

### Keyword Strategy

Before running searches, define vertical-specific keywords. Ask the user for:
1. **Industry/vertical** (e.g., healthcare, fintech, SaaS, logistics)
2. **Target roles** (e.g., RN, software engineer, sales rep)
3. **Target company types** (e.g., staffing agencies, direct employers, recruiters)

Build boolean queries using this template:

```
("we are hiring" OR "now hiring" OR "urgent hiring") AND ({role_1} OR {role_2} OR {role_3})
("hiring {role_1}" OR "hiring {role_2}") AND ({industry_term_1} OR {industry_term_2})
("#hiring" OR "#nowhiring") AND ({role_1} OR {industry_term_1})
("looking for {role_1}" OR "need {role_1} urgently")
("{industry} staffing" OR "{industry} recruiting") AND (hiring OR recruiting)
```

### Execution

1. Run web searches using the boolean queries via the `web-search-scrape` skill.
2. For each result, extract: `post_url`, `post_text`, `author_name`, `author_linkedin_url`, `author_company`, `post_date`.
3. Create a Meerkats table:

```
Use mcp tool: create_table
  name: "Hiring Signals — {vertical} — {date}"
```

4. Add Input columns:

| Column Name | Data Type | Type |
|-------------|-----------|------|
| Post URL | url | Input |
| Post Text | text | Input |
| Author Name | text | Input |
| Author LinkedIn | url | Input |
| Author Company | text | Input |
| Post Date | date | Input |

## Step 2 — Intent Classification (AI Columns)

Add AI columns to classify each post. See `references/ai-prompts-classification.md` for the full prompts.

**Columns to add:**

| AI Column | Purpose |
|-----------|---------|
| Intent Type | Classify as URGENT_HIRING, ACTIVE_HIRING, EXPANSION_HIRING, AGENCY_HIRING, PIPELINE_BUILDING, or PASSIVE_CONTENT |
| Signal Strength | Rate as VERY_HIGH, HIGH, MEDIUM, or LOW |
| Is Target Vertical | YES/NO — does the post match the user's target vertical? |
| Is Target Geo | YES/NO/UNCLEAR — does the post match the user's target geography? |
| Company Type | STAFFING_AGENCY, DIRECT_EMPLOYER, RECRUITER_INDEPENDENT, or OTHER |
| Pain Signal | Extract the core hiring pain or urgency in under 15 words |

## Step 3 — Filter Qualified Leads

Filter criteria:
- `Is Target Vertical` = "YES"
- `Is Target Geo` = "YES" or "UNCLEAR"
- `Signal Strength` IN ("VERY_HIGH", "HIGH", "MEDIUM")
- `Intent Type` NOT "PASSIVE_CONTENT"

Use `filter_table_rows` or create a filtered sheet called **"Qualified Leads"**.

## Step 4 — Contact & Company Enrichment

Add AI columns for enrichment. See `references/ai-prompts-enrichment.md` for the full prompts.

**Columns to add:**

| AI Column | Purpose |
|-----------|---------|
| Contact Name | Full name of the poster |
| Hiring Role | Specific role(s) being hired for |
| Role Hint | Likely job title of the person posting |
| Email | Extract from post text, or mark NOT_FOUND |

For leads where email is NOT_FOUND, use the `email-find-verify` skill.

## Step 5 — Deduplication

```
Use mcp tool: check_duplicate_rows
  tableId: {table_id}
  attributeKeys: ["Post URL", "Author Company"]

If duplicates found:
  Use mcp tool: delete_duplicate_rows
    tableId: {table_id}
    attributeKeys: ["Post URL", "Author Company"]
```

## Step 6 — Lead Qualification & Prioritization

| Condition | Priority |
|-----------|----------|
| VERY_HIGH/HIGH signal + STAFFING_AGENCY | P1 — Immediate outreach |
| VERY_HIGH/HIGH signal + DIRECT_EMPLOYER | P2 — Standard outreach |
| MEDIUM signal + any company type | P3 — Nurture |
| LOW signal | Skip |

Add an AI column for `Outreach Priority`. See `references/ai-prompts-enrichment.md` for the prompt.

## Step 7 — CRM Export

When pushing to CRM (HubSpot or other), use this mapping:

| CRM Object | Field | Source Column |
|------------|-------|---------------|
| Company | name | Author Company |
| Company | industry | User's target vertical |
| Company | signal_strength | Signal Strength |
| Contact | name | Contact Name |
| Contact | linkedin_url | Author LinkedIn |
| Contact | email | Email |
| Contact | role | Role Hint |
| Deal | deal_name | "Hiring Signal — {Author Company}" |
| Deal | hiring_signal | Intent Type |
| Deal | post_url | Post URL |
| Deal | pain_signal | Pain Signal |
| Deal | priority | Outreach Priority |

Use the `hubspot-integration` skill for CRM push, or export for manual import.

## Step 8 — Email Outreach Sequence

See `references/email-sequence-templates.md` for the full AI column prompts.

### Sequence Overview

| Step | Day | Goal |
|------|-----|------|
| Email 1 | Day 0 | Contextual hook — reference their hiring post |
| Email 2 | Day 2 | Pain amplification — common hiring struggles |
| Email 3 | Day 4 | Value proposition — how teams are solving this |
| Email 4 | Day 7 | Soft CTA — 15-minute call |
| Email 5 | Day 10 | Breakup — close the loop |

### Target Personas

- Recruiters and TA heads
- Staffing agency operators
- Ops leaders and HR directors

### LinkedIn Outreach (Optional)

| Step | Message Strategy |
|------|-----------------|
| Connect | Reference their specific hiring post |
| Follow-up | Ask about hiring challenges and current process |
| CTA | Suggest a short call to compare notes |

## Conversion Factors

| Factor | Impact |
|--------|--------|
| Real-time signals (posts < 24h old) | Very high |
| Personalization (referencing their actual post) | Critical |
| Targeting staffing agencies | Multiplier effect (1 contact → many roles) |
| Speed of outreach | Decisive — first responder wins |

## Execution Checklist

1. **Configure**: Define target vertical, roles, geography, and company types
2. **Search**: Run boolean queries via `web-search-scrape`
3. **Ingest**: Create Meerkats table and bulk-add raw post data
4. **Classify**: Add classification AI columns and run them
5. **Filter**: Keep qualified leads only
6. **Enrich**: Add enrichment AI columns and run them
7. **Deduplicate**: Run dedup on Post URL + Author Company
8. **Qualify**: Add Outreach Priority AI column
9. **Email Lookup**: Use `email-find-verify` for missing emails
10. **Outreach**: Add email draft AI columns
11. **Export**: Push to CRM or export table

## Dependencies

| Skill | Purpose | Required |
|-------|---------|----------|
| `web-search-scrape` | Boolean search queries | Yes |
| `email-find-verify` | Find missing email addresses | Yes |
| `hubspot-integration` | CRM push | Optional |
| `healthcare-signal-detection` | Healthcare-specific variant | Optional |

## Output

After running the full pipeline, deliver:
- Total posts scraped
- Number of qualified leads by priority tier
- Meerkats table link with all enriched data
- Email drafts ready for review
- CRM export summary (if applicable)
