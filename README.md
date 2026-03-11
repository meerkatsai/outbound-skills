# gtm-skills

Reusable GTM-focused skills, integration guides, and zero-dependency Node.js CLIs for outbound, enrichment, CRM, ads, and email workflows.

## What's Included

- `skills/`: agent skills (`SKILL.md`) and supporting references
  - Current skills: `apollo-outbound`, `competitor-alternatives`, `content-calendar`, `content-refresh-scheduler`, `email-find-verify`, `meerkats-product-context`, `meta-ads-integration`, `pipedrive-crm`, `product-marketing-context`, `rb2b-integration`, `resend-email`, `smartlead-outbound`, `trigify-integration`, `vercel-integration`, `web-content-researcher`, `web-search-scrape`
- `tools/clis/`: runnable CLIs for Smartlead, Instantly, Apollo, Icypeas, Findymail, NeverBounce, MillionVerifier, Prospeo, RocketReach, BuiltWith, Hunter, Lemlist, Resend, Google Ads, Meta Ads, Firecrawl, Parallel AI, and Tavily AI
- `tools/integrations/`: integration-level guides and auth setup notes
- `validate-skills.sh`: local validation entrypoint

## Requirements

- Node.js 18+
- API credentials via environment variables for each integration

## Quick Start

```bash
npm test
./validate-skills.sh
```

## Load Skills Directly in Meerkats.ai

Users can load and use these skills directly from the Meerkats.ai Skill Store (no local clone required).

![Meerkats.ai Skill Store](docs/skill-store.png)

Video walkthrough: [Browse Skills.mp4](docs/browse-skills.mp4)

Follow this flow in Meerkats.ai (as shown in the Skill Store screenshot):

1. Open **Skill Store** in the left sidebar.
2. Click **Browse Skills**.
3. In **Search skills...**, type `gtm` or a skill name like `apollo-outbound`.
4. Select skills published from `meerkatsai/gtm-skills` (for example, `gtm-skills Agent`, `apollo-outbound`, `smartlead-outbound`, `pipedrive-crm`).
5. Click **Try** on the skill card to load and run it in chat.

Tips:
- Use filters like **Popular**, **All Prices**, and **All Publishers** to narrow results.
- You can load individual skills directly (for example `email-find-verify`) instead of loading the whole set first.

## Safety

- Use `--dry-run` for write operations before running live API calls.
- Never commit API keys or access tokens.
