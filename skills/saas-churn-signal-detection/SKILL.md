---
name: saas-churn-signal-detection
description: "Use when the user wants to detect buying-intent signals from LinkedIn posts, enrich contacts, and categorize leads by intent level. Works for any service business or SaaS targeting SMBs. Trigger on phrases like 'buying signals,' 'intent detection,' 'signal pipeline,' 'lead intent scoring,' 'LinkedIn signal capture,' or 'intent-based outreach.' Covers: Apify signal capture, Meerkats AI intent classification (high/mid/low), contact enrichment, dedup, CRM export, and outreach."
metadata:
  version: 3.0.0
---

# Intent Signal Detection & Lead Enrichment Pipeline

Detect buying-intent signals from LinkedIn → classify as High / Mid / Low intent → enrich contact details → generate outreach.

**Example used throughout**: A digital marketing agency looking for SMBs that need marketing help. Replace the example queries and prompts with your own business context.

**Tool stack**: Apify (signal capture) → Meerkats (classify, enrich, filter, dedup) → HubSpot (CRM) → Email/LinkedIn (outreach)

---

## Setup — Define Your Business Context

Before running, fill in:

| Field | Example (Marketing Agency) | Your Value |
|-------|---------------------------|------------|
| **Your service** | Digital marketing (SEO, paid ads, content) | ___________ |
| **Target buyer** | SMB founders, marketing managers, ops leads | ___________ |
| **Buying signals** | "need marketing help", "looking for an agency" | ___________ |
| **Competitors** | Specific agencies or DIY tools they'd switch from | ___________ |

---

## Step 1 — Capture Signals (Apify)

Scrape LinkedIn posts where people express a need for your service.

### Boolean Queries

**Example for a marketing agency**:

```
("looking for" OR "need help with" OR "any recommendations") AND ("marketing agency" OR "SEO agency" OR "digital marketing")
("our marketing" OR "my marketing") AND ("isn't working" OR "not working" OR "struggling" OR "need to fix")
("looking for a freelancer" OR "looking for an agency") AND ("marketing" OR "SEO" OR "paid ads" OR "content")
("just raised" OR "seed round" OR "Series A") AND ("need marketing" OR "hiring for marketing" OR "marketing strategy")
("who do you use for" OR "recommend a") AND ("marketing" OR "SEO" OR "Google ads" OR "social media")
```

### Apify Config

```json
{
  "searchQueries": ["<your boolean queries here>"],
  "maxResults": 500,
  "dateRange": "past-14-days"
}
```

### What Apify Returns

| Field | Description |
|-------|-------------|
| `post_url` | LinkedIn post URL |
| `post_text` | Full post text |
| `author_name` | Person who posted |
| `author_linkedin_url` | Their LinkedIn profile |
| `author_company` | Their company |
| `author_info` | Their headline/title |
| `post_date` | When they posted |

---

## Step 2 — Ingest into Meerkats Table

```
Use mcp tool: create_table
  name: "Intent Signals — {date}"
```

**Input columns**:

| Column | Type | Data Type |
|--------|------|-----------|
| Post URL | Input | url |
| Post Text | Input | text |
| Author Name | Input | text |
| Author LinkedIn | Input | url |
| Author Company | Input | text |
| Author Info | Input | text |
| Post Date | Input | date |

Bulk-add all Apify results using `add_table_rows_bulk`.

---

## Step 3 — Classify Intent (Meerkats AI Columns)

Three levels. Simple.

### AI Column: `Intent Level`

**Prompt**:
```
You are classifying LinkedIn posts for a digital marketing agency looking for clients. Analyze {Post Text} and assign ONE intent level:

HIGH — Person is actively looking for help RIGHT NOW:
- "Looking for a marketing agency"
- "Need help with SEO/ads/content"
- "Any recommendations for a marketing partner?"
- "Hiring a fractional CMO / marketing lead" (they don't have one = agency opportunity)
- "Who do you use for marketing?"
- Asking their network for specific service recommendations

MID — Person has a problem we can solve, but isn't actively searching yet:
- "Our marketing isn't generating leads"
- "Struggling to get organic traffic"
- "Tried running ads but didn't work"
- "We need to fix our funnel"
- Complaining about marketing results without asking for help
- Just raised funding (will need marketing soon)

LOW — Tangentially related but no clear buying signal:
- General marketing tips or thought leadership
- Sharing an article about marketing trends
- Celebrating a marketing win
- Job posting for a full-time marketer (not looking for agency)
- Discussing marketing concepts abstractly

Return ONLY: "HIGH", "MID", or "LOW".
```

### AI Column: `Signal Category`

**Prompt**:
```
Based on {Post Text} and the intent level {Intent Level}, categorize the specific type of signal:

For HIGH intent:
- ACTIVELY_SEARCHING: Directly asking for agency/service recommendations
- HIRING_GAP: Hiring for a role they can't fill = agency opportunity
- BUDGET_READY: Mentions funding, budget allocation, or ready to invest

For MID intent:
- PAIN_EXPRESSED: Complaining about poor marketing results
- DIY_FAILING: Tried doing it themselves, not working
- GROWTH_TRIGGER: Funding raised, new product launch, expansion — will need marketing

For LOW intent:
- CONTENT_ONLY: Thought leadership, tips, no buying signal
- NOT_RELEVANT: Doesn't relate to needing marketing services

Return ONLY the category name.
```

