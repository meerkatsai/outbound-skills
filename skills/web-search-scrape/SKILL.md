---
name: web-search-scrape
description: Use when a user asks to search the web, scrape webpages, crawl sites, map URLs, or extract web data. First clarify which integration to use (parallel-ai, tavily-ai, or firecrawl), then execute with the chosen integration.
metadata:
  version: 1.0.0
---

# Web Search or Scrape

Use this skill when the user needs web search, scraping, crawling, mapping, or extraction.

## Required First Step

Before running any tool call, ask the user which integration to use:

- `parallel-ai`
- `tavily-ai`
- `firecrawl`

If the user already specified one, skip this question and proceed.

## Integration Selection Prompt

Use this exact style:

`Which integration should I use for this task: parallel-ai, tavily-ai, or firecrawl?`

## After User Chooses

1. Confirm chosen integration in one sentence.
2. Execute using the corresponding local CLI.
3. Return the key output plus source URLs.

## CLI Mapping

- `parallel-ai` -> `node tools/clis/parallel-ai.js`
- `tavily-ai` -> `node tools/clis/tavily-ai.js`
- `firecrawl` -> `node tools/clis/firecrawl.js`

## Quick Command Patterns

### Parallel AI

- Search: `node tools/clis/parallel-ai.js search --objective "<objective>"`
- Extract: `node tools/clis/parallel-ai.js extract --url <url>`
- Task run: `node tools/clis/parallel-ai.js tasks run --input "<task>"`

### Tavily AI

- Search: `node tools/clis/tavily-ai.js search --query "<query>"`
- Extract: `node tools/clis/tavily-ai.js extract --urls <url1,url2>`
- Crawl: `node tools/clis/tavily-ai.js crawl --url <url> --max-depth 2 --limit 50`

### Firecrawl

- Scrape: `node tools/clis/firecrawl.js scrape --url <url> --formats markdown --only-main-content`
- Search: `node tools/clis/firecrawl.js search --query "<query>" --limit 10`
- Crawl: `node tools/clis/firecrawl.js crawl --url <url> --limit 50 --max-depth 2`

## Output Expectations

- Include:
  - selected integration
  - command(s) run
  - structured result summary
  - links/URLs used
- If a command fails, surface the raw error and suggest the smallest corrective step.
