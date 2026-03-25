---
name: saas-churn-signal-detection
description: "Use when the user wants to detect SaaS tool-switching signals from LinkedIn posts — founders, ops leads, and small team leads asking for recommendations, complaining about pricing, outgrowing current tools, or announcing switches. Optimized for early-stage SaaS products targeting SMBs/SMEs. Trigger on phrases like 'competitor churn signals,' 'tool switching leads,' 'SaaS replacement pipeline,' 'alternative seekers,' 'pricing frustration signals,' 'recommendation requests,' 'outgrown tools,' or 'churn signal detection.' Covers the full workflow: Apify LinkedIn scraping, Meerkats AI-powered intent classification, lead enrichment, deduplication, HubSpot CRM export, and outreach sequence generation."
metadata:
  version: 2.0.0
---

# SaaS Tool-Switch Signal Detection for SMBs

You are an expert in detecting high-intent SaaS tool-switching signals from LinkedIn posts, specifically from **SMB/SME buyers** — founders, ops leads, and small team managers who buy tools differently than enterprises.

**How SMBs buy tools differently**:
- They ask their network: "What do you all use for X?"
- They complain publicly: "X just raised prices, any alternatives?"
- They outgrow tools: "We've outgrown spreadsheets, need a real X"
- Decisions are fast — one founder conversation, not a 6-month procurement cycle
- Price sensitivity is HIGH — "too expensive for a 10-person team" is the #1 churn signal
- The person posting IS usually the decision-maker (founder, CEO, head of ops)

**Tool stack**: Apify (LinkedIn scraping) → Meerkats.ai tables + AI columns (classification, enrichment, filtering, dedup) → HubSpot (CRM) → Email/LinkedIn (outreach).

## Objective

- **Target Segment**: SMBs/SMEs (5-200 employees) actively looking to switch, replace, or adopt a new tool in your product category
- **Goal**: Detect tool-switching signals → classify urgency → enrich → push to CRM → trigger founder-to-founder style outreach
- **Success Metric**: Demo requests and trial signups from prospects already in a buying window

## When to Use This Skill

- Detecting signals that small companies are unhappy with or switching from a competitor
- Finding founders/leaders asking their network for tool recommendations
- Identifying pricing-driven churn from competitors
- Catching "outgrown current tool" signals
- Building qualified pipeline of SMBs in active evaluation mode
- Generating personalized, casual outreach that feels like a peer recommendation

## Customization — Define Your Product & Competitors

Before running this pipeline, the user MUST define:

1. **Your product name**: e.g., "Meerkats.ai"
2. **Competitor list**: 3-10 competitor tools to monitor (e.g., "Clay", "Apollo", "ZoomInfo")
3. **Product category**: What your tool does in plain language (e.g., "lead enrichment", "CRM", "email marketing", "project management")
4. **Your sweet spot**: Company size and type you serve best (e.g., "startups and agencies under 100 people")

Placeholders used throughout: `{{your_product}}`, `{{competitor_1}}`, `{{competitor_2}}`, `{{competitor_3}}`, `{{product_category}}`, `{{sweet_spot}}`

## Pipeline Overview

| Step | Action | Tool | Output |
|------|--------|------|--------|
| 1 | Scrape LinkedIn posts (boolean queries) | **Apify** (LinkedIn Post Scraper) | Raw posts with author data |
| 2 | Ingest into table | **Meerkats** table (Input columns) | Structured rows |
| 3 | Classify switching intent | **Meerkats** AI columns | Intent type + signal strength |
| 4 | Filter qualified signals | **Meerkats** filter_table_rows | Qualified SMB leads |
| 5 | Enrich contact/company data | **Meerkats** AI columns | Email, role, first name, competitor |
| 6 | Deduplicate | **Meerkats** check/delete_duplicate_rows | Clean dataset |
| 7 | Push to CRM | **HubSpot** | Company + Contact + Deal |
| 8 | Generate outreach | **Meerkats** AI columns | Casual email sequences |

---

## Step 1 — Signal Capture (Apify)

Apify scrapes **LinkedIn feed posts** where real people discuss tools, ask for recommendations, or vent frustrations. At SMBs, these posts are often from founders or team leads asking their network directly.

### SMB-Specific Signal Types

SMBs don't post formal RFP announcements. Their signals look like this:

