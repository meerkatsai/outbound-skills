# Feasibility Check Reference — Meerkats Outbound

## Available Data Sources

| Capability | Exact Source | What It Gives Us |
|---|---|---|
| Company firmographics | Apollo API, Crunchbase | Employee count, funding, industry, location, tech stack |
| Contact enrichment | Apollo API | Name, title, email, seniority, LinkedIn URL |
| Job postings (live) | LinkedIn Jobs (public pages), company career pages (scrape), Indeed | Who they're hiring, role descriptions, team size signals |
| Technographic data | Apollo, BuiltWith, G2 tech stack profiles | What tools they use (CRM, marketing automation, etc.) |
| News & PR | Google News, company press pages, regional startup media (TechCrunch, YourStory, Inc42, EU-Startups, Tech in Asia — match to company's geography) | Funding rounds, product launches, partnerships, expansion announcements |
| Company website content | Direct scraping (homepage, pricing, about, blog) | Product positioning, ICP indicators, pricing model, GTM motion |
| G2/Capterra reviews | G2.com, Capterra (public review pages) | How their customers describe them, competitor comparisons, pain points |
| LinkedIn company page | LinkedIn (public) | Employee count trends, recent posts, company updates |
| Social media | Twitter/X (public), LinkedIn posts (public) | Founder activity, content strategy, engagement patterns |
| Industry reports | Public reports, analyst blogs | Market sizing, trends, category dynamics |

## What We CANNOT Access (never promise these)
- The prospect's internal product analytics (user counts, usage data, free-tier limits, cohort behavior, conversion rates)
- The prospect's CRM data (pipeline, deal stages, customer lists)
- The prospect's internal hiring pipeline (only public job postings are visible)
- Private procurement processes (PO status, budget approvals, vendor evaluations)
- Private Slack/Discord communities the prospect runs
- Any data behind a login wall we don't have credentials for

## What We CANNOT Promise
- Specific conversion metrics or timelines ("meetings in week 3", "3x pipeline")
- Access to data we'd need the prospect to provide
- Results that depend on the prospect's internal execution

## Three-Question Feasibility Test

For each offer component, answer:
1. "What exact data source does this use?" — Name it (Apollo, LinkedIn Jobs, Google News, etc.). If you can't name a specific source, the component is not feasible.
2. "Does this require anything from inside the prospect's systems?" — If yes, remove or reframe.
3. "Are we promising an outcome or delivering a system?" — We deliver systems. Never promise outcomes.

## Reframing Examples

| Infeasible Claim | Why It Fails | Feasible Reframe | Data Source |
|---|---|---|---|
| "Detects when users hit free-tier limits" | Requires prospect's product analytics | "Builds a target list by scraping department pages and publication activity, then sequences the decision-maker" | Websites (scrape), Apollo (enrichment) |
| "Monitors when a CFO signs a capex PO" | Requires internal procurement data | "Triggers outreach when a company posts 50+ job openings — a public signal that procurement typically follows" | LinkedIn Jobs, Apollo hiring data |
| "Your new hire will book 3 meetings in week 3" | Outcome we can't control | "Gives your new hire a ready-to-run targeting list and sequences from day one" | N/A — framing change |
| "Tracks which campaign produced a cohort" | Requires attribution data | "Maps which accounts are actively posting about related tools — warm accounts for outreach" | LinkedIn posts, academic Twitter |
