# gtm-skills

Reusable GTM-focused skills, integration guides, and zero-dependency Node.js CLIs for outbound, enrichment, CRM, ads, and email workflows.

## What's Included

- `skills/`: agent skills (`SKILL.md`) and supporting references
  - Current skills: `apollo-outbound`, `competitor-alternatives`, `pipedrive-crm`, `product-marketing-context`, `resend-email`, `smartlead-outbound`, `web-search-scrape`
- `tools/clis/`: runnable CLIs for Smartlead, Instantly, Apollo, Hunter, Lemlist, Resend, Google Ads, Meta Ads, Firecrawl, Parallel AI, and Tavily AI
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

## Safety

- Use `--dry-run` for write operations before running live API calls.
- Never commit API keys or access tokens.