| Signal Type | What It Looks Like | Why It Matters |
|---|---|---|
| Recommendation request | "What do you use for X? Looking to switch from Y" | Highest intent — actively shopping |
| Price frustration | "Y just raised prices again" / "too expensive for our team" | Price is #1 SMB churn driver |
| Outgrown current tool | "We've outgrown spreadsheets" / "need something more than Y" | Ready to upgrade — budget exists |
| Feature frustration | "Y doesn't support X" / "missing basic features" | Specific pain = easy to address |
| Public switch | "Just moved from Y to Z — best decision" | Too late for this lead, but validates the trend |
| Tool recommendation thread | "What's the best X for small teams?" | Multiple prospects in the comments |

### Keyword Strategy

Feed these boolean queries into Apify's LinkedIn Post Scraper.

**Core Signal Keywords**:

| Category | Keywords |
|----------|----------|
| Asking for recs | "what do you use for", "any recommendations", "suggest a tool", "best tool for" |
| Price pain | "too expensive", "raised prices", "pricing is crazy", "can't afford", "cheaper alternative" |
| Outgrowing | "outgrown", "need something better", "looking for something more", "scaling beyond" |
| Switching | "switching from", "moving away from", "replacing", "ditching" |
| Frustration | "frustrated with", "struggling with", "hate using", "worst part about" |
| Small team context | "small team", "startup", "growing team", "lean team", "bootstrap" |

**High-Intent Boolean Queries** (use as Apify search input):

```
("what do you use for" OR "any recommendations for" OR "suggest a tool" OR "best tool for") AND ({{product_category}} OR {{competitor_1}} OR {{competitor_2}})
("too expensive" OR "raised prices" OR "pricing" OR "cheaper alternative") AND ({{competitor_1}} OR {{competitor_2}} OR {{competitor_3}})
("switching from" OR "moving away from" OR "replacing" OR "ditching") AND ({{competitor_1}} OR {{competitor_2}} OR {{competitor_3}})
("frustrated with" OR "struggling with" OR "hate using" OR "worst part about") AND ({{competitor_1}} OR {{competitor_2}} OR {{competitor_3}})
("outgrown" OR "need something better" OR "scaling beyond") AND ({{product_category}} OR {{competitor_1}} OR {{competitor_2}})
("small team" OR "startup" OR "lean team") AND ({{product_category}}) AND ("looking for" OR "recommend" OR "alternative")
```

**Example** (if you sell lead enrichment and your competitors are Clay, Apollo, ZoomInfo):

```
("what do you use for" OR "any recommendations for" OR "best tool for") AND ("lead enrichment" OR "Clay" OR "Apollo")
("too expensive" OR "raised prices" OR "cheaper alternative") AND (Clay OR Apollo OR ZoomInfo)
("switching from" OR "moving away from" OR "ditching") AND (Clay OR Apollo OR ZoomInfo)
("frustrated with" OR "struggling with") AND (Clay OR Apollo OR ZoomInfo)
("outgrown" OR "need something better") AND ("lead enrichment" OR "prospecting" OR Clay OR Apollo)
("small team" OR "startup") AND ("lead enrichment" OR "prospecting") AND ("looking for" OR "recommend" OR "alternative")
```

### Freshness Rule

**CRITICAL**: Only ingest posts from the last 14 days. SMBs decide fast — a 3-week-old post means they've probably already picked a tool.

- Configure Apify's date range filter to the last 14 days.
- When ingesting rows, skip any post where `post_date` is older than 14 days.
- The `Post Age Check` AI column (Step 3) acts as a safety net.

### Apify Configuration

```json
{
  "searchQueries": [
    "(\"what do you use for\" OR \"any recommendations for\" OR \"best tool for\") AND ({{product_category}} OR {{competitor_1}} OR {{competitor_2}})",
    "(\"too expensive\" OR \"raised prices\" OR \"cheaper alternative\") AND ({{competitor_1}} OR {{competitor_2}} OR {{competitor_3}})",
    "(\"switching from\" OR \"moving away from\" OR \"ditching\") AND ({{competitor_1}} OR {{competitor_2}} OR {{competitor_3}})",
    "(\"frustrated with\" OR \"struggling with\") AND ({{competitor_1}} OR {{competitor_2}} OR {{competitor_3}})",
    "(\"outgrown\" OR \"need something better\") AND ({{product_category}} OR {{competitor_1}})",
    "(\"small team\" OR \"startup\") AND ({{product_category}}) AND (\"looking for\" OR \"recommend\")"
  ],
  "maxResults": 500,
  "dateRange": "past-14-days"
}
```

### Apify Output Fields

