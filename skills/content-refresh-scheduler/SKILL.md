---
name: content-refresh-scheduler
description: "When the user wants to run the full Meerkats.ai content pipeline end-to-end, automate content calendar creation, set up a content cron job, or execute the content refresh workflow. Also use when the user mentions 'run the content pipeline,' 'refresh the content calendar,' 'generate this week's content,' 'content automation,' 'schedule content creation,' or 'content cron job.' Chains meerkats-product-context → web-content-researcher → content-calendar and saves results to Notion."
metadata:
  version: 1.0.0
---

# Content Refresh Scheduler

You orchestrate the full Meerkats.ai content pipeline end-to-end. You chain three skills in sequence — product context, web research, content calendar — and save the output to the Notion "Meerkats Content Calendar" database. Designed to run every 4 days on a schedule or manually on demand.

## When to Use This Skill

- Running the full content pipeline (research → calendar → save)
- Setting up the automated cron job
- Manually triggering a content refresh cycle
- Debugging or modifying the automation

## Notion Database

- **Database**: Meerkats Content Calendar
- **Data Source ID**: `9919b902-4af4-466e-8c13-0628bdf0ce64`
- **URL**: https://www.notion.so/ac27bfa2b2ee444c89af7ea7977c779a

## Pipeline Execution

Execute these 4 steps in strict sequence. Do not skip steps.

### Step 1: Load Product Context

Read the `meerkats-product-context` skill's reference file at `skills/meerkats-product-context/references/meerkats-context.md`.

Extract and hold:
- ICP pain points
- Key differentiators
- Core use cases
- Competitive landscape
- Voice guidelines (words to use/avoid, tone, framing)

### Step 2: Web Content Research

Execute the `web-content-researcher` skill's full workflow:

1. Ask the user which search integration to use (tavily-ai, parallel-ai, or firecrawl) — or default to tavily-ai for automated runs
2. Run 3–5 searches per category across all 5 research categories:
   - ICP Pain Point Searches
   - Competitor and Alternative Searches
   - Trending Topics
   - Educational / How-To Searches
   - Industry News
3. Use current year in all tool/trend/comparison queries
4. Extract: query, top-ranking titles, key themes, content gaps, search intent, relevance
5. Filter: keep only where BOTH search demand AND product relevance exist
6. Compile 15–20 prioritized content opportunities

CLI patterns:
- `node tools/clis/tavily-ai.js search --query "<query>"`
- `node tools/clis/parallel-ai.js search --objective "<objective>"`
- `node tools/clis/firecrawl.js search --query "<query>" --limit 10`

### Step 3: Create 7-Day Content Calendar

Execute the `content-calendar` skill's full workflow:

1. From 15–20 opportunities, select and assign:
   - LinkedIn: 1 post/day (7 total)
   - Blog: 2–3 posts across 7 days
   - YouTube: 1 video across 7 days
2. Create full entries per channel (see content-calendar skill for field specs)
3. Apply voice guidelines from product context
4. Quality check: evidence on every piece, on-brand voice, no duplicates, content variety

### Step 4: Save to Notion

Insert each content piece as a row in the Notion database.

| Field | Value |
|-------|-------|
| Content Title | Topic/title |
| Channel | "LinkedIn", "Blog", or "YouTube" |
| date:Publish Date:start | YYYY-MM-DD |
| date:Publish Date:is_datetime | 0 |
| Status | "Not started" |
| Content Pillar | Pain Point / Educational / Competitive / Trending / Industry News |
| Research Evidence | Search finding supporting topic |
| Hook / Summary | LinkedIn: hook. Blog: definition block. YouTube: description |
| CTA | Call-to-action |
| Target Keyword | Primary search query (blog) |
| Outline / Key Points | LinkedIn: points. Blog: H2 outline. YouTube: sections |
| date:Research Cycle Date:start | Today YYYY-MM-DD |
| date:Research Cycle Date:is_datetime | 0 |
| SEO Title | SEO title (blog) |
| Meta Description | 150–160 chars (blog) |

Create ~10–11 rows (7 LinkedIn + 2–3 Blog + 1 YouTube).

## Scheduling Setup

To create the cron job:

```
Task ID: meerkats-content-refresh
Cron: 0 9 */4 * *  (9:00 AM local time, every 4 days)
```

**Modify frequency:**
- Weekly: `0 9 */7 * *`
- Daily: `0 9 * * *`
- Weekdays only: `0 9 * * 1-5`

**Pause**: Disable the scheduled task
**Resume**: Re-enable the scheduled task

## Important Rules

- Every content idea MUST be backed by real search evidence — never invent topics
- Always include current year in tool/trend/comparison queries
- Voice: confident, practical, anti-complexity
- No "AI-powered" or "revolutionary" language
- Use "Meerkats.ai" (not "Meerkats") in external-facing titles
- LinkedIn hooks: contrarian / number / question / before-after / pattern interrupt
- Blog titles: lead with search query, NOT product name
- Hard CTAs: max 1 per week across LinkedIn posts

## Related Skills

- **meerkats-product-context**: Step 1 — product knowledge
- **web-content-researcher**: Step 2 — topic research
- **content-calendar**: Step 3 — calendar creation
- **web-search-scrape**: Underlying search integration
