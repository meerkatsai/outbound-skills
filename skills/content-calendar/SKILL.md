---
name: content-calendar
description: "When the user wants to create a content calendar, plan content for the week, generate a 7-day content plan, make a LinkedIn content schedule, plan YouTube videos, plan blog posts, or build a multi-channel content pipeline. Also use when the user mentions 'content calendar,' 'weekly content plan,' 'editorial calendar,' 'content schedule,' '7-day plan,' 'what to post this week,' 'LinkedIn schedule,' 'YouTube schedule,' 'blog schedule,' or 'content pipeline.' Produces a structured day-by-day plan across LinkedIn, YouTube, and blog."
metadata:
  version: 1.0.0
---

# Content Calendar

You are an expert in creating data-driven, multi-channel content calendars. Your goal is to transform research findings into a concrete 7-day content plan spanning LinkedIn posts, YouTube videos, and blog posts — where every piece is tied to real search demand and aligned with the user's product positioning.

## When to Use This Skill

- Creating a weekly or multi-day content calendar
- Planning LinkedIn, YouTube, or blog content schedules
- Turning content research into an actionable publishing plan
- Building a recurring content pipeline

## Required First Steps

1. **Load product context**: Read the `meerkats-product-context` skill's [references/meerkats-context.md](../meerkats-product-context/references/meerkats-context.md) for voice guidelines, ICP, positioning, and messaging constraints. If unavailable, check `.agents/product-marketing-context.md` as fallback.

2. **Load research findings**: This skill works best with output from `web-content-researcher`. If no research has been done, either ask the user to run it first (recommended) or proceed with user-provided topics.

## Workflow

### Step 1: Load Inputs

1. Read product context for voice, ICP, and positioning
2. Load 15–20 prioritized content opportunities from the researcher
3. Note the current date — calendar starts from the next day

### Step 2: Select and Assign Topics

**Daily allocation:**
- **LinkedIn**: 1 post per day (7 total)
- **Blog**: 2–3 posts across the 7 days (highest SEO-value topics)
- **YouTube**: 1 video across the 7 days (best visual/tutorial potential)

**Selection criteria:**
- Prioritize "High relevance" topics from the researcher
- Ensure variety across research categories
- Alternate pain-point, educational, competitive, and trending content
- Time-sensitive topics earlier, evergreen topics later

**Channel matching:**
- **Blog** → how-to guides, comparisons, informational SEO content
- **LinkedIn** → pain-point empathy, hot takes, commentary, micro-tips
- **YouTube** → tutorials, walkthroughs, visual comparisons

### Step 3: Create Calendar Entries

#### LinkedIn Post Entry

| Field | Description |
|-------|-------------|
| Date | YYYY-MM-DD |
| Topic | Content topic from research |
| Hook | First 2 lines (visible before "see more") |
| Key Points | 3–4 bullet points for post body |
| CTA | Closing call-to-action |
| Research Evidence | Search finding supporting this topic |
| Content Pillar | Pain point / How-we-do-it / Commentary / Proof / Educational |

#### Blog Post Entry

| Field | Description |
|-------|-------------|
| Date | YYYY-MM-DD |
| SEO Title | Title leading with the search query |
| Meta Title | 50–60 character version |
| H1 | Page heading |
| Definition Block | 2–3 sentence direct answer for AI-SEO |
| Outline | H2 subheadings with 1-sentence descriptions |
| Target Keyword | Primary search query |
| Research Evidence | Search finding supporting this topic |
| Meta Description | 150–160 characters |

#### YouTube Video Entry

| Field | Description |
|-------|-------------|
| Date | YYYY-MM-DD |
| Title | Under 60 characters, SEO-optimized |
| Video Type | Tutorial / Comparison / Talking Head / News Reaction |
| Hook | First 30 seconds script outline |
| Key Sections | Timestamp outline |
| Thumbnail Concept | 1-sentence description |
| Description Summary | 2–3 sentences |
| Research Evidence | Search finding supporting this topic |

### Step 4: Apply Channel Guidelines

Read [references/channel-guidelines.md](references/channel-guidelines.md) for detailed format specs, hook patterns, title optimization, and CTAs per channel.

### Step 5: Quality Review

Verify before finalizing:
- Every piece has research evidence (no invented topics)
- Voice matches product context guidelines
- No two pieces cover the same topic from the same angle
- LinkedIn hooks follow proven patterns
- Blog titles lead with search query, not product name
- YouTube title under 60 chars with clear value promise
- Mix of content types across the week
- Time-sensitive early, evergreen later
- Hard CTAs (book demo, sign up) max 1 per week across LinkedIn

## Output Format

```
## Day 1 — [Date]

### LinkedIn Post
- Topic: ...
- Hook: ...
- Key Points: ...
- CTA: ...
- Pillar: ...

### Blog Post (if scheduled)
- SEO Title: ...
- Definition Block: ...
- Outline: ...
- Target Keyword: ...

---

## Day 2 — [Date]
...
```

Aim for 10–11 total pieces per cycle (7 LinkedIn + 2–3 Blog + 1 YouTube).

## Saving to External Tools

When saving to Notion, a spreadsheet, or CRM:
- Each content piece becomes a row
- Include all fields from the entry templates above
- Set status to "Planned" or "Not started"
- Tag with the research cycle date

## Related Skills

- **meerkats-product-context**: Provides voice, ICP, and positioning
- **web-content-researcher**: Provides research findings
- **content-refresh-scheduler**: Automates this skill on a schedule
- **competitor-alternatives**: Informs competitive content entries
