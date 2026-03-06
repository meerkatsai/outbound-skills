---
name: lead-scoring
description: "When the user wants to build or refine a lead scoring model to prioritize prospects. Also use when the user mentions 'lead scoring,' 'lead prioritization,' 'MQL,' 'SQL,' 'lead qualification,' 'scoring model,' 'fit score,' 'intent score,' 'engagement score,' 'lead grading,' or 'lead ranking.' Covers demographic/firmographic scoring, behavioral scoring, intent signals, scoring model design, and threshold setting using enriched data from platforms like Apollo.io."
metadata:
  version: 1.0.0
---

# Lead Scoring

You are an expert in B2B lead scoring and qualification. Your goal is to help users design, implement, and optimize lead scoring models that accurately predict conversion likelihood and help sales teams prioritize the right prospects.

## When to Use This Skill

- Designing a new lead scoring model from scratch
- Refining an existing model that isn't predicting conversions well
- Combining fit scoring (who they are) with engagement scoring (what they do)
- Setting MQL/SQL thresholds and handoff criteria
- Incorporating enriched data (from Apollo.io, etc.) into scoring
- Building account-level scoring for ABM programs

## Initial Assessment

**Check for product marketing context first:**
If `.agents/product-marketing-context.md` exists, read it before asking questions.

Before building a scoring model, understand:

1. **Business Context**
   - What does your sales cycle look like? (length, stages, touchpoints)
   - What is your current conversion rate by stage?
   - How do sales reps currently prioritize leads?
   - What defines a "good" lead for your business?

2. **Available Data**
   - What CRM/MAP are you using?
   - What enrichment data is available? (Apollo, ZoomInfo, Clearbit)
   - What behavioral tracking is in place? (website, email, product)
   - How much historical closed-won/lost data exists?

3. **Goals**
   - Increase sales efficiency (focus on right leads)
   - Reduce lead response time for high-quality leads
   - Improve MQL-to-SQL conversion rate
   - Better alignment between marketing and sales

---

## Core Principles

### 1. Two Dimensions: Fit + Engagement
- **Fit score** = who they are (demographics, firmographics)
- **Engagement score** = what they do (behavior, intent signals)
- Both dimensions matter; a perfect-fit lead with zero engagement isn't ready
- A highly engaged lead with poor fit may never convert

### 2. Start Simple, Iterate
- Begin with 5-10 high-impact scoring criteria
- Don't over-engineer with 50 rules on day one
- Validate against historical data before deploying
- Review and adjust quarterly based on conversion data

### 3. Negative Scoring Matters
- Deduct points for disqualifying signals
- Competitors, students, job seekers consume sales time
- Unsubscribes and bounces indicate disengagement
- Wrong geography, company size, or industry should penalize

### 4. Decay Over Time
- Engagement scores should decay if activity stops
- A website visit from 6 months ago isn't a buying signal
- Recency weighting prevents stale leads from clogging the pipeline

---

## Scoring Model Design

### Component 1: Fit Score (Demographic + Firmographic)

Score based on how well the lead matches your ICP. Use enriched data from Apollo.io or similar platforms.

**Enrichment for fit scoring** (Apollo.io):
```bash
POST https://api.apollo.io/api/v1/people/match

{
  "first_name": "Sarah",
  "last_name": "Johnson",
  "domain": "target-company.com"
}
```

**Person-level scoring criteria**:

| Criterion | High Fit (+) | Medium Fit | Low Fit (-) |
|-----------|-------------|------------|-------------|
| **Title/Seniority** | VP, Director, C-Suite | Manager, Senior | Intern, Student |
| **Department** | Target department (e.g., Marketing) | Adjacent (e.g., Sales) | Unrelated (e.g., Facilities) |
| **Location** | Primary market | Secondary market | Out of territory |

**Company-level scoring criteria** (from organization enrichment):

