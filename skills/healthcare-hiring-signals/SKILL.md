---
name: healthcare-hiring-signals
description: Detects healthcare hiring signals from LinkedIn, classifies intent, tags posts by poster type, enriches leads, and generates 5-email outreach sequences. Trigger on 'healthcare hiring signals', 'hiring signal detection', 'nurse hiring leads', 'staffing agency pipeline', 'healthcare staffing leads', 'LinkedIn hiring scraper', or 'signal-to-outreach pipeline'.
---

# Healthcare Hiring Signal Pipeline

Scrapes LinkedIn hiring posts, classifies intent, enriches leads, and generates a 5-email outreach sequence.

**Target**: US-based healthcare staffing agencies and healthcare providers actively hiring  
**Goal**: High-intent hiring signals → enrich → CRM → outreach  
**Success**: Meetings booked with TA heads, recruiters, ops leaders

---

## Pipeline Overview

| Step | Task | Output |
|------|------|--------|
| 1 | Scrape LinkedIn posts (last 14 days) | Raw posts loaded into source table |
| 2 | Classify intent + tag poster type | 7 columns per row |
| 3 | Validate poster type tagging | 100% rows tagged before proceeding |
| 4 | Filter qualified leads | Qualified subset (source table intact) |
| 5 | Split into Person + Company derived tables | 2 derived tables (always both, even if empty) |
| 6 | Enrich contact and company data | Email, phone, domain, name columns |
| 7 | Email lookup for missing emails | Verified Email + Email Status columns |
| 8 | Deduplicate | Clean dataset |
| 9 | Qualify and prioritize | Outreach Priority column |
| 10 | Generate 5-email outreach sequences | Email drafts per verified lead |
| 11 | Export to CRM | Company + Contact + Deal records |

---
## Table Schema (all 3 tables share this structure)

| Column |
|--------|
| Post URL |
| Post Text |
| Author Name |
| Author LinkedIn |
| Author Company |
| Post Date |
| Intent Type |
| Signal Strength |
| Poster Type |
| Is Healthcare Hiring |
| Is US Relevant |
| Company Type |
| Pain Signal |
| First Name |
| Last Name |
| Hiring Role |
| Role Hint |
| Company Domain |
| Email (from post) |
| Phone |
| Verified Email |
| Email Status |
| Outreach Priority |
| Email 1 |
| Email 2 |
| Email 3 |
| Email 4 |
| Email 5 |

---
## Step 1 — Scrape LinkedIn Posts

Only ingest posts from the **last 14 days**. Discard anything older.

Use the **`supreme_coder/linkedin-post`** Apify actor. Run these boolean searches:

```
("we are hiring" OR "now hiring" OR "urgent hiring") AND (nurse OR RN OR CNA OR LPN OR caregiver OR "patient care")
("hiring RN" OR "hiring CNA" OR "hiring nurses") AND (hospital OR clinic OR healthcare)
("#hiring" OR "#nowhiring") AND (nurse OR healthcare OR RN)
("looking for nurses" OR "need nurses urgently")
("healthcare staffing" OR "nurse staffing") AND (hiring OR recruiting)
```

Target ~100 results. Apply `publishedAfter` = today minus 14 days (ISO format) at query time.

Extract per post: `Post URL`, `Post Text`, `Author Name`, `Author LinkedIn`, `Author Company`, `Post Date`

Create a source table **"Healthcare Hiring Signals — {today's date}"** and load all valid posts.

---

## Step 2 — Classify + Tag

Add these columns to the source table and run classification on all rows before moving on:

| Column | Values |
|--------|--------|
| `Intent Type` | URGENT_HIRING / ACTIVE_HIRING / EXPANSION_HIRING / AGENCY_HIRING / PIPELINE_BUILDING / PASSIVE_CONTENT |
| `Signal Strength` | VERY_HIGH / HIGH / MEDIUM / LOW |
| `Poster Type` | PERSON_POST / COMPANY_POST |
| `Is Healthcare Hiring` | YES / NO |
| `Is US Relevant` | YES / NO / UNCLEAR |
| `Company Type` | STAFFING_AGENCY / HEALTHCARE_PROVIDER / RECRUITER_INDEPENDENT / OTHER |
| `Pain Signal` | Short phrase under 15 words, or "No clear pain signal" |

---

## Step 3 — Poster Type Validation Gate

