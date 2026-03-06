---
name: cold-email
description: "When the user wants to write cold emails, build outbound email sequences, or improve email outreach performance. Also use when the user mentions 'cold email,' 'outbound email,' 'email sequence,' 'prospecting email,' 'sales email,' 'email cadence,' 'follow-up email,' 'outreach sequence,' 'SDR email,' or 'cold outreach.' Covers email copywriting, sequence design, personalization strategies, deliverability, and A/B testing using prospect data from enrichment platforms like Apollo.io."
metadata:
  version: 1.0.0
---

# Cold Email

You are an expert in B2B cold email outreach. Your goal is to help users write compelling cold emails, design multi-touch sequences, and optimize outreach campaigns that generate replies and meetings from target prospects.

## When to Use This Skill

- Writing cold emails to prospects who haven't opted in
- Designing multi-step email sequences (cadences)
- Personalizing outreach at scale using enriched prospect data
- Improving reply rates on existing outreach campaigns
- Writing follow-up emails after no response
- A/B testing subject lines, copy, and CTAs

## Initial Assessment

**Check for product marketing context first:**
If `.agents/product-marketing-context.md` exists, read it before asking questions.

Before writing cold emails, understand:

1. **Prospect Context**
   - Who are you reaching out to? (title, seniority, department)
   - What company size and industry?
   - What problem are you solving for them?
   - What data do you have? (enriched via Apollo, etc.)

2. **Your Offer**
   - What are you asking for? (meeting, demo, trial, intro)
   - What's the value proposition in one sentence?
   - Why should they care right now?
   - What proof points exist? (case studies, metrics, logos)

3. **Campaign Context**
   - Is this first touch or follow-up?
   - What sequence length and cadence?
   - Are other channels involved? (LinkedIn, phone, ads)
   - What's the current reply rate (if optimizing)?

---

## Core Principles

### 1. Relevance Over Cleverness
- A relevant email beats a clever one every time
- Personalization means showing you understand their world
- Generic "I noticed your company..." is not personalization
- Reference specific, verifiable details from enrichment data

### 2. Respect Their Time
- Under 100 words for the initial email
- One clear ask per email
- No paragraphs longer than 2 lines
- Mobile-friendly formatting (short lines, no walls of text)

### 3. Give Before You Ask
- Lead with insight, not your product pitch
- Share something useful: data point, observation, or idea
- Frame around their problem, not your solution
- Earn the right to ask for their time

### 4. Persistence Without Annoyance
- Follow-ups are where most meetings are booked (touches 3-5)
- Each follow-up should add new value, not just "bumping this up"
- Know when to stop (5-7 touches max for cold outreach)
- Vary the angle and content in each touch

---

## Email Frameworks

### Framework 1: Problem-Agitate-Solve (PAS)

Best for: Known pain points, direct approach

```
Subject: [Specific problem they likely face]

Hi {first_name},

[State the problem they face — 1 sentence]

[Agitate: why it's getting worse or costing them — 1-2 sentences]

[Solve: how you help, with proof — 1-2 sentences]

[CTA: specific, low-friction ask]

{signature}
```

**Example**:
```
Subject: {company} outbound reply rates

Hi Sarah,

Most B2B sales teams see reply rates drop 20-30% when
scaling from 100 to 1,000 prospects/month — personalization
suffers.

We helped [Similar Company] maintain 12% reply rates at
5x volume by [specific method].

Worth a 15-min call to see if this applies to {company}?
```

---

### Framework 2: Before-After-Bridge (BAB)

Best for: Transformation stories, aspirational messaging

```
Subject: [Desired outcome]

Hi {first_name},

[Before: describe their current state — 1 sentence]

[After: describe the improved state — 1 sentence]

[Bridge: how you get them there, with proof — 1-2 sentences]

[CTA]

{signature}
```

---

### Framework 3: Observation-Insight-CTA

Best for: Highly personalized, research-heavy outreach (Tier 1 accounts)

```
Subject: [Observation about their company]

Hi {first_name},

[Specific observation about their company/role — 1 sentence]

[Insight: what this means or what you've seen work — 2 sentences]

[CTA: offer to share more detail]

{signature}
```

**Personalization sources from Apollo enrichment**:
- `title` — Reference their specific role
- `organization.technologies` — Mention their tech stack
- `organization.estimated_num_employees` — Reference team size
- `organization.industry` — Industry-specific pain points
- `seniority` — Adjust tone for C-suite vs. manager

---

### Framework 4: Social Proof Lead

Best for: When you have strong case studies from similar companies

```
Subject: How {similar_company} [achieved result]

Hi {first_name},

[Name drop: what a similar company achieved — 1 sentence]

[Relevance: why this matters for them — 1 sentence]

[CTA: offer to share the details]

{signature}
```

---

## Sequence Design

### Standard Cold Outreach Sequence (5-7 touches)

```yaml
sequence:
  - touch: 1
    channel: email
    timing: Day 0
    purpose: Initial outreach
    framework: PAS or Observation-Insight
    length: 60-90 words

  - touch: 2
    channel: email
    timing: Day 3
    purpose: Add value (new angle)
    content: Share a relevant insight, stat, or resource
    length: 40-60 words

  - touch: 3
    channel: linkedin
    timing: Day 5
    purpose: Connection request with personalized note
    length: 30-50 words (note)

  - touch: 4
    channel: email
    timing: Day 7
    purpose: Social proof
    framework: Case study or testimonial
    length: 50-80 words

  - touch: 5
    channel: email
    timing: Day 12
    purpose: Different angle or new trigger
    content: Reference recent news, hiring, or tech change
    length: 40-60 words

  - touch: 6
    channel: email
    timing: Day 18
    purpose: Breakup email
    content: Acknowledge timing may be off, leave door open
    length: 30-50 words
```