| Apify Field | Description |
|-------------|-------------|
| `post_url` | URL of the LinkedIn post |
| `post_text` | Full text content of the post |
| `author_name` | Name of the person who posted |
| `author_linkedin_url` | LinkedIn profile URL of the author |
| `author_company` | Company name from the author's profile |
| `author_info` | Author's headline/role from their profile |
| `post_date` | When the post was published |

### Execution

1. Replace all `{{placeholder}}` values with your actual product, competitors, and category.
2. Configure and run the Apify LinkedIn Post Scraper with the boolean queries.
3. Set the date range to the last 14 days.
4. Download/export the Apify results.
5. **Discard any result where `post_date` is older than 14 days.**
6. Create a Meerkats table and bulk-add the results as rows.

---

## Step 2 — Ingest into Meerkats Table

```
Use mcp tool: create_table
  name: "Tool Switch Signals — {{your_product}} — {date}"
```

**Input columns to add** (mapped from Apify output):

| Column Name | Data Type | Type | Apify Source Field |
|-------------|-----------|------|--------------------|
| Post URL | url | Input | `post_url` |
| Post Text | text | Input | `post_text` |
| Author Name | text | Input | `author_name` |
| Author LinkedIn | url | Input | `author_linkedin_url` |
| Author Company | text | Input | `author_company` |
| Author Info | text | Input | `author_info` |
| Post Date | date | Input | `post_date` |

Use `add_table_rows_bulk` to load all scraped posts at once.

---

## Step 3 — Intent Classification (Meerkats AI Columns)

### AI Column: `Intent Type`

**Prompt**:
```
Analyze the LinkedIn post in {Post Text} and classify the tool-related intent into exactly one category. We are targeting SMBs looking to switch or adopt tools.

- ASKING_FOR_RECS: Person is asking their network for tool recommendations. "What do you all use for X?", "Any recommendations for a good X?", "Looking for a tool that does X". This is the highest-intent SMB signal — they are actively shopping.
- PRICE_CHURN: Person is complaining about pricing, cost increases, or affordability of a tool. "X just raised prices", "too expensive for our team", "can't justify the cost". Price is the #1 SMB switching trigger.
- OUTGROWING_TOOL: Person says they've outgrown their current tool or need something more powerful. "Outgrown spreadsheets", "need something more robust than X", "X doesn't scale". They have budget and need — ready to buy.
- ACTIVE_SWITCHING: Person is currently switching or has decided to switch. "Moving away from X", "replacing X with something else", "in the process of migrating from X". Immediate opportunity.
- FRUSTRATED: Person is venting about a tool but hasn't committed to switching. "Frustrated with X", "X is so buggy", "worst part about X". Pain is real — they need a nudge.
- RECENTLY_SWITCHED: Person already completed a switch. "Just moved from X to Y", "finally ditched X". Too late for this deal, but useful intel.
- NOT_RELEVANT: Mentions a tool but no switching/frustration/evaluation signal. Tutorials, feature announcements, job posts, or praise for the tool.

Return ONLY the category name.
```

### AI Column: `Signal Strength`

**Prompt**:
```
Based on {Post Text} and {Intent Type}, assign a signal strength for an early-stage SaaS targeting SMBs:

- VERY_HIGH: ASKING_FOR_RECS or ACTIVE_SWITCHING — they are actively shopping or switching RIGHT NOW. Highest urgency.
- HIGH: PRICE_CHURN or OUTGROWING_TOOL — strong pain that will lead to switching soon. The trigger event has happened.
- MEDIUM: FRUSTRATED — pain exists but no action yet. Worth reaching out but lower conversion probability.
- LOW: RECENTLY_SWITCHED — already made their choice. Useful for intel, not direct outreach.
- NONE: NOT_RELEVANT — no signal.

Return ONLY: "VERY_HIGH", "HIGH", "MEDIUM", "LOW", or "NONE".
```

### AI Column: `Competitor Mentioned`

**Prompt**:
```
From {Post Text}, identify which specific tool(s) the person is discussing, frustrated with, switching from, or asking about alternatives to.

Return the tool name(s) as a comma-separated list. Examples: "Clay", "Apollo, ZoomInfo", "Monday.com".

If they're asking a general recommendation question without naming a specific tool (e.g., "best CRM for startups?"), return "GENERAL_CATEGORY".
If no tool or category is relevant, return "UNSPECIFIED".
```

### AI Column: `Switching Trigger`

