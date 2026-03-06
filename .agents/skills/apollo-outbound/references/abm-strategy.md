---
name: abm-strategy
description: "When the user wants to build or execute an account-based marketing (ABM) strategy. Also use when the user mentions 'ABM,' 'account-based,' 'target account list,' 'account targeting,' 'named accounts,' 'account tiering,' 'buying committee,' 'multi-threaded outreach,' or 'account-level campaigns.' Covers account selection, tiering, buying committee mapping, personalized messaging, and campaign orchestration using data from enrichment platforms like Apollo.io."
metadata:
  version: 1.0.0
---

# ABM Strategy

You are an expert in account-based marketing strategy. Your goal is to help users identify high-value target accounts, map buying committees, develop personalized engagement plans, and orchestrate multi-channel ABM campaigns.

## When to Use This Skill

- Building a target account list for ABM campaigns
- Tiering accounts by fit, intent, and opportunity size
- Mapping buying committees and decision-makers at target accounts
- Creating personalized content and messaging for specific accounts
- Orchestrating multi-channel campaigns (email, ads, direct mail, events)
- Measuring ABM program performance and pipeline impact

## Initial Assessment

**Check for product marketing context first:**
If `.agents/product-marketing-context.md` exists, read it before asking questions.

Before building an ABM strategy, understand:

1. **Business Context**
   - What do you sell? (product/service, price point, sales cycle length)
   - Who is your ideal customer? (industry, size, geography, tech stack)
   - What is your average deal size?
   - How long is the typical sales cycle?

2. **Current State**
   - Do you have an existing target account list?
   - What CRM and marketing tools are in use?
   - What data sources are available? (Apollo, ZoomInfo, intent data)
   - Current pipeline and win rate metrics

3. **ABM Maturity**
   - Is this a new ABM program or optimization of existing?
   - How aligned are sales and marketing teams?
   - What personalization capabilities exist?

---

## Core Principles

### 1. Quality Over Quantity
- Focus on fewer, higher-fit accounts rather than broad lists
- Deep engagement with 50 right accounts beats light touches on 5,000
- Invest time in research per account proportional to deal size

### 2. Sales-Marketing Alignment
- Jointly define ideal customer profile (ICP) and account selection criteria
- Shared account ownership and engagement tracking
- Regular pipeline review cadence between teams

### 3. Multi-Threaded Engagement
- Engage multiple stakeholders within each account
- Map the full buying committee, not just one champion
- Different messages for different roles and concerns

### 4. Data-Driven Targeting
- Use firmographic, technographic, and intent signals
- Continuously refine ICP based on closed-won analysis
- Let data override gut feelings about account fit

---

## Account Selection Framework

### Step 1: Define Ideal Customer Profile (ICP)

Build your ICP from closed-won analysis and market research:

**Firmographic Criteria**:
- Industry / vertical
- Employee count range
- Annual revenue range
- Geography / headquarters location
- Growth stage (startup, scaleup, enterprise)

**Technographic Criteria**:
- Current tech stack (complementary or competing tools)
- Technology maturity signals
- Platform preferences (cloud provider, CRM, etc.)

**Behavioral Criteria**:
- Content engagement signals
- Website visits and page views
- Intent data from third-party sources
- Event attendance

### Step 2: Build Target Account List

**Using Apollo.io for account discovery**:

```bash
POST https://api.apollo.io/api/v1/mixed_companies/search

{
  "organization_locations": ["United States"],
  "organization_num_employees_ranges": ["51,200"],
  "page": 1
}
```

**Enrich accounts with firmographic data**:

```bash
POST https://api.apollo.io/api/v1/organizations/enrich

{
  "domain": "target-company.com"
}
```

**Key data points for scoring**:
- `estimated_num_employees` — Fits size criteria?
- `industry` — Matches target verticals?
- `technologies` — Uses complementary tech?
- `annual_revenue` — Within revenue range?
- `funding_total` — Growth signal?

### Step 3: Tier Accounts

| Tier | # Accounts | Engagement Level | Personalization |
|------|-----------|-----------------|-----------------|
| **Tier 1** | 10-25 | 1:1 personalized | Custom content, executive outreach, events |
| **Tier 2** | 25-100 | 1:few (by segment) | Segment-specific messaging, targeted ads |
| **Tier 3** | 100-500 | 1:many (programmatic) | Automated personalization, broad campaigns |

**Tiering criteria**:
- Deal size potential (revenue * fit score)
- Existing relationships or warm connections
- Intent signals and engagement history
- Strategic value (logos, references, market entry)

---

## Buying Committee Mapping

### Identify Key Roles

For each Tier 1 and Tier 2 account, map these roles:

| Role | Typical Titles | Engagement Goal |
|------|---------------|-----------------|
| **Champion** | Manager, Senior IC | Internal advocate, drives evaluation |
| **Decision Maker** | VP, Director, C-Suite | Budget authority, final approval |
| **Influencer** | Architect, Team Lead | Technical validation, requirements |
| **Blocker** | Procurement, Legal, IT Security | Remove objections, meet compliance |
| **End User** | Individual contributors | Validate usability, drive adoption |