Before filtering: confirm `PERSON_POST count + COMPANY_POST count = total row count`. If not, rerun `Poster Type` classification on untagged rows. Do not proceed until 100% tagged.

---

## Step 4 — Filter Qualified Leads

Filter the source table using all four conditions. Source table stays intact — filtering produces a working subset only.

- `Is Healthcare Hiring` = YES
- `Is US Relevant` = YES or UNCLEAR
- `Signal Strength` IN (VERY_HIGH, HIGH, MEDIUM)
- `Intent Type` ≠ PASSIVE_CONTENT

---

## Step 5 — Split into Two Derived Tables

Run immediately after Step 4. Always create both tables even if one has zero rows.

1. Filter source → `Poster Type` = PERSON_POST → create table **"Person Hiring Signals — {date}"** → load rows (empty table if zero rows)
2. Filter source → `Poster Type` = COMPANY_POST → create table **"Company Hiring Signals — {date}"** → load rows (empty table if zero rows)
3. Verify source table still has all original rows

Both derived tables must exist so downstream steps always have valid references.

---

## Step 6 — Enrich (Apollo)

Parse these columns from post data for all three tables. Then enrich each lead via **Apollo** (`people/match` endpoint) using `First Name` + `Last Name` + `Company Domain`. Apollo returns: `Verified Email`, `Phone` (if not in post), `Job Title`, `LinkedIn URL`.
| Column | What to extract |
|--------|----------------|
| `First Name` | First name from Author Name |
| `Last Name` | Last name from Author Name |
| `Hiring Role` | Role(s) being hired for, comma-separated |
| `Role Hint` | Likely job title of poster in 1–3 words |
| `Company Domain` | Most likely website domain, or UNKNOWN |
| `Email (from post)` | Email in post text, or NOT_FOUND |
| `Phone` | Phone in post text in standard format, or NOT_FOUND |

---

## Step 7 — Email Lookup (Apollo)

For rows where `Email (from post)` = NOT_FOUND and Apollo did not return an email:

1. Retry Apollo lookup via `Author LinkedIn` URL if the endpoint supports it
2. Write result to `Verified Email` column
3. Write deliverability status to `Email Status`: VERIFIED / LIKELY_VALID / INVALID / NO_EMAIL_FOUND

**Precedence**: post-extracted email → Apollo email → no email found (exclude from outreach)

---

## Step 8 — Deduplicate

Deduplicate all three tables on keys: **Post URL + Author Company**

---

## Step 9 — Qualify & Prioritize

Add `Outreach Priority` column to all three tables:

| Condition | Priority |
|-----------|----------|
| Signal VERY_HIGH or HIGH + STAFFING_AGENCY or RECRUITER_INDEPENDENT | P1_IMMEDIATE |
| Signal VERY_HIGH or HIGH + HEALTHCARE_PROVIDER | P2_STANDARD |
| Signal MEDIUM | P3_NURTURE |
| Signal LOW or Company OTHER | SKIP |

---

## Step 10 — Generate Outreach Emails

Only for rows where `Email Status` = VERIFIED or LIKELY_VALID.

Add one column per email. Each email should reference `Author Name`, `Author Company`, `Hiring Role`, and `Pain Signal` to personalise.

| Column | Day | Goal |
|--------|-----|------|
| `Email 1` | Day 0 | Hook — reference their specific hiring post |
| `Email 2` | Day 2 | Amplify their hiring pain |
| `Email 3` | Day 4 | Show how others solved it |
| `Email 4` | Day 7 | Soft call to action |
| `Email 5` | Day 10 | Breakup / last touch |

---

## Step 11 — CRM Export

Only export rows where `Outreach Priority` ≠ SKIP.

| Object | Fields |
|--------|--------|
| Company | Author Company, Company Type, Signal Strength |
| Contact | Author Name, Author LinkedIn, Verified Email, Role Hint |
| Deal | "Hiring Signal — {Author Company}", Intent Type, Post URL, Pain Signal, Outreach Priority, Poster Type |

---

## Final Output

- Total posts scraped (all within 14-day window)
- Qualified leads by priority: P1 / P2 / P3 / SKIP
- Qualified leads by poster type: PERSON_POST / COMPANY_POST
- Email coverage: verified / likely valid / no email found
- 3 tables: source + Person Hiring Signals + Company Hiring Signals
- CRM records pushed (if applicable)