**Prompt**:
```
From {Post Text}, extract the specific reason driving their tool search or frustration. Focus on SMB-relevant triggers:

Examples:
- "Pricing increased 3x on renewal"
- "Too complex for a 10-person team"
- "Missing integration with Slack"
- "No API, can't automate workflows"
- "Support is non-existent at our plan tier"
- "Outgrown spreadsheets, need real tool"
- "Free tier too limited, paid tier too expensive"
- "Forced into enterprise plan we don't need"

If no clear trigger is stated, return "Not specified".

Keep the response under 15 words.
```

### AI Column: `Is SMB Buyer`

**Prompt**:
```
Based on {Author Info}, {Author Company}, and {Post Text}, determine if this person is likely from an SMB/SME (under 200 employees) and is a tool decision-maker.

SMB buyer signals — answer YES if ANY of these are true:
- Title contains: Founder, Co-founder, CEO, COO, CTO, Owner, Head of, Director, Manager (at a small/unknown company)
- Author Info mentions: "startup", "growing team", "small business", "agency", "consulting", "freelance"
- Post references: "our small team", "we're a X-person company", "as a startup", "bootstrap"
- Company is not a well-known large enterprise (not Fortune 500, not 1000+ employee brand names)

NOT an SMB buyer — answer NO if:
- Person is at a well-known enterprise (Google, Salesforce, Amazon, etc.)
- Title is clearly enterprise-level IC (they don't buy tools)
- Post context is about enterprise-scale problems ("our 5000 sales reps", "across 50 offices")
- Person is a content creator / influencer reviewing tools editorially

Return "YES" or "NO".
```

### AI Column: `Post Age Check`

**Prompt**:
```
Today's date is {{current_date}}. The post date is {Post Date}.

If the post is older than 14 days, return "STALE". If 14 days or fewer, return "FRESH".

Return ONLY "FRESH" or "STALE".
```

### AI Column: `Thread Opportunity`

**Prompt**:
```
From {Post Text}, determine if this post is likely a recommendation thread where MULTIPLE people are asking or answering about tools. These are goldmine posts because:
- The original poster is a lead
- Commenters who agree with the frustration are also leads
- People recommending alternatives reveal competitor landscape

Indicators of a thread opportunity:
- Questions like "What do you all use for X?"
- "Drop your recommendations below"
- "Curious what others are doing"
- High engagement signals in the text

Return "YES" if this is likely a multi-prospect thread, "NO" if it's a single-person post.
```

---

## Step 4 — Filter Qualified Leads

**Filter criteria** (ALL must be true):

- `Post Age Check` = "FRESH"
- `Signal Strength` IN ("VERY_HIGH", "HIGH", "MEDIUM")
- `Intent Type` NOT "NOT_RELEVANT" and NOT "RECENTLY_SWITCHED"
- `Is SMB Buyer` = "YES"

Use `filter_table_rows` or create a Meerkats sheet called **"Qualified Signals"**.

**Separate sheets for different use cases**:

| Sheet | Filter | Use |
|-------|--------|-----|
| **Hot Leads** | VERY_HIGH signal + ASKING_FOR_RECS or ACTIVE_SWITCHING | Immediate personal outreach |
| **Warm Leads** | HIGH signal + PRICE_CHURN or OUTGROWING_TOOL | Outreach within 24-48 hours |
| **Nurture** | MEDIUM signal + FRUSTRATED | Add to drip campaign |
| **Thread Mining** | Thread Opportunity = YES (any signal strength) | Mine comments for additional leads |

---

## Step 5 — Contact & Company Enrichment (Meerkats AI Columns)

### AI Column: `Contact First Name`

**Prompt**:
```
Extract ONLY the first name from {Author Name}.

Examples:
- "Sarah Johnson" → "Sarah"
- "Dr. Michael Chen" → "Michael"
- "Jennifer Smith-Rodriguez" → "Jennifer"

Return ONLY the first name.
```

### AI Column: `Buyer Role`

**Prompt**:
```
Based on {Author Info} and {Author Company}, categorize this SMB buyer's role:

- "Founder / CEO" — runs the company, buys everything
- "Ops / RevOps" — manages tools and workflows
- "Marketing" — manages marketing stack
- "Sales" — manages sales tools
- "Engineering / Product" — manages dev/product tools
- "Agency Owner" — runs a service business, buys tools for clients too
- "Other" — doesn't fit above

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

For SMBs, the company name often IS the domain. Examples:
- "Acme Agency" → "acmeagency.com"
- "GrowthHit" → "growthhit.com"
- "Lemon Squeezy" → "lemonsqueezy.com"

If you cannot determine the domain, return "UNKNOWN".

Return ONLY the domain.
```

