---
name: healthcare-signal-detection
description: "Run the healthcare hiring signal detection and conversion pipeline — scrape LinkedIn posts via Apify, classify hiring intent, enrich leads, deduplicate, qualify, and generate outreach using Meerkats.ai tables and AI columns. Use when the user mentions 'healthcare hiring signals', 'nurse hiring leads', 'staffing signal detection', 'run healthcare pipeline', 'find hiring posts', 'healthcare staffing leads', 'RN hiring signals', 'CNA hiring leads', 'healthcare outbound', 'hiring signal enrichment'."
metadata:
  version: 1.0.0
  author: meerkatsai
  category: signal-detection
---

# Healthcare Hiring Signal Detection & Conversion

You orchestrate a 7-step pipeline that detects healthcare hiring signals from LinkedIn, classifies and enriches them using Meerkats.ai AI columns, qualifies leads, and generates personalized outreach.

**Stack:** Apify (scraping) → Meerkats.ai tables + AI columns (classification, enrichment, dedup, qualification) → HubSpot (optional CRM export)

## When to Use This Skill

- Detecting healthcare hiring signals from LinkedIn posts
- Classifying hiring intent (Urgent, Active, Expansion, Agency, Pipeline, Passive)
- Enriching scraped posts with company type, role extraction, pain signals
- Qualifying leads and generating outreach sequences
- Replacing Clay-based healthcare signal workflows with Meerkats.ai

## Reference Files

Load these before executing any phase:
- `${SKILL_DIR}/references/enrichment-schema.md` — Table schema, AI column prompts, qualification matrix
- `${SKILL_DIR}/references/intent-taxonomy.md` — Intent types, signal scoring rules
- `${SKILL_DIR}/references/keyword-strategy.md` — Apify boolean queries, keyword categories
- `${SKILL_DIR}/references/email-templates.md` — 5-email sequence, LinkedIn outreach templates

## Arguments

| Flag | Purpose |
|------|---------|
| `--setup` | Create the Meerkats table with all input + AI columns |
| `--step [1-7]` | Run a specific pipeline step |
| `--enrich` | Run AI enrichment on all rows |
| `--dedupe` | Deduplicate the table |
| `--outreach "name"` | Generate outreach for a specific lead |
| `--query-only` | Output Apify boolean queries only |

If no arguments, run interactively (prompt user for which phase).

---

## Pipeline Overview

| Step | Action | Tool |
|------|--------|------|
| 1 | Scrape LinkedIn posts | Apify |
| 2 | Classify hiring intent | Meerkats AI column |
| 3 | Filter high-quality leads | Meerkats filter |
| 4 | Extract contact/company data | Meerkats AI column |
| 5 | Deduplicate | Meerkats dedup |
| 6 | Push to CRM | HubSpot (optional) |
| 7 | Trigger outreach | Email/LinkedIn templates |

---

## Phase 0: Table Setup (`--setup`)

Create the Meerkats table that powers the entire pipeline.

**Step 1:** Create table via Meerkats API/MCP:
- Name: `Healthcare Hiring Signals`
- Description: `LinkedIn hiring signal detection pipeline`

**Step 2:** Add Input columns (type: `Input`):

| Column | Data Type |
|--------|-----------|
| Post URL | url |
| Post Content | text |
| Author Name | text |
| Author LinkedIn URL | url |
| Post Date | date |
| Author Info | text |

**Step 3:** Add AI columns (type: `AI`) in dependency order. Use exact prompts from `references/enrichment-schema.md`.

**Batch 1 — No dependencies on other AI columns:**
- Intent Type, Is Healthcare Hiring, Is US Relevant, Hiring Role, Pain Signal, Email, Phone, Company Name

**Batch 2 — Depends on Batch 1:**
- Signal Strength (needs `{Intent Type}`)
- Company Type (needs `{Company Name}`)

**Batch 3 — Depends on Batch 2:**
- Qualification (needs `{Signal Strength}` + `{Company Type}`)

Set `tools: []` for all AI columns (text classification tasks).

**Step 4:** Confirm via `get_table` and display schema to user.

---

## Phase 1: Signal Capture (Apify → Meerkats)

**If user has Apify output:** Parse JSON, map fields per `references/enrichment-schema.md`, load via `add_table_rows_bulk`.

**If user needs queries (`--query-only`):** Output boolean queries from `references/keyword-strategy.md` formatted for the Apify LinkedIn Posts Scraper.

**If user adds manually:** Use `add_table_row` for individual posts.

### Apify Field Mapping

| Apify Field | Meerkats Column |
|-------------|-----------------|
| post_url / url | Post URL |
| post_text / content | Post Content |
| author_name / authorName | Author Name |
| author_linkedin_url / authorUrl | Author LinkedIn URL |
| post_date / postedAt | Post Date |
| author.info / authorHeadline | Author Info |

---

## Phase 2: AI Enrichment (`--enrich`)

1. Get table details via `get_table` to find column IDs and sheet ID
2. Run `run_table_ai_cells_bulk` in dependency order:
   - Batch 1 → Batch 2 → Batch 3
   - Use `type: "all"` to process all rows
3. Retry failures with `onlyErrored: true`
4. Display summary: posts per intent type, signal distribution, qualification breakdown

---

## Phase 3: Deduplication (`--dedupe`)

1. Run `check_duplicate_rows` with `attributeKeys: ["Post URL"]`
2. Report duplicates found
3. Run `delete_duplicate_rows` to clean
4. Optionally check `["Company Name"]` for company-level dedup (confirm with user)

---

## Phase 4: Filtering & Qualification

1. Filter for: Qualification = "Immediate Outreach" or "Outreach", Is Healthcare Hiring = "Yes", Is US Relevant = "Yes"
2. Create "Qualified Leads" sheet via `create_table_sheet`
3. Copy qualified rows to new sheet
4. Display: total processed, qualified count, company type breakdown, top roles, pain signals

---

## Phase 5: Outreach Generation (`--outreach`)

1. For each qualified lead, pull: first_name, hiring_role, company_name, pain_signal, post_url
2. Load templates from `references/email-templates.md`
3. Generate 5-email sequence with variable substitution
4. Generate LinkedIn outreach (Connect → Follow-up → CTA)

**Priority order:**
- Staffing agencies first (1 agency = many roles)
- VERY HIGH signal before HIGH
- Posts within 24h get priority

---

## Phase 6: CRM Export

Output in HubSpot-compatible format:
- **Company:** name, industry, signal_strength
- **Contact:** name, linkedin_url, email, phone, role_hint
- **Deal:** hiring_signal, post_url, pain_signal, hiring_role, qualification

---

## Phase 7: Pipeline Summary

Display: total posts, intent type distribution, signal strength breakdown, qualified leads, outreach generated, recommended next actions.

---

## Error Handling

- Table doesn't exist → prompt `--setup`
- Apify fields don't match → try common name variants (see enrichment-schema.md)
- AI enrichment fails → retry with `onlyErrored: true`
- No qualified leads → suggest expanding criteria

## Key Principles

- **Speed matters:** 24h-old posts convert best
- **Staffing agencies are multipliers:** 1 agency = many roles
- **Personalization is critical:** Every outreach must reference the specific post
- **Meerkats AI columns replace Clay:** Classification, extraction, scoring, qualification all via chained AI prompts
