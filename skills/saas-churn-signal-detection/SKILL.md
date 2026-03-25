---
name: saas-churn-signal-detection
description: "Use when the user wants to detect SaaS tool-switching signals from LinkedIn posts — people complaining about their current tools, evaluating alternatives, or announcing migrations. Trigger on phrases like 'competitor churn signals,' 'tool switching leads,' 'SaaS replacement pipeline,' 'alternative seekers,' 'competitor dissatisfaction signals,' 'migration leads,' 'tool evaluation signals,' or 'churn signal detection.' Covers the full workflow: Apify LinkedIn scraping, Meerkats AI-powered intent classification, lead enrichment, deduplication, HubSpot CRM export, and outreach sequence generation."
metadata:
  version: 1.0.0
---

# SaaS Competitor Churn Signal Detection & Conversion Pipeline

You are an expert in detecting high-intent SaaS tool-switching signals from LinkedIn posts — people publicly expressing dissatisfaction with their current tools, asking for recommendations, evaluating alternatives, or announcing migrations. You classify these signals, enrich the leads, and convert them into outreach-ready pipeline entries.

**Tool stack**: Apify (LinkedIn scraping) → Meerkats.ai tables + AI columns (classification, enrichment, filtering, dedup) → HubSpot (CRM) → Email/LinkedIn (outreach). Meerkats handles all AI classification, filtering, and data processing.

## Objective

- **Target Segment**: Decision-makers at companies actively looking to switch away from a competitor SaaS tool (CRM, marketing automation, project management, analytics, etc.)
- **Goal**: Identify tool-switching signals → classify intent → enrich → push to CRM → trigger personalized outreach
- **Success Metric**: Demo requests booked with prospects already in an active evaluation or switching cycle

## When to Use This Skill

- Detecting signals that companies are unhappy with or switching from a competitor tool
- Classifying tool-switching intent from LinkedIn posts
- Enriching leads with contact, company, and tech stack data
- Building qualified pipeline of prospects in active evaluation cycles
- Generating personalized outreach referencing their specific tool frustration
- Running the end-to-end churn-signal-to-outreach pipeline

## Customization — Define Your Competitors

Before running this pipeline, the user MUST define:

1. **Your product name**: The SaaS product you are selling
2. **Competitor list**: 3-10 competitor tools to monitor (e.g., "Salesforce", "HubSpot", "Pipedrive")
3. **Product category**: What category your tool belongs to (e.g., "CRM", "marketing automation", "project management")

The boolean queries, AI prompts, and outreach templates below use `{{your_product}}`, `{{competitor_list}}`, and `{{product_category}}` as placeholders. Replace them before running.

## Pipeline Overview

| Step | Action | Tool | Output |
|------|--------|------|--------|
| 1 | Scrape LinkedIn posts (boolean queries) | **Apify** (LinkedIn Post Scraper) | Raw posts with author data |
| 2 | Ingest into table | **Meerkats** table (Input columns) | Structured rows |
| 3 | Classify switching intent | **Meerkats** AI columns | Intent type + signal strength |
| 4 | Filter high-quality signals | **Meerkats** filter_table_rows | Qualified leads |
| 5 | Enrich contact/company data | **Meerkats** AI columns | Email, role, first name, competitor |
| 6 | Deduplicate | **Meerkats** check/delete_duplicate_rows | Clean dataset |
| 7 | Push to CRM | **HubSpot** | Company + Contact + Deal |
| 8 | Generate outreach | **Meerkats** AI columns | Email sequences |

---

## Step 1 — Signal Capture (Apify)

Apify scrapes **LinkedIn feed posts** where real people publicly discuss their frustrations, ask for recommendations, or announce tool changes. Each result includes the author's name, LinkedIn URL, company, and role.

### Keyword Strategy

Feed these boolean queries into Apify's LinkedIn Post Scraper as the search input. Replace `{{competitor}}` with each competitor name.

**Core Signal Keywords**:

| Category | Keywords |
|----------|----------|
| Dissatisfaction | "frustrated with", "disappointed with", "hate using", "struggling with" |
| Switching | "switching from", "migrating from", "moving away from", "replacing" |
| Evaluation | "looking for alternative", "evaluating options", "any recommendations for", "what do you use instead of" |
| Comparison | "vs", "compared to", "better than", "alternative to" |
| Announcement | "just switched to", "we moved from", "finally ditched", "goodbye" |

**High-Intent Boolean Queries** (use as Apify search input):

