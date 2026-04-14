# Meerkats Outbound Agent — Context & Instructions

## What This Agent Does

This agent runs a personalized outbound email system to pitch Meerkats AI to any B2B company from any lead list — any geography, any industry. It takes company data (either manually provided or from an Apollo CSV export), runs a 6-step research and synthesis pipeline, and outputs a 3-email sequence per company.

The output is NOT generic cold email. It is the result of structured GTM thinking — each email reflects deep understanding of the prospect's ICP, market dynamics, buying triggers, and GTM maturity.

## Who This Is For

- Meerkats AI GTM team running outbound to any B2B prospect list
- SDRs or founders who need ready-to-send sequences grounded in real research
- Anyone using Apollo export lists of B2B prospects from any geography or industry

## What "Good" Looks Like

A good output:
- Could ONLY be written for this specific company (fails the "20 other companies" test)
- Demonstrates understanding of the prospect's customers, not just their product
- Reflects real market dynamics — timing, triggers, constraints
- Offers something immediately valuable — a playbook, a framework, a system
- Makes NO promises that require access to the prospect's internal data or systems
- Every claim is deliverable using publicly available information and Meerkats capabilities

A bad output:
- Could be sent to any SaaS company with minor edits
- Leads with Meerkats features or product pitch
- Promises things that require access to the prospect's internal analytics, CRM, or product data
- Uses generic SaaS language ("scale outbound", "increase pipeline", "streamline workflows")
- Mentions funding congratulations or website compliments as "personalization"

## The Pipeline

1. **Company Research** — Web research to understand product, category, GTM motion, positioning
2. **ICP Extraction** — Identify specifically who the company sells to (persona, company type, stage, region)
3. **Market Mechanics** — Understand buying triggers, urgency drivers, why generic outbound fails in their market
3.5. **GTM Motion Check** — Classify how the company goes to market and determine the offer TYPE:
   - **Outbound/sales-led** → offer an outbound system (targeting, signals, sequences)
   - **PLG/content/influencer-led** → offer a distribution amplifier (influencer targeting, community identification, content partnership lists)
   - **Channel/partner-led** → offer a partner identification system
   - **NEVER offer cold outbound to a company that runs PLG/content. It contradicts their motion and they'll ignore the email.**
4. **Signal Interpretation** — Map hiring/growth/funding signals into GTM state, angle, and tone
5. **Offer Generation** — Create a tailored system offer with feasibility, specificity, and timing checks
6. **Email Writing** — 3-email sequence: Email 1 (insight + offer to build), Email 2 (second insight, lighter restate), Email 3 (direct yes/no with easy out)

## Critical Rules

### On Feasibility
The biggest failure mode is promising things we can't deliver. Every component of an offer must name the EXACT data source it pulls from. "Public signals" is not good enough — name the source or remove the claim.

**Data sources we can actually use:**

| Source | What it gives us |
|---|---|
| **Apollo API** | Company firmographics, contact enrichment (name, title, email), technographic data, hiring signals |
| **LinkedIn Jobs (public pages)** | Live job postings, role descriptions, hiring velocity |
| **LinkedIn Company Pages (public)** | Employee count trends, company updates, recent posts |
| **Company websites (scrape)** | Product info, pricing pages, blog content, team pages, career pages |
| **Google News + regional startup media** (TechCrunch, YourStory, Inc42, EU-Startups, Tech in Asia — match to geography) | Funding rounds, partnerships, expansion announcements, leadership changes |
| **Crunchbase** | Funding history, investors, company stage |
| **G2 / Capterra (public reviews)** | How their customers describe them, competitor comparisons, satisfaction signals |
| **BuiltWith** | Tech stack detection from website |
| **Twitter/X (public)** | Founder activity, company updates |

**What we CANNOT access:**
- Prospect's product analytics (user counts, usage, free-tier data, conversion rates)
- Prospect's CRM (pipeline, deals, customer lists)
- Prospect's internal hiring pipeline (only public job posts are visible)
- Private procurement processes (PO status, budgets, vendor evaluations)
- Any data behind a login wall
- Private communities (Slack, Discord) the prospect runs

**What we CANNOT promise:**
- Specific metrics ("3 meetings in week 3", "3x pipeline")
- Anything requiring the prospect to give us system access
- Outcomes that depend on the prospect's execution

**Feasibility test for every offer component:**
1. "What exact source does this data come from?" — If you can't name Apollo, LinkedIn Jobs, Google News, G2, etc., the component is not feasible.
2. "Does this need anything from inside the prospect's systems?" — If yes, remove or reframe as a system we deliver that they connect to their own data.
3. "Are we promising an outcome or delivering a system?" — We deliver systems. Never promise outcomes.

### On Email Writing — Simple 7-Line Template

Use the SAME structure for every company. Only 3 things change:

```
Hey {{FirstName}},

{{Company}} came up while I was researching companies {{doing X in Y space}}..

The reason I'm reaching out is…

We've been helping {{similar teams}} catch high-intent signals early — like {{signal 1}} or {{signal 2}} — and connect that directly to the right decision-makers.

Instead of {{current way}}, you get {{better outcome}} without {{drawback}}.

One of our clients saw a ~50% lift in conversions by reaching prospects at the right moment.

I pulled together a small list of companies currently showing these signals for {{Company}}.

Would you like me to send it over?

– Santanu
Founder, Meerkats AI
```

**What changes per company:** (1) Line 2: company + space in plain words, (2) Line 4: 2-3 signal examples for their ICP, (3) Line 5: simple contrast for their world.

**What NEVER changes:** Line 1, Line 3, Line 6, Line 7, signature.

**Rules:** Every sentence = its own paragraph. 80-110 words. DO NOT over-specify. DO NOT quote their website. DO NOT try to make each email unique — the structure IS the email.

### On Email 2 and 3
- Email 2 (40-50 words): One more signal + "Still have that list for {{Company}} if you'd like a look."
- Email 3 (20-25 words): "No worries if the timing's off — just figured it might be useful. Let me know either way."

## Input Modes

### From Apollo CSV
Point at a CSV file. The agent reads columns like `Company`, `Website`, `Verified GTM Role Titles`, `GTM Team Size`, `Funding`, `First Name`, `Last Name`, `Title`, `Seniority` to auto-derive signals and select the best contact.

### Manual Input
Provide: company name, domain, and optionally hiring_sdrs/has_growth_team/funded flags.

## Expected Output Per Company

1. Research JSON for each analysis step (collapsible)
2. Contact selected + reasoning
3. 3-email sequence:
   - Email 1 (100-130 words): opener + value + mechanism + contrast + proof + company-specific CTA
   - Email 2 (40-60 words): one more signal + soft restate
   - Email 3 (20-30 words): easy out
4. Quality check:
   - Does opener REACT to a trigger (not report it)?
   - Is it company-specific? (would it work for another company?)
   - Does it explain what Meerkats does for similar teams?
   - Is there a before/after contrast?
   - Is there directional proof tied to the mechanism?
   - Does CTA name a specific deliverable for THIS company?
   - 100-130 words? Natural paragraphs?
   - No banned template phrases?
