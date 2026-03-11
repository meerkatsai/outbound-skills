# Meerkats.ai — Product Marketing Context

*Last updated: 2026-03-11*

## Product Overview

**One-liner:** Meerkats.ai is the agent skills platform that lets growth marketing teams turn their best playbooks into autonomous AI agents — deployed across every client, no code required.

**What it does:** A fully hosted, no-code platform where growth marketing teams codify winning playbooks into reusable Skills.md files, deploy them as autonomous AI agents, and orchestrate multi-step workflows across their entire client portfolio — with built-in data isolation per client.

**Product category:** Agent skills platform / AI marketing automation

**Product type:** SaaS (fully hosted)

**Business model:** Subscription-based with freemium tier

## Target Audience

**Target companies:** Growth marketing agencies (5–50+ clients), in-house full-stack growth teams (2–8 people), RevOps/Sales Ops teams

**Decision-makers:** Agency founders, heads of growth, VP Marketing, RevOps leads

**Primary use case:** Automate repetitive growth execution (outbound, enrichment, content, reporting) across multiple clients without scaling headcount

**Jobs to be done:**
- Codify expertise — turn winning playbooks into reusable agent skills
- Scale across clients — clone agents per client, adjust targeting, deploy in minutes
- Automate execution — agents handle prospecting, enrichment, sequencing, content, reporting
- Maintain quality at scale — validated skills ensure consistent execution

**Use cases:**
- Multi-client outbound at scale (scrape → enrich → verify → sequence per client)
- Inbound content engine (SEO blogs, LinkedIn, lead magnets per client ICP)
- Lead enrichment pipeline (waterfall across Hunter, RocketReach, Prospeo, Findymail)
- Client reporting automation (weekly performance reports from campaign data)
- Technology stack analysis (BuiltWith integration for tech-based targeting)

## Problems & Pain Points

**Core problem:** Growth agencies and teams can't scale execution without linearly scaling headcount, compressing margins.

**Why alternatives fall short:**
- Clay is credit-expensive, complex, and single-tenant — no multi-client isolation
- Instantly/Smartlead are point solutions (cold email only) — don't cover the full stack
- Claude Code/Cursor require a terminal and coding skills — marketing teams can't use them
- Zapier/Make are workflow tools, not AI-native agent platforms

**What it costs them:**
- 4–8 hours of setup per new client for the same stack
- Hours per week copy-pasting between disconnected tools
- Best playbooks lost in tribal knowledge — new hires take months to ramp
- Revenue scales but margins compress as headcount grows

**Emotional tension:** Frustration at rebuilding the same workflows, fear of dropping quality as client count grows, pressure to grow revenue without growing the team

## Competitive Landscape

**Direct:**
- Clay — single-tenant enrichment with complex waterfall logic and credit-based pricing. Falls short on multi-client isolation and full-stack orchestration.
- Persana AI — AI-powered lead enrichment. Falls short on workflow orchestration and multi-client architecture.

**Secondary:**
- Instantly / Smartlead — cold email sequencing tools. Fall short because they're point solutions, not full-stack platforms.
- Apollo.io — data + outreach for individual reps. Falls short for agencies managing multiple client campaigns.

**Indirect:**
- Claude Code / Cursor — powerful but require terminal and engineering. Falls short for non-technical marketing teams.
- Zapier / Make — general workflow automation. Fall short on AI-native agent orchestration with marketing-specific skills.

## Differentiation

**Key differentiators:**
- No terminal, no code, fully hosted — pick a skill, deploy an agent, no DevOps
- Multi-client architecture with data isolation — every client gets isolated data, agents, reporting via Supabase RLS
- Skills.md paradigm — marketing expertise becomes a portable, version-controlled, deployable file
- Validated skill repository — pre-built, tested skills for Smartlead, Instantly, Apollo, Apify, HubSpot
- Agent-to-agent orchestration — agents pass structured outputs and trigger downstream agents automatically

**Why customers choose Meerkats:** Deploy an entire growth stack per client in minutes, not hours. Margins improve because execution scales without headcount.

## Objections

| Objection | Response |
|-----------|----------|
| "How is this different from Clay?" | Clay is single-tenant enrichment with complex waterfall logic. Meerkats is a multi-client agent platform — deploy an entire growth stack per client, not just enrichment. |
| "Can't I just use Claude Code / Cursor?" | Those require a terminal and coding skills. Meerkats is fully hosted — your marketing team deploys agents without engineering support. |
| "We already use Smartlead/Instantly" | Meerkats integrates WITH those tools as skill endpoints. It orchestrates agents across your entire stack, not just cold email. |
| "Is our client data safe?" | Every client gets fully isolated data via Supabase Row-Level Security. No cross-contamination between accounts. |
| "What if I need a custom workflow?" | Describe what you need in plain language. Meerkats creates a custom skill — no code required. Or import any skill from GitHub. |

**Anti-persona:** Solo entrepreneurs just starting out, enterprise sales teams (better served by ZoomInfo/Apollo), engineering-heavy teams who want to self-host everything

## Customer Language

**How they describe the problem:**
- "Every new client starts from scratch"
- "More clients, thinner margins"
- "Our best playbooks are stuck in people's heads"
- "We're duct-taping tools together with manual effort"

**How they describe the solution:**
- "Turn playbooks into agents"
- "Clone and deploy per client"
- "No code, no terminal"

**Words to use:** Skills, agents, playbooks, deploy, orchestrate, scale, automate, clone, "no terminal needed", "fully hosted", "one-click", "multi-client", "data isolation", "per-client"

**Words to avoid:** "AI-powered" (overused), "revolutionary" or "game-changing" (hyperbolic), "simple" or "easy" without showing HOW, "platform" alone (always pair: "agent skills platform")

## Brand Voice

**Tone:** Confident but not arrogant — show expertise without talking down

**Style:** Practical and outcome-oriented — lead with what the reader can DO, not what the product IS. Agency-native language: "book of business", "client portfolio", "playbooks", "margins"

**Personality:** Anti-complexity, direct, builder-minded, empathetic to agency operators

## Proof Points

**Metrics:** Early stage — no public metrics yet

**Customers:** Early stage — no public logos yet

**Value themes:**
| Theme | Proof |
|-------|-------|
| Scale without hiring | Agent-per-client architecture, clone and deploy in minutes |
| Margins improve | Execution automated, headcount doesn't grow linearly |
| Expertise preserved | Skills.md codifies tribal knowledge into reusable files |
| Quality at scale | Validated skill repo ensures consistent execution |

## Goals

**Business goal:** Onboard growth marketing agencies, drive pipeline through content and product-led growth

**Conversion action:** Book 30-min demo via Calendly or sign up for free tier

**Current stage:** Early-stage, bootstrapped, pre-Product Hunt launch

## Integrations

**Native:** Supabase (Postgres + RLS), HubSpot (CRM), Smartlead (cold email), Slack (notifications)

**MCP Servers (18 maintained):**
- Email Finding: Hunter.io, RocketReach, Findymail, Prospeo, Icypeas
- Email Verification: NeverBounce
- Sales Engagement: Smartlead, Apollo.io
- Data Enrichment: Ocean.io, BuiltWith
- Web Scraping: Core Meerkats MCP (web scraping, RSS, Google Search)
- Productivity: Google Sheets, Hatch

**Data Import:** CSV, Google Search, Google Maps, web scraping/crawling

## Company

- Founded: 2024, Bengaluru, India
- Team: 2–10 employees (bootstrapped)
- Channels: LinkedIn (primary), X/Twitter, Indie Hackers, GitHub (18 repos)
- Demo: 30-min Calendly with founder Santanu DasGupta