```
("switching from" OR "migrating from" OR "moving away from" OR "replacing") AND ({{competitor_1}} OR {{competitor_2}} OR {{competitor_3}})
("frustrated with" OR "disappointed with" OR "struggling with" OR "hate using") AND ({{competitor_1}} OR {{competitor_2}} OR {{competitor_3}})
("looking for alternative" OR "alternative to" OR "replacement for") AND ({{competitor_1}} OR {{competitor_2}} OR {{competitor_3}})
("any recommendations" OR "what do you use instead" OR "suggest a better") AND ({{product_category}} OR {{competitor_1}} OR {{competitor_2}})
("just switched from" OR "we moved from" OR "finally ditched" OR "goodbye") AND ({{competitor_1}} OR {{competitor_2}} OR {{competitor_3}})
("#{{product_category}}" OR "#SaaS") AND ("alternative" OR "switching" OR "recommendation") AND ({{competitor_1}} OR {{competitor_2}})
```

**Example** (if you sell a CRM and your competitors are Salesforce, HubSpot, Pipedrive):

```
("switching from" OR "migrating from" OR "moving away from" OR "replacing") AND (Salesforce OR HubSpot OR Pipedrive)
("frustrated with" OR "disappointed with" OR "struggling with") AND (Salesforce OR HubSpot OR Pipedrive)
("looking for alternative" OR "alternative to" OR "replacement for") AND (Salesforce OR HubSpot OR Pipedrive)
("any recommendations" OR "what do you use instead") AND (CRM OR Salesforce OR HubSpot)
("just switched from" OR "we moved from" OR "finally ditched") AND (Salesforce OR HubSpot OR Pipedrive)
```

### Freshness Rule

**CRITICAL**: Only ingest posts from the last 14 days. Older posts are stale — the prospect may have already chosen a replacement.

- Configure Apify's `publishedAt` or date range filter to the last 14 days.
- When ingesting rows, check `post_date` — skip any post older than 14 days.
- The `Post Age Check` AI column (Step 3) acts as a safety net.

### Apify Configuration

```json
{
  "searchQueries": [
    "(\"switching from\" OR \"migrating from\" OR \"moving away from\") AND ({{competitor_1}} OR {{competitor_2}} OR {{competitor_3}})",
    "(\"frustrated with\" OR \"disappointed with\" OR \"struggling with\") AND ({{competitor_1}} OR {{competitor_2}} OR {{competitor_3}})",
    "(\"looking for alternative\" OR \"alternative to\" OR \"replacement for\") AND ({{competitor_1}} OR {{competitor_2}} OR {{competitor_3}})",
    "(\"any recommendations\" OR \"what do you use instead\") AND ({{product_category}} OR {{competitor_1}} OR {{competitor_2}})",
    "(\"just switched from\" OR \"we moved from\" OR \"finally ditched\") AND ({{competitor_1}} OR {{competitor_2}} OR {{competitor_3}})"
  ],
  "maxResults": 500,
  "dateRange": "past-14-days"
}
```

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

1. Replace all `{{competitor}}` and `{{product_category}}` placeholders with actual values.
2. Configure and run the Apify LinkedIn Post Scraper with the boolean queries above.
3. Set the date range to the last 14 days.
4. Download/export the Apify results.
5. **Discard any result where `post_date` is older than 14 days.**
6. Create a Meerkats table and bulk-add the Apify results as rows.

---

## Step 2 — Ingest into Meerkats Table

Create a Meerkats table and load the Apify output as rows.

**Create table command**:

```
Use mcp tool: create_table
  name: "SaaS Churn Signals — {{your_product}} — {date}"
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

Add AI columns to classify each post's switching intent.

### AI Column: `Intent Type`

**Prompt**:
```
Analyze the LinkedIn post in {Post Text} and classify the tool-switching intent into exactly one of these categories:

- ACTIVE_SWITCHING: Person or company is currently in the process of switching away from a tool. Uses language like "we're migrating from", "replacing our current", "in the middle of switching"
- EVALUATING: Person is actively evaluating alternatives or asking for recommendations. Uses language like "looking for alternative to", "any recommendations for", "evaluating options", "what do you use instead of"
- FRUSTRATED: Person is expressing dissatisfaction with their current tool but hasn't committed to switching yet. Uses language like "frustrated with", "struggling with", "hate using", "so many issues with"
- RECENTLY_SWITCHED: Person has already completed a switch and is sharing their experience. Uses language like "just switched to", "we moved from", "finally ditched", "goodbye [tool]"
- COMPARISON_DISCUSSION: Person is discussing/comparing tools without clear switching intent. Uses language like "X vs Y", "compared to", "how does X stack up"
- NOT_RELEVANT: Post mentions a tool name but has no switching, dissatisfaction, or evaluation signal. Includes job posts, feature announcements, tips/tutorials, or general praise