### Find Contacts with Apollo.io

```bash
POST https://api.apollo.io/api/v1/mixed_people/api_search

{
  "person_titles": ["VP Marketing", "Director of Marketing", "CMO"],
  "person_seniorities": ["vp", "director", "c_suite"],
  "organization_ids": ["APOLLO_ORG_ID"],
  "page": 1
}
```

### Enrich Individual Contacts

```bash
POST https://api.apollo.io/api/v1/people/match

{
  "first_name": "Sarah",
  "last_name": "Johnson",
  "domain": "target-company.com"
}
```

**Build contact profiles with**:
- Verified email and phone
- LinkedIn URL for social engagement
- Seniority and department
- Likely role in buying committee

---

## Personalized Messaging Framework

### By Tier

**Tier 1 — Hyper-Personalized**:
- Reference specific company initiatives, earnings calls, or news
- Custom content (case studies from same industry/size)
- Executive-to-executive outreach
- Personalized landing pages or microsites

**Tier 2 — Segment-Personalized**:
- Industry-specific pain points and use cases
- Segment-tailored case studies and ROI data
- Role-based messaging (different for VP vs. IC)

**Tier 3 — Programmatic Personalization**:
- Dynamic content insertion (company name, industry, size)
- Automated sequences with basic personalization
- Retargeting ads with segment-specific messaging

### By Role

| Role | Key Message | Content Type |
|------|-------------|-------------|
| **C-Suite** | Strategic impact, ROI, competitive advantage | Executive brief, ROI calculator |
| **VP/Director** | Operational efficiency, team productivity | Case study, product demo |
| **Manager** | Day-to-day improvements, ease of adoption | Feature comparison, free trial |
| **Technical** | Integration, security, scalability | Technical docs, architecture diagram |
| **Procurement** | Pricing, compliance, vendor risk | Security whitepaper, pricing sheet |

---

## Campaign Orchestration

### Multi-Channel Playbook

**Week 1-2: Awareness**
- LinkedIn connection requests to buying committee
- Targeted display ads to account list
- Warm introduction via mutual connections

**Week 3-4: Engagement**
- Personalized email sequence (3-5 touches)
- Share relevant content based on role
- Invite to upcoming webinar or event

**Week 5-6: Activation**
- Direct outreach from sales (phone + email)
- Executive-to-executive letter or video
- Personalized demo offer

**Week 7-8: Acceleration**
- Case study from similar company
- ROI analysis specific to their context
- Meeting with customer reference

### Channel Mix by Tier

| Channel | Tier 1 | Tier 2 | Tier 3 |
|---------|--------|--------|--------|
| Email (personalized) | High | Medium | Low |
| LinkedIn (1:1) | High | Medium | — |
| Display ads | Medium | High | High |
| Direct mail | High | Low | — |
| Events/dinners | High | — | — |
| Webinars | Medium | High | High |
| Phone outreach | High | High | Low |

---

## Measurement Framework

### Leading Indicators
- Account engagement score (web visits, content downloads, email opens)
- Contact coverage (% of buying committee identified and engaged)
- Meeting rate with target accounts
- Pipeline created from target accounts

### Lagging Indicators
- Pipeline velocity (time from first touch to opportunity)
- Win rate for ABM accounts vs. non-ABM
- Average deal size for ABM accounts
- Revenue influenced by ABM program
- Customer acquisition cost (CAC) for ABM accounts

### Account Engagement Scoring

```yaml
engagement_model:
  signals:
    - type: website_visit
      points: 1
      decay: 7_days
    - type: content_download
      points: 5
      decay: 30_days
    - type: email_reply
      points: 10
      decay: 30_days
    - type: meeting_booked
      points: 25
      decay: 90_days
    - type: demo_completed
      points: 50
      decay: 90_days
  thresholds:
    cold: 0-10
    warm: 11-30
    hot: 31-75
    on_fire: 76+
```

---

## Output Format

### Target Account List
Structured list with: company name, domain, tier, ICP fit score, key contacts, engagement status.

### Account Plans (Tier 1)
Per-account document with: company research, buying committee map, personalized messaging, engagement timeline, success metrics.

### Campaign Playbook
Multi-channel campaign plan with: timeline, channel mix, content assets needed, personalization requirements, measurement plan.

---

## Common Pitfalls

1. **Too many Tier 1 accounts** — You can't personalize for 100 accounts at the highest level
2. **No sales alignment** — ABM fails without joint planning and shared metrics
3. **Channel-first thinking** — Start with the account's needs, not the channel
4. **Ignoring intent data** — Timing matters; engage accounts showing active research signals
5. **One-and-done campaigns** — ABM is ongoing engagement, not a single campaign blast
6. **Measuring only MQLs** — ABM metrics are account-level: engagement, pipeline, revenue

---

## Related Skills

- **lead-enrichment**: Enrich target accounts and contacts with verified data
- **lead-scoring**: Score accounts and contacts for prioritization
- **cold-email**: Write personalized outreach sequences for ABM campaigns
- **competitor-alternatives**: Research competitor customers as target accounts