> **For leads where email is NOT_FOUND**: Use the `email-find-verify` skill with `{Author Name}` + `{Company Domain}`.

---

## Step 6 — Deduplication

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

| Condition | Action | Priority |
|-----------|--------|----------|
| VERY_HIGH + Founder/CEO or Ops | Immediate — DM or email within hours | P1 |
| HIGH + any SMB buyer role | Fast — outreach within 24h | P2 |
| MEDIUM + any SMB buyer | Nurture — add to drip | P3 |
| Thread Opportunity = YES | Mine the comments for more leads | P1 (for thread mining) |

### AI Column: `Outreach Priority`

**Prompt**:
```
Based on {Signal Strength}, {Intent Type}, {Is SMB Buyer}, and {Buyer Role}, assign an outreach priority:

- P1_NOW: Signal is VERY_HIGH (ASKING_FOR_RECS or ACTIVE_SWITCHING) and buyer is "Founder / CEO" or "Ops / RevOps" or "Agency Owner". These people are deciding THIS WEEK.
- P2_FAST: Signal is HIGH (PRICE_CHURN or OUTGROWING_TOOL) and Is SMB Buyer = YES. Strong pain, will switch soon.
- P3_NURTURE: Signal is MEDIUM (FRUSTRATED) and Is SMB Buyer = YES. Pain exists but needs warming up.
- SKIP: Signal is LOW or NONE, or Is SMB Buyer = NO.

Return ONLY the priority code.
```

---

## Step 8 — CRM Export (HubSpot)

**Company object**:
- `name` ← Author Company
- `company_size` ← "SMB" (or estimated from context)
- `current_tool` ← Competitor Mentioned (custom property)

**Contact object**:
- `firstname` ← Contact First Name
- `lastname` ← (extracted from Author Name)
- `linkedin_url` ← Author LinkedIn
- `email` ← Email
- `jobtitle` ← Author Info
- `buyer_role` ← Buyer Role

**Deal object**:
- `dealname` ← "Switch Signal — {Author Company} — from {Competitor Mentioned}"
- `signal_type` ← Intent Type
- `competitor` ← Competitor Mentioned
- `switching_trigger` ← Switching Trigger
- `post_url` ← Post URL
- `priority` ← Outreach Priority

> Use the `hubspot-integration` skill for CRM push, or export the table.

---

## Step 9 — Email Outreach Sequence

### SMB Outreach Philosophy

SMB outreach must feel like a **peer recommendation**, not a sales pitch. These people get pitched constantly. What works:
- Sound like a founder talking to a founder
- Reference their EXACT post and pain
- Be genuinely helpful — even if they don't buy your product
- Short emails — SMB buyers don't read long ones
- Quick path to trying the product (free trial > demo call for SMBs)

### Target Personas

- Founders / CEOs asking for recs
- Ops leads frustrated with current tools
- Agency owners looking for client tools
- Marketing / Sales leads at small teams

### Sequence Overview

| Step | Day | Goal |
|------|-----|------|
| Email 1 | Day 0 | Helpful reply — answer their question, don't pitch |
| Email 2 | Day 2 | Quick value — what similar teams did |
| Email 3 | Day 5 | Offer — try it free, no call needed |
| Email 4 | Day 9 | Breakup — one last nudge |

> **Note**: 4 emails, not 5. SMBs have shorter attention spans and hate long sequences.

### AI Column: `Email 1 Draft`

**Prompt**:
```
Write a very short cold email (under 80 words) for {Contact First Name} at {Author Company}.

Context: They posted on LinkedIn about {Intent Type} regarding {Competitor Mentioned}. Their specific trigger: {Switching Trigger}. They are an SMB buyer with role: {Buyer Role}.

CRITICAL RULES for SMB outreach:
- Sound like a peer/founder, NOT a salesperson
- Reference their exact post and pain point
- Do NOT pitch your product in this email
- Do NOT use corporate language ("leverage", "synergize", "touch base")
- Keep it casual — like a LinkedIn DM, not a formal email

Structure:
- Subject line: Casual, reference their post. Example: "saw your post about {Competitor Mentioned}"
- Opening: "Hey {Contact First Name}" — acknowledge you saw their post
- Middle: Share ONE helpful insight or tip related to their frustration. Be genuinely useful.
- Close: Ask a simple question about what matters most to them in a tool

Sign off with just "– {{Your Name}}" (no title, no company, no links)
```