Return ONLY the category name, nothing else.
```

### AI Column: `Signal Strength`

**Prompt**:
```
Based on the post in {Post Text} and the intent type {Intent Type}, assign a signal strength:

- VERY_HIGH: ACTIVE_SWITCHING — person is currently migrating or has budget approved to switch. Immediate opportunity.
- HIGH: EVALUATING — person is actively asking for alternatives and collecting options. Near-term opportunity.
- HIGH: FRUSTRATED — person is expressing strong dissatisfaction, likely to switch soon. Pain is real and present.
- MEDIUM: RECENTLY_SWITCHED — already switched (too late for this deal, but can learn from the switch and target similar companies). Also useful for case study/reference validation.
- LOW: COMPARISON_DISCUSSION — casual comparison, no clear switching intent.
- NONE: NOT_RELEVANT — no signal.

Return ONLY the strength level: "VERY_HIGH", "HIGH", "MEDIUM", "LOW", or "NONE".
```

### AI Column: `Competitor Mentioned`

**Prompt**:
```
From {Post Text}, identify which specific competitor tool(s) the person is discussing, frustrated with, switching from, or evaluating against.

Return the tool name(s) as a comma-separated list. Examples: "Salesforce", "HubSpot, Pipedrive", "Jira, Monday.com".

If no specific tool is mentioned, return "UNSPECIFIED".
```

### AI Column: `Frustration Reason`

**Prompt**:
```
From {Post Text}, extract the specific reason for dissatisfaction, switching, or evaluation. What pain is driving this signal?

Examples:
- "Too expensive at scale"
- "Poor customer support"
- "Missing integrations with their stack"
- "Too complex for small team"
- "Reporting/analytics not good enough"
- "Slow and buggy"
- "Forced into enterprise tier"

If no clear reason is stated, return "Reason not specified".

Keep the response under 15 words.
```

### AI Column: `Company Size Estimate`

**Prompt**:
```
Based on {Author Info}, {Author Company}, and {Post Text}, estimate the company size tier:

- ENTERPRISE: 1000+ employees, large corporation, Fortune 500
- MID_MARKET: 200-999 employees, established company, multiple departments
- SMB: 50-199 employees, growing company, small-medium team references
- STARTUP: Under 50 employees, early-stage, small team, founder-led
- UNKNOWN: Cannot determine from available information

Look for clues: "our team of 200", "we're a small startup", company name recognition, job title seniority.

Return ONLY the size tier.
```

### AI Column: `Is Decision Maker`

**Prompt**:
```
Based on {Author Info} and {Author Name}, determine if this person is likely a decision-maker who can influence or approve a tool purchase.

Decision-maker signals:
- C-suite titles: CEO, CTO, COO, CMO, CFO, CRO
- VP/Director: VP of Sales, Director of Marketing, VP Engineering, Director of Operations
- Head of: Head of Growth, Head of Revenue, Head of Product
- Manager with tool ownership: RevOps Manager, Marketing Ops, Sales Ops, IT Manager
- Founder/Owner/Co-founder

NOT decision-makers:
- Individual contributors (SDR, AE, Designer, Developer — unless at a startup)
- Interns, assistants, coordinators
- Content creators discussing tools editorially

Return "YES" or "NO".
```

### AI Column: `Post Age Check`

**Prompt**:
```
Today's date is {{current_date}}. The post date is {Post Date}.

Calculate the number of days between the post date and today. If the post is older than 14 days, return "STALE". If 14 days or fewer, return "FRESH".

Return ONLY "FRESH" or "STALE".
```

---

## Step 4 — Filter Qualified Leads

After AI columns have run, filter the table to keep only qualified leads.

**Filter criteria** (ALL must be true):

- `Post Age Check` = "FRESH" (discard anything older than 14 days)
- `Signal Strength` IN ("VERY_HIGH", "HIGH") — skip MEDIUM/LOW/NONE for outreach
- `Intent Type` NOT "NOT_RELEVANT" and NOT "COMPARISON_DISCUSSION"
- `Is Decision Maker` = "YES"
- `Competitor Mentioned` is NOT "UNSPECIFIED"

Use `filter_table_rows` or create a Meerkats sheet called **"Qualified Churn Signals"** containing only rows that pass ALL filters.

**Secondary sheet — "Nurture Signals"**: Optionally create a second sheet for MEDIUM-strength and RECENTLY_SWITCHED signals. These aren't ready for direct outreach but are valuable for:
- Understanding competitor weaknesses
- Building case studies around switching stories
- Nurture campaigns targeting similar companies

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

### AI Column: `Role Hint`

**Prompt**:
```
Based on {Author Name}, {Author Company}, and {Author Info}, what is this person's likely job function relevant to tool purchasing?