```bash
POST https://api.apollo.io/api/v1/organizations/enrich

{
  "domain": "target-company.com"
}
```

| Criterion | High Fit (+) | Medium Fit | Low Fit (-) |
|-----------|-------------|------------|-------------|
| **Employee Count** | 51-500 (sweet spot) | 501-2000 | <10 or >10,000 |
| **Industry** | Target verticals | Adjacent industries | Non-target |
| **Revenue** | $5M-$100M | $1M-$5M | <$1M |
| **Tech Stack** | Uses complementary tools | Neutral stack | Uses competing product |
| **Funding** | Recently funded | Established/profitable | No data |

**Example fit scoring model**:

```yaml
fit_scoring:
  person:
    seniority:
      c_suite: 25
      vp: 20
      director: 15
      manager: 10
      senior: 5
      entry: -5
      student: -20
    department:
      target_match: 15
      adjacent: 5
      unrelated: -10
    location:
      primary_market: 10
      secondary_market: 5
      out_of_territory: -10

  company:
    employee_count:
      ideal_range: 20
      acceptable_range: 10
      too_small: -10
      too_large: -5
    industry:
      target_vertical: 20
      adjacent: 5
      non_target: -15
    revenue:
      ideal_range: 15
      acceptable: 5
      too_small: -10
    tech_stack:
      complementary: 15
      competitor_user: -20
      neutral: 0

  max_fit_score: 100
  disqualifiers:
    - competitor_employee
    - personal_email_only
    - blocked_country
```

---

### Component 2: Engagement Score (Behavioral)

Score based on actions that indicate buying intent.

**High-intent signals** (20-50 points):
- Requested a demo or free trial
- Visited pricing page (multiple times)
- Attended a product webinar
- Responded to outreach email
- Downloaded a buyer's guide or ROI calculator

**Medium-intent signals** (5-15 points):
- Visited product/feature pages
- Downloaded educational content
- Opened multiple emails
- Engaged with social media posts
- Attended industry webinar

**Low-intent signals** (1-5 points):
- Visited blog post
- Opened a single email
- Visited homepage
- Viewed a social post

**Negative signals** (-5 to -25 points):
- Unsubscribed from email (-15)
- Email bounced (-25)
- No activity in 30+ days (-10)
- Visited careers page (-10)
- Marked email as spam (-25)

**Example engagement scoring model**:

```yaml
engagement_scoring:
  high_intent:
    demo_request: 50
    trial_signup: 45
    pricing_page_visit: 20
    pricing_page_repeat: 30
    outreach_reply: 25
    buyers_guide_download: 20

  medium_intent:
    product_page_visit: 10
    case_study_download: 10
    webinar_attendance: 15
    email_click: 5
    linkedin_engagement: 5

  low_intent:
    blog_visit: 2
    email_open: 1
    homepage_visit: 1

  negative:
    unsubscribe: -15
    email_bounce: -25
    no_activity_30d: -10
    careers_page: -10
    spam_report: -25

  decay:
    half_life_days: 30
    minimum_score: 0

  max_engagement_score: 100
```

---

### Component 3: Intent Signals (Optional)

Third-party intent data adds a predictive layer:

- **Topic research**: Account researching your category on review sites
- **Competitor research**: Account evaluating competitor products
- **Surge signals**: Spike in research activity around relevant topics
- **Hiring signals**: Posting jobs in your target department
- **Technology changes**: Adding or removing relevant tech stack items

---

## Scoring Matrix and Thresholds

### Lead Classification Matrix

Plot fit score (Y-axis) against engagement score (X-axis):

```
                    Low Engagement    Medium Engagement    High Engagement
                    (0-30)            (31-60)              (61-100)
High Fit (70-100)   Nurture           MQL                  SQL
                    (educate)         (sales ready)        (hot lead)

Med Fit (40-69)     Monitor           Nurture              MQL
                    (low priority)    (build engagement)   (qualify fit)

Low Fit (0-39)      Disqualify        Monitor              Investigate
                    (suppress)        (watch for changes)  (edge case)
```

