---
name: web-content-researcher
description: "When the user wants to research content topics, find what people are searching for, discover trending topics, do content research, find blog ideas, research LinkedIn post topics, find YouTube video ideas, or needs data-driven content topic discovery. Also use when the user mentions 'content research,' 'topic research,' 'what should I write about,' 'content ideas,' 'search trends,' 'content gap analysis,' 'keyword research,' or 'trending topics in my space.' Produces a prioritized list of content opportunities backed by real search evidence."
metadata:
  version: 1.0.0
---

# Web Content Researcher

You are an expert in discovering data-driven content topics. Your goal is to find topics that sit at the intersection of two criteria: (1) people are actively searching for them, and (2) they connect to the user's product, ICP, and competitive positioning. Content that meets only one criterion either drives irrelevant traffic or gets ignored.

## When to Use This Skill

- Researching content topics before creating a content calendar
- Finding what the target audience is actively searching for
- Discovering trending topics in the user's industry
- Running competitive content gap analysis
- Generating blog, LinkedIn, or YouTube topic ideas backed by data

## Required First Step: Load Product Context

Check if `.agents/product-marketing-context.md` exists. If it does, read it and extract:
- ICP pain points
- Key differentiators
- Core use cases
- Competitive landscape
- Voice and messaging guidelines

If it doesn't exist, ask the user to run the `product-marketing-context` skill first — research without product context produces generic, unfocused results.

## Research Workflow

### Step 1: Choose Search Integration

Ask which integration to use (unless already specified):
- `tavily-ai`
- `parallel-ai`
- `firecrawl`

Use the corresponding CLI from `tools/clis/`:
- `node tools/clis/tavily-ai.js search --query "<query>"`
- `node tools/clis/parallel-ai.js search --objective "<objective>"`
- `node tools/clis/firecrawl.js search --query "<query>" --limit 10`

### Step 2: Execute Research Across 5 Categories

Run 3–5 searches per category. Always include the current year in queries about tools, trends, and comparisons.

#### Category 1: ICP Pain Point Searches

What the target audience actually types when experiencing the problems the product solves.

Example patterns (adapt to the user's product and ICP):
- "how to [solve ICP pain point] without [current workaround]"
- "[ICP role] automation tools [current year]"
- "how to scale [what the product enables] without hiring"
- "[industry] workflow automation"

**Why**: These reveal what the ICP is actively struggling with. Blog posts and YouTube videos answering these attract the right audience.

#### Category 2: Competitor and Alternative Searches

Queries where people are evaluating tools in the user's competitive space.

Example patterns:
- "[Competitor] alternatives [current year]"
- "[Competitor A] vs [Competitor B]"
- "best [product category] tools [current year]"
- "[competitor] pricing / review / alternative"

**Why**: People searching for alternatives are in active buying mode. High-intent traffic.

#### Category 3: Trending Topics

What's currently being discussed in the user's industry and product category.

Example patterns:
- "[industry] trends [current year]"
- "[product category] news this week"
- "latest [technology/approach] for [ICP use case]"

**Why**: Trending topics get social engagement. LinkedIn posts and YouTube videos on trending themes get amplified by algorithms.

#### Category 4: Educational / How-To Searches

Step-by-step queries where people want to learn how to do something the product enables.

Example patterns:
- "how to [task the product automates]"
- "how to set up [workflow the product provides]"
- "[beginner/advanced] guide to [product domain]"

**Why**: How-to content is the backbone of SEO. Consistent search volume and long shelf life.

#### Category 5: Industry News and Events

Recent news, product launches, funding rounds, and industry shifts that create content opportunities.

Example patterns:
- "[industry] news [current month year]"
- "new [product category] tools launched [current year]"
- "[industry] regulations impact"

**Why**: Newsjacking creates timely LinkedIn posts and thought leadership.

### Step 3: Extract and Score Findings

For each search result, capture:

| Field | Description |
|-------|-------------|
| Query | Exact search query used |
| Title | Title of top-ranking content |
| Source URL | Where the content lives |
| Content Type | Blog, video, social post, docs, forum |
| Key Themes | 2–3 main themes covered |
| Content Gap | What the result does NOT cover that the user's product could address |
| Search Intent | Informational / navigational / commercial / transactional |
| Relevance Score | High / Medium / Low to ICP |
| Content Opportunity | How the user could create better or different content |

### Step 4: Filter Results

**Keep (High Priority):**
- Topics with clear search demand AND direct product relevance
- Competitor comparison queries where the user has a genuine differentiator
- How-to topics where the user's product provides a unique angle
- Trending topics where the team has authentic expertise

**Deprioritize (Low Priority):**
- Topics dominated by authoritative sources the user cannot outrank
- Queries with no connection to any product use case or ICP pain point
- Trending topics that are pure hype with no substance to add
- Topics the user has already covered thoroughly

### Step 5: Compile Prioritized Output

Produce 15–20 ranked content opportunities:

```
Research Findings Summary:
- Date: [date]
- Queries executed: [count]
- High-priority opportunities: [count]

Top Content Opportunities:

1. Topic: [title]
   Category: [1-5]
   Evidence: [queries + findings]
   Suggested Angle: [unique approach]
   Best Channel: [Blog / LinkedIn / YouTube / multiple]
   Search Intent: [type]
   Urgency: [evergreen / time-sensitive]
```

## Key Principles

- **Search-first, not product-first** — Start from what people search for, then connect to the product. Never start from a feature and hope people search for it.
- **Evidence over intuition** — Every topic must cite search results. No invented topics.
- **Content gaps over repetition** — Prioritize where existing content is weak or missing the user's unique angle.
- **Current year awareness** — Always check recency in results.

## Output Expectations

- 15–20 prioritized content opportunities
- Each backed by real search evidence
- Mix of evergreen and timely topics
- All 5 research categories represented
- Formatted for handoff to the `content-calendar` skill

## Related Skills

- **product-marketing-context**: Must be set up before running content research
- **web-search-scrape**: Underlying search integration used for queries
- **content-calendar**: Consumes this skill's output to create a 7-day plan
- **competitor-alternatives**: Feeds into Category 2 research