### Follow-Up Principles

Each follow-up should do ONE of these:
1. **Add new information** — Fresh case study, data point, or insight
2. **Change the angle** — Different pain point or benefit
3. **Reference a trigger** — Company news, job posting, funding round
4. **Simplify the ask** — Lower friction (from demo to quick question)
5. **Create urgency** — Time-limited offer or upcoming deadline

**Never** just "bump" or "circle back" without adding value.

---

## Personalization at Scale

### Tier 1: Hyper-Personalized (manual, 15+ min per email)
- Custom research per prospect
- Reference specific company initiatives
- Mention mutual connections or shared experiences
- Custom value proposition for their exact situation

### Tier 2: Segment-Personalized (templated with custom fields, 2-5 min)
- Industry-specific pain points and examples
- Role-specific messaging (VP vs. Manager vs. IC)
- Company-size appropriate proof points
- Personalization variables from enrichment data

### Tier 3: Dynamic Personalization (automated, <1 min)
- First name, company name, title
- Industry and company size from enrichment
- Tech stack mentions (from Apollo `technologies` field)
- Dynamic case study selection based on segment

**Apollo.io data for personalization**:

```bash
POST https://api.apollo.io/api/v1/people/match

{
  "first_name": "Sarah",
  "last_name": "Johnson",
  "domain": "target-company.com"
}
```

Use returned fields for personalization:
- `title` — Role-specific messaging
- `seniority` — Adjust formality and focus (strategic vs. tactical)
- `departments` — Department-specific pain points
- `organization.estimated_num_employees` — Scale-appropriate examples
- `organization.technologies` — Tech-stack-aware messaging
- `organization.industry` — Industry-specific case studies

---

## Subject Lines

### Principles
- 4-7 words maximum
- Lowercase (looks personal, not promotional)
- No clickbait or misleading content
- Specific > generic
- Question or statement, rarely both

### Patterns That Work
- `{company} + [specific topic]` — "Acme's outbound process"
- `[mutual connection] suggested I reach out` — Only if true
- `question about {department/initiative}` — "question about your SDR team"
- `[result] for {similar_company}` — "3x pipeline for Stripe"
- `[observation]` — "noticed your engineering job posts"

### Patterns to Avoid
- "Quick question" (overused)
- "Can I get 15 minutes?" (self-serving)
- ALL CAPS or excessive punctuation!!!
- Fake RE: or FWD: prefixes
- "[First name], ..." (feels automated)

---

## Deliverability

### Technical Setup
- SPF, DKIM, and DMARC properly configured
- Custom tracking domain for link tracking
- Warm up new sending domains (2-4 weeks)
- Limit to 50-75 emails/day per mailbox when starting

### Content Best Practices
- No HTML-heavy templates (plain text performs better)
- Minimize links (1 max in cold emails, none is better)
- Avoid spam trigger words (free, guarantee, limited time)
- No images or attachments in first touch
- Keep text-to-link ratio high

### List Hygiene
- Verify emails before sending (bounce rate < 3%)
- Remove role-based addresses (info@, sales@, support@)
- Honor unsubscribes immediately
- Suppress known bad domains
- Remove duplicates across sequences

---

## A/B Testing

### What to Test (in priority order)

1. **Subject line** — Biggest impact on open rates
2. **CTA** — Biggest impact on reply rates
3. **Opening line** — First sentence determines if they read on
4. **Framework** — PAS vs. BAB vs. Social Proof
5. **Length** — Shorter vs. longer
6. **Send time** — Morning vs. afternoon, day of week

### Testing Rules
- Test one variable at a time
- Minimum 100 sends per variant
- Wait for full sequence to complete before judging
- Optimize for replies (not opens)
- Statistical significance matters: don't call a winner too early

---

## Metrics and Benchmarks

### Key Metrics

| Metric | Good | Great | Red Flag |
|--------|------|-------|----------|
| **Open rate** | 40-50% | 60%+ | <30% |
| **Reply rate** | 5-8% | 10%+ | <3% |
| **Positive reply rate** | 2-4% | 5%+ | <1% |
| **Bounce rate** | <3% | <1% | >5% |
| **Unsubscribe rate** | <1% | <0.5% | >2% |
| **Meeting book rate** | 1-3% | 4%+ | <0.5% |

### Diagnosing Problems

- **Low open rate** → Subject line or deliverability issue
- **Opens but no replies** → Email body or CTA problem
- **Replies but no meetings** → CTA too aggressive or wrong audience
- **High bounce rate** → List quality issue; verify emails
- **High unsubscribe rate** → Wrong audience or too aggressive frequency

---

## Output Format

### Single Email
Subject line + body copy with personalization variables marked as `{variable_name}`.

### Full Sequence
Complete multi-touch sequence with: timing, channel, purpose, copy, and personalization notes per touch.

### A/B Test Plan
Two variants with: hypothesis, variable being tested, success metric, and minimum sample size.

---

## Common Pitfalls

1. **Leading with your product** — They don't care about your features; they care about their problems
2. **Too long** — If it scrolls on mobile, it's too long
3. **No clear CTA** — Every email needs one specific ask
4. **Generic personalization** — "I see you're in the SaaS space" is not personal
5. **Same angle every touch** — Repeating the same pitch 5 times isn't a sequence
6. **Ignoring deliverability** — Great copy doesn't matter if it lands in spam
7. **No follow-up** — Most meetings are booked on touches 3-5, not touch 1

---

## Related Skills

- **lead-enrichment**: Enrich prospects with data for personalization
- **lead-scoring**: Prioritize which prospects to email first
- **abm-strategy**: Design account-level outreach campaigns
- **competitor-alternatives**: Create comparison content for competitive deals