### Threshold Definitions

```yaml
thresholds:
  mql:
    minimum_fit_score: 40
    minimum_engagement_score: 30
    combined_minimum: 80
    description: "Marketing Qualified Lead — ready for sales review"

  sql:
    minimum_fit_score: 60
    minimum_engagement_score: 50
    combined_minimum: 120
    description: "Sales Qualified Lead — prioritize for outreach"

  hot_lead:
    minimum_fit_score: 70
    minimum_engagement_score: 70
    combined_minimum: 150
    description: "Hot Lead — immediate sales action required"
    sla_response_time: "< 1 hour"

  disqualify:
    conditions:
      - fit_score_below: 20
      - is_competitor: true
      - is_student: true
      - email_invalid: true
```

---

## Account-Level Scoring (for ABM)

For account-based programs, aggregate individual lead scores to the account level:

```yaml
account_scoring:
  components:
    contact_coverage:
      description: "% of buying committee identified"
      weight: 0.25
      scoring:
        5_plus_contacts: 100
        3_4_contacts: 70
        1_2_contacts: 40
        0_contacts: 0

    aggregate_engagement:
      description: "Sum of contact engagement scores"
      weight: 0.30
      normalization: "top_3_contacts_average"

    account_fit:
      description: "Company firmographic fit"
      weight: 0.25

    intent_signals:
      description: "Third-party intent data"
      weight: 0.20

  account_tiers:
    tier_1: score >= 80
    tier_2: score >= 50
    tier_3: score >= 25
    disqualified: score < 25
```

---

## Implementation Checklist

1. **Define ICP** — Document ideal customer firmographics and demographics
2. **Map scoring criteria** — List all fit and engagement factors with point values
3. **Weight the model** — Assign points based on correlation with closed-won deals
4. **Set thresholds** — Define MQL, SQL, and hot lead cutoffs
5. **Add negative scoring** — Include disqualifiers and decay rules
6. **Validate historically** — Score past leads and check against actual outcomes
7. **Deploy in CRM/MAP** — Implement scoring rules in your marketing automation
8. **Train sales** — Explain what scores mean and expected response SLAs
9. **Monitor and iterate** — Review monthly; adjust quarterly based on conversion data

---

## Model Validation

### Backtesting
- Score your last 6-12 months of leads retroactively
- Check if high-scoring leads converted at higher rates
- Identify false positives (high score, didn't convert) and false negatives (low score, did convert)
- Adjust weights based on findings

### Ongoing Monitoring
- Track conversion rate by score range
- Monitor score distribution (avoid clustering)
- Alert on scoring anomalies (sudden spikes or drops)
- Compare MQL-to-SQL conversion rate before and after

---

## Output Format

### Scoring Model Document
Complete model specification with: criteria, point values, thresholds, decay rules, and disqualification logic.

### Implementation Guide
Step-by-step setup in your CRM/MAP with: field mappings, automation rules, and notification triggers.

### Scoring Dashboard
Recommended metrics: score distribution, conversion by score range, MQL volume, SQL conversion rate, false positive/negative rate.

---

## Common Pitfalls

1. **Scoring only on fit, ignoring behavior** — Perfect-fit leads may never be ready to buy
2. **Too many criteria** — Complex models are hard to maintain and debug
3. **No decay** — Stale scores create false urgency
4. **No negative scoring** — Competitors and students waste sales time
5. **Set and forget** — Models need regular calibration against outcomes
6. **Vanity thresholds** — Setting MQL threshold too low to inflate metrics helps no one

---

## Related Skills

- **lead-enrichment**: Enrich leads with data needed for fit scoring
- **abm-strategy**: Apply scoring at the account level for ABM programs
- **cold-email**: Tailor outreach based on lead score and segment
- **competitor-alternatives**: Identify competitor users for targeted scoring
