# Versions

## 0.1.6 - 2026-03-11

- Added `meerkats-product-context` skill with pre-filled Meerkats.ai product marketing context for automation.
- Added `web-content-researcher` skill for data-driven content topic discovery across 5 research categories.
- Added `content-calendar` skill for 7-day multi-channel content planning (LinkedIn, YouTube, blog).
- Added `content-refresh-scheduler` skill to orchestrate the full content pipeline and save to Notion.

## 0.1.5 - 2026-03-07

- Added `email-find-verify` skill to route email discovery/verification tasks after user chooses a provider tool.

## 0.1.4 - 2026-03-07

- Added `web-search-scrape` skill to route web search/scrape tasks after user selects `parallel-ai`, `tavily-ai`, or `firecrawl`.

## 0.1.3 - 2026-03-07

- Added `pipedrive-crm` skill under `skills/pipedrive-crm/`.

## 0.1.2 - 2026-03-07

- Added `resend-email` skill under `skills/resend-email/` with Resend sending workflows and references.

## 0.1.1 - 2026-03-06

- Added `product-marketing-context` skill to `skills/`.

## 0.1.0 - 2026-03-06

- Added baseline repository docs and contribution guidance.
- Added local and CI validation workflows.
- Added smoke tests for CLI dry-run behavior and argument validation.
- Fixed `--dry-run` behavior to work without configured API secrets.
- Fixed Instantly and Apollo documentation mismatches.
- Hardened Resend CLI ID argument validation.
