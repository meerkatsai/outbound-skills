---
name: prospeo-integration
description: Use when the user needs to set up, test, or troubleshoot a Prospeo integration, run person/company enrichment, execute bulk enrichment, check account credits, or validate Prospeo request payloads. Trigger on phrases like "Prospeo integration," "Prospeo enrich," "find email with Prospeo," "Prospeo credits," or "Prospeo API."
metadata:
  version: 1.0.0
---

# Prospeo Integration

Use this skill for Prospeo person/company enrichment and account-credit workflows.

## Execution Preference

1. Use the local Prospeo CLI in this repo for repeatable API operations.
2. Use direct API requests only when the user needs payload control not exposed by the CLI.
3. Start with a single-record enrichment before running bulk operations.

Prospeo enrichment endpoints expect payloads in a `data` wrapper object.

## Required First Step

Before making changes, confirm or infer:

- objective (`setup`, `test`, `troubleshoot`, or `build`)
- Prospeo workflow type (`person`, `company`, `bulk`, `search`, or `account`)
- whether `PROSPEO_API_KEY` is available in the environment
- enrichment inputs (LinkedIn URL, full name, company website/domain, or JSON payload)

If the request is broad, narrow to one person enrichment first.

## Core Rules

- Use the existing Prospeo CLI before hand-writing requests.
- Validate request shape with `--dry-run` before live calls when possible.
- Prefer `--only-verified-email` for stricter email quality in person enrich workflows.
- Use normalized company domains for `--company-website` inputs (for example, `apollo.io`).
- For larger batches, test one row first to confirm response fields and credit usage.

## Common Workflows

### Check account credits

1. Confirm API key access.
2. Inspect remaining and used credits.

CLI path:

```bash
node tools/clis/prospeo.js account info
```

### Enrich one person

1. Start with LinkedIn URL when available.
2. Fall back to full name + company website.
3. Use verified-only mode when email deliverability matters.

CLI path:

```bash
node tools/clis/prospeo.js person enrich --json '{"data":{"linkedin_url":"https://www.linkedin.com/in/example","only_verified_email":true}}'
node tools/clis/prospeo.js person enrich --json '{"data":{"full_name":"Tim Zheng","company_website":"apollo.io","only_verified_email":true}}'
```

### Bulk enrich people

1. Prepare bulk payload with `data` array.
2. Run on a small sample before full list.

CLI path:

```bash
node tools/clis/prospeo.js person bulk-enrich --json '{"data":[{"full_name":"Tim Zheng","company_website":"apollo.io"}]}'
```

### Enrich/search companies

Use this when person-level inputs are weak and company enrichment is needed first.

CLI path:

```bash
node tools/clis/prospeo.js company enrich --company-website apollo.io
node tools/clis/prospeo.js company search --json '{"query":"b2b saas companies","limit":20}'
```

## Troubleshooting Order

Check these in order:

1. `PROSPEO_API_KEY` is present and valid.
2. Payload uses Prospeo's required `data` wrapper shape for enrich endpoints.
3. LinkedIn URL/domain inputs are well-formed and normalized.
4. The requested entity is discoverable in Prospeo's dataset.
5. Credits are available and rate limits are not being hit.

## Output Expectations

Return:

- workflow used (`person`, `company`, `bulk`, `search`, or `account`)
- whether the task was `setup`, `test`, `troubleshoot`, or `build`
- commands run or API calls proposed
- key identifiers used (LinkedIn URL, domain, or full name)
- smallest next corrective step if blocked

## References

- Integration guide: `tools/integrations/prospeo.md`
- CLI: `tools/clis/prospeo.js`
- Tool registry: `tools/REGISTRY.md`