Categorize into one of:
- "RevOps / Sales Ops" — manages CRM, sales tools
- "Marketing Ops" — manages marketing automation, analytics
- "Engineering / IT" — manages dev tools, infrastructure
- "Leadership" — CEO, founder, general management
- "Product" — manages product tools, PM software
- "Finance" — manages financial tools, billing
- "Other" — doesn't fit above categories

Return ONLY the category.
```

### AI Column: `Email`

**Prompt**:
```
Check if {Post Text} contains any email address. If yes, extract it. If no, return "NOT_FOUND".
```

### AI Column: `Company Domain`

**Prompt**:
```
Based on {Author Company}, determine the most likely company website domain.

Examples:
- "Acme Corp" → "acmecorp.com"
- "Stripe" → "stripe.com"
- "Notion" → "notion.so"

If you cannot determine the domain, return "UNKNOWN".

Return ONLY the domain (e.g., "company.com"), nothing else.
```

> **Note**: For leads where email is NOT_FOUND, use the `email-find-verify` skill to look up emails using `{Author Name}` and `{Company Domain}`.

---

## Step 6 — Deduplication

Run deduplication on the qualified leads table. Dedup on `Post URL` (same post scraped twice) and `Author Company` (multiple posts from same company — keep the highest signal).

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
| VERY_HIGH signal (ACTIVE_SWITCHING) + decision maker | Immediate outreach — they're switching NOW | P1 |
| HIGH signal (EVALUATING) + decision maker | Fast outreach — get into their evaluation | P2 |
| HIGH signal (FRUSTRATED) + decision maker | Outreach — plant the seed before they start evaluating | P2 |
| MEDIUM signal (RECENTLY_SWITCHED) | Nurture list — learn from the switch | P3 |
| LOW/NONE signal | Skip | — |

### AI Column: `Outreach Priority`

**Prompt**:
```
Based on signal strength {Signal Strength}, intent type {Intent Type}, and decision-maker status {Is Decision Maker}, assign an outreach priority:

- P1_IMMEDIATE: ACTIVE_SWITCHING with VERY_HIGH signal and decision maker = YES
- P2_FAST: EVALUATING or FRUSTRATED with HIGH signal and decision maker = YES
- P3_NURTURE: RECENTLY_SWITCHED with MEDIUM signal (useful for intel, not direct outreach)
- SKIP: LOW or NONE signal, or decision maker = NO

Return ONLY the priority code.
```

---

## Step 8 — CRM Export (HubSpot)

When pushing to HubSpot, use this mapping:

**Company object**:
- `name` ← Author Company
- `industry` ← (inferred from Author Info or post context)
- `company_size` ← Company Size Estimate (custom property)

**Contact object**:
- `firstname` ← Contact First Name
- `lastname` ← (extracted from Author Name)
- `linkedin_url` ← Author LinkedIn
- `email` ← Email
- `jobtitle` ← Author Info
- `department` ← Role Hint

**Deal object**:
- `dealname` ← "Churn Signal — {Author Company} — switching from {Competitor Mentioned}"
- `signal_type` ← Intent Type (custom property)
- `competitor` ← Competitor Mentioned (custom property)
- `frustration_reason` ← Frustration Reason (custom property)
- `post_url` ← Post URL
- `priority` ← Outreach Priority

> Use the `hubspot-integration` skill for actual CRM push, or export the qualified leads table for manual import.

---

## Step 9 — Email Outreach Sequence

### Target Personas

- RevOps / Sales Ops leaders
- Marketing Ops managers
- CTOs / VP Engineering
- CEOs / Founders (at SMB/startup)
- Department heads evaluating tools

### Sequence Overview

| Step | Day | Goal |
|------|-----|------|
| Email 1 | Day 0 | Empathy hook — reference their specific frustration |
| Email 2 | Day 2 | Social proof — how similar companies solved the same problem |
| Email 3 | Day 5 | Value bridge — connect their pain to your solution |
| Email 4 | Day 8 | Soft CTA — 15-minute walkthrough |
| Email 5 | Day 12 | Breakup — close the loop |

### AI Column: `Email 1 Draft`

**Prompt**:
```
Write a short, personalized cold email (under 100 words) for {Contact First Name} at {Author Company}.