### AI Column: `What They Need`

**Prompt**:
```
From {Post Text}, extract in plain language what this person specifically needs help with. Keep it short and actionable.

Examples:
- "SEO help — organic traffic not growing"
- "Paid ads management — tried Google Ads, burning money"
- "Content strategy — don't know what to post"
- "Full marketing overhaul — nothing is working"
- "Lead gen — website gets traffic but no conversions"
- "Social media — no idea what to do with LinkedIn/Instagram"

If unclear, return "General marketing help".

Keep under 10 words.
```

### AI Column: `Post Freshness`

**Prompt**:
```
Today is {{current_date}}. Post date is {Post Date}.

If older than 14 days: return "STALE"
If 14 days or fewer: return "FRESH"

Return ONLY "FRESH" or "STALE".
```

---

## Step 4 — Filter

Keep only actionable leads.

**Filter criteria**:
- `Post Freshness` = "FRESH"
- `Intent Level` IN ("HIGH", "MID")
- `Signal Category` NOT "CONTENT_ONLY" and NOT "NOT_RELEVANT"

Create two Meerkats sheets:

| Sheet | Filter | What to do |
|-------|--------|------------|
| **Hot Leads** | Intent Level = HIGH | Reach out within 24 hours |
| **Warm Leads** | Intent Level = MID | Reach out within 3 days |

---

## Step 5 — Enrich Contacts (Meerkats AI Columns)

### AI Column: `First Name`

**Prompt**:
```
Extract only the first name from {Author Name}. Return just the first name, nothing else.
```

### AI Column: `Buyer Role`

**Prompt**:
```
Based on {Author Info}, what is this person's role? Categorize:

- "Founder / CEO" — runs the business
- "Marketing Lead" — owns marketing, could hire an agency
- "Ops / Growth" — manages growth initiatives
- "Sales" — might need marketing support for pipeline
- "Other" — not a clear buyer

Return ONLY the category.
```

### AI Column: `Company Domain`

**Prompt**:
```
Based on {Author Company}, what is the likely website domain?

Examples: "Acme Corp" → "acmecorp.com", "GrowthHit" → "growthhit.com"

Return ONLY the domain. If unknown, return "UNKNOWN".
```

### AI Column: `Email`

**Prompt**:
```
Check if {Post Text} contains any email address. If yes, extract it. If no, return "NOT_FOUND".
```

> For NOT_FOUND emails, use the `email-find-verify` skill with `{Author Name}` + `{Company Domain}`.

---

## Step 6 — Deduplicate

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

## Step 7 — CRM Export (HubSpot)

**Company**: `name` ← Author Company, `domain` ← Company Domain

**Contact**: `firstname` ← First Name, `linkedin_url` ← Author LinkedIn, `email` ← Email, `jobtitle` ← Author Info

**Deal**: `dealname` ← "Signal — {Author Company}", `intent_level` ← Intent Level, `signal_category` ← Signal Category, `what_they_need` ← What They Need, `post_url` ← Post URL

---

## Step 8 — Outreach

### AI Column: `Outreach Draft`

**Prompt**:
```
Write a short email (under 80 words) for {First Name} at {Author Company}.

Context:
- They posted on LinkedIn about: {What They Need}
- Intent level: {Intent Level}
- Their role: {Buyer Role}

Rules:
- If HIGH intent: Be direct. They're looking for help — offer it. Mention you saw their post.
- If MID intent: Be helpful first. Share a quick insight related to their pain. Don't pitch hard.
- Sound like a real person, not a sales email
- No corporate jargon
- Short paragraphs, casual tone
- Subject line: reference their specific need

CTA:
- HIGH intent: "Happy to share how we've helped similar companies. Worth a quick chat?"
- MID intent: "Noticed this from your post — [insight]. Want me to share what's been working for teams like yours?"

Sign off with "– {{Your Name}}"
```

### LinkedIn Comment (for HIGH intent "recommendation request" posts)

If someone literally asks "who do you use for marketing?" — **comment on the post directly**. This is the highest-converting action because they asked publicly for recommendations.

Keep the comment:
- Helpful, not salesy
- Mention ONE specific result you've gotten for a similar client
- Offer to share more via DM

---

## Execution Checklist

1. **Define** your service, target buyer, and boolean queries
2. **Scrape** with Apify (last 14 days)
3. **Ingest** into Meerkats table
4. **Classify** — run AI columns: Intent Level, Signal Category, What They Need, Post Freshness
5. **Filter** — separate Hot Leads (HIGH) and Warm Leads (MID)
6. **Enrich** — run AI columns: First Name, Buyer Role, Company Domain, Email
7. **Dedup** on Post URL + Author Company
8. **Email lookup** for missing emails via `email-find-verify`
9. **Draft outreach** — run Outreach Draft AI column
10. **Export** to HubSpot or send directly

## Dependencies

- `email-find-verify` — missing email lookup
- `hubspot-integration` — CRM push (optional)
- **Apify** — LinkedIn Post Scraper (requires account)