### AI Column: `Email 2 Draft`

**Prompt**:
```
Write a follow-up email (under 70 words) for {Contact First Name}.

Theme: Quick story about a similar-sized team that had the same {Switching Trigger} problem. What did they do? What changed?

Do NOT name {{your_product}} yet. Say "a tool" or "a different approach".

Keep it conversational. One short paragraph max.

Subject line: "re: {Competitor Mentioned}"
Sign off with "– {{Your Name}}"
```

### AI Column: `Email 3 Draft`

**Prompt**:
```
Write a trial-offer email (under 70 words) for {Contact First Name}.

NOW mention {{your_product}} by name. Connect their specific pain ({Switching Trigger}) to one concrete thing {{your_product}} does differently.

The CTA should be LOW FRICTION for SMBs:
- "Here's a free trial link" (NOT "let's schedule a 30-minute demo")
- "Try it and see if it fits" (NOT "I'd love to walk you through it")
- Make it easy to say yes without a calendar commitment

Subject line: "quick option for the {Competitor Mentioned} thing"
Sign off with "– {{Your Name}}"
```

### LinkedIn Outreach (Preferred for P1 leads)

For VERY_HIGH signals (especially ASKING_FOR_RECS), **LinkedIn comment/DM is better than email**. The person posted publicly asking for recs — they WANT answers.

| Step | Action | Tone |
|------|--------|------|
| Comment on post | Answer their question genuinely. Mention {{your_product}} as ONE option alongside others. Don't be the person who only pushes their own product. | Helpful community member |
| Connect request | "Hey {Contact First Name} — saw your post about {Competitor Mentioned}. We built {{your_product}} to solve exactly that. Happy to chat if useful!" | Casual, founder-to-founder |
| DM follow-up | Share a free trial link or a quick Loom video showing how your tool handles their specific pain | Helpful, async-friendly |

---

## Conversion Factors

| Factor | Impact | SMB-Specific Note |
|--------|--------|-------------------|
| Speed — responding within hours | Decisive | SMBs decide in days, not months |
| LinkedIn comment on rec posts | Very high | They literally asked for suggestions |
| Free trial > demo call | Critical | SMBs want to try, not sit through demos |
| Founder-to-founder tone | High | Peer credibility beats sales polish |
| Referencing their exact post | High | Proves you're not mass-blasting |
| Price positioning | High | Show you're affordable for small teams |

---

## Execution Checklist

1. **Configure**: Define your product, 3-10 competitors, product category, and SMB sweet spot
2. **Scrape**: Run Apify LinkedIn Post Scraper with boolean queries (last 14 days)
3. **Ingest**: Create Meerkats table and bulk-add Apify results
4. **Classify**: Add AI columns (Intent Type, Signal Strength, Competitor Mentioned, Switching Trigger, Is SMB Buyer, Post Age Check, Thread Opportunity) and run them
5. **Filter**: Filter to qualified SMB signals (FRESH + VERY_HIGH/HIGH/MEDIUM + SMB buyer)
6. **Enrich**: Add enrichment AI columns (Contact First Name, Buyer Role, Email, Company Domain) and run them
7. **Deduplicate**: Run dedup on Post URL + Author Company
8. **Qualify**: Add Outreach Priority AI column and run it
9. **Thread Mining**: For Thread Opportunity = YES posts, manually review comments for additional leads
10. **Email Lookup**: For leads with no email, use `email-find-verify` skill
11. **Outreach**: Add email draft AI columns and run them. For P1 leads, prefer LinkedIn comment/DM first.
12. **Export**: Push to CRM via `hubspot-integration` skill or export table

## Dependencies on Other Skills

- `email-find-verify` — for finding missing email addresses
- `hubspot-integration` — for CRM push (optional)

## External Tool Dependencies

- **Apify** — LinkedIn Post Scraper actor for signal capture. Requires Apify account and API key.

## Output

After running the full pipeline, deliver:
- Total posts scraped from Apify
- Breakdown by intent type (asking for recs, price churn, outgrowing, etc.)
- Number of qualified leads by priority tier (P1/P2/P3)
- Top competitors mentioned (frequency count)
- Top switching triggers (frequency count)
- Thread opportunities identified (for comment mining)
- Meerkats table link with all enriched data
- Email drafts ready for review
- CRM export summary (if applicable)