Context: They posted on LinkedIn expressing {Intent Type} regarding {Competitor Mentioned}. Their specific frustration: {Frustration Reason}. Their company size is approximately {Company Size Estimate}.

Structure:
- Subject line: Reference their specific tool pain (NOT your product). Example: "re: your {Competitor Mentioned} frustration"
- Opening: Acknowledge you saw their post about {Competitor Mentioned}. Show empathy — don't pitch immediately.
- Middle: Briefly mention you've heard the same frustration from other {Company Size Estimate}-sized teams.
- Close: Ask what's driving the evaluation / what they'd need in a replacement.

Tone: Empathetic, peer-to-peer, curious. NOT salesy. Do NOT mention {{your_product}} in Email 1. Sign off with "– {{Your Name}}".
```

### AI Column: `Email 2 Draft`

**Prompt**:
```
Write a follow-up email (under 80 words) for {Contact First Name} about their {Competitor Mentioned} situation.

Theme: Social proof. Mention that other companies in a similar position (similar size, similar frustration) made the switch and saw specific improvements. Be vague enough to be credible but specific enough to be interesting.

Do NOT name {{your_product}} yet. Just reference "a team we work with" or "a similar company".

Subject line: "Re: your {Competitor Mentioned} frustration"
Sign off with "– {{Your Name}}".
```

### AI Column: `Email 3 Draft`

**Prompt**:
```
Write a value-bridge email (under 80 words) for {Contact First Name}.

Theme: Now connect their specific pain ({Frustration Reason}) to how {{your_product}} solves it. This is the first email where you mention your product by name.

Structure:
- Acknowledge their frustration with {Competitor Mentioned}
- State 1-2 specific ways {{your_product}} addresses that exact pain
- Offer a quick walkthrough (no pressure)

Subject line: "How teams are solving the {Competitor Mentioned} problem"
Sign off with "– {{Your Name}}".
```

### LinkedIn Outreach (Optional)

| Step | Message Strategy |
|------|-----------------|
| Connect | Reference their specific post about {Competitor Mentioned} — show you understand the pain |
| Follow-up | Ask what they're looking for in a replacement — be a consultant, not a seller |
| CTA | Offer a 15-minute walkthrough tailored to their switching criteria |

---

## Conversion Factors

| Factor | Impact |
|--------|--------|
| Speed — reaching them while they're still evaluating | Decisive |
| Empathy — acknowledging their frustration first, not pitching | Critical |
| Specificity — referencing their EXACT competitor and pain | Very high |
| Targeting decision-makers (not ICs complaining casually) | High |
| Company size match to your product's sweet spot | High |

---

## Execution Checklist

When running this pipeline, follow these steps in order:

1. **Configure**: Define your product name, competitor list (3-10), and product category
2. **Scrape**: Run Apify LinkedIn Post Scraper with the boolean queries (last 14 days only)
3. **Ingest**: Create Meerkats table and bulk-add Apify results as rows
4. **Classify**: Add AI columns (Intent Type, Signal Strength, Competitor Mentioned, Frustration Reason, Company Size Estimate, Is Decision Maker, Post Age Check) and run them
5. **Filter**: Filter to qualified signals only (FRESH + VERY_HIGH/HIGH + decision maker + competitor identified)
6. **Enrich**: Add enrichment AI columns (Contact First Name, Role Hint, Email, Company Domain) and run them
7. **Deduplicate**: Run dedup on Post URL + Author Company
8. **Qualify**: Add Outreach Priority AI column and run it
9. **Email Lookup**: For leads with no email, use `email-find-verify` skill with Author Name + Company Domain
10. **Outreach**: Add email draft AI columns and run them
11. **Export**: Push to CRM via `hubspot-integration` skill or export table

## Dependencies on Other Skills

- `email-find-verify` — for finding missing email addresses
- `hubspot-integration` — for CRM push (optional)

## External Tool Dependencies

- **Apify** — LinkedIn Post Scraper actor for signal capture (Step 1). Requires an Apify account and API key.

## Output

After running the full pipeline, deliver:
- Total posts scraped from Apify
- Breakdown by intent type (switching, evaluating, frustrated, etc.)
- Number of qualified leads by priority tier
- Top competitors mentioned (frequency count)
- Top frustration reasons (frequency count)
- Meerkats table link with all enriched data
- Email drafts ready for review
- CRM export summary (if applicable)
