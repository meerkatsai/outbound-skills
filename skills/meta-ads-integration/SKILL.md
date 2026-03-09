---
name: meta-ads-integration
description: Execute Meta Ads operations through the local Meta Ads CLI for account discovery, campaign listing/creation/updates, insights pulls, ad set and ad listing, and lookalike audience creation. Use when a user asks about Facebook Ads or Meta Ads campaign management, performance checks, audience setup, or ad account inspection.
---

# Meta Ads Integration

Use this skill to run Meta Ads tasks via the local CLI at `tools/clis/meta-ads.js`.

## Prerequisites

- Require `META_ACCESS_TOKEN` in environment.
- Optional `META_AD_ACCOUNT_ID` for default account-scoped operations.
- Use Node.js 18+.

## Workflow

1. Validate connectivity first:
   - `node tools/clis/meta-ads.js accounts list`
2. Use the smallest read command that answers the user.
3. For mutating actions (`campaigns create`, `campaigns update`, `audiences create-lookalike`), run with `--dry-run` first.
4. Return raw JSON and summarize key IDs (`account id`, `campaign id`, `adset id`, `audience id`) and next action.

## Command Reference

### Accounts

- List ad accounts:
  - `node tools/clis/meta-ads.js accounts list`

### Campaigns

- List campaigns:
  - `node tools/clis/meta-ads.js campaigns list --account-id <id>`
- Fetch campaign insights:
  - `node tools/clis/meta-ads.js campaigns insights --id <campaign_id> --date-preset last_30d`
- Create campaign:
  - `node tools/clis/meta-ads.js campaigns create --account-id <id> --name "Q2 Prospecting" --objective OUTCOME_TRAFFIC --status PAUSED --dry-run`
- Update campaign status:
  - `node tools/clis/meta-ads.js campaigns update --id <campaign_id> --status ACTIVE --dry-run`

### Ad sets and ads

- List ad sets:
  - `node tools/clis/meta-ads.js adsets list --account-id <id>`
- List ads for an ad set:
  - `node tools/clis/meta-ads.js ads list --adset-id <adset_id>`

### Audiences

- List custom audiences:
  - `node tools/clis/meta-ads.js audiences list --account-id <id>`
- Create lookalike audience:
  - `node tools/clis/meta-ads.js audiences create-lookalike --account-id <id> --source-id <audience_id> --country US --name "US LAL 1%" --dry-run`

## Error Handling

- If API returns an error payload, pass it through verbatim.
- If account-scoped command fails and `--account-id` was omitted, retry with explicit account ID.
- If permissions fail, report the failing endpoint and required token scopes.

## Additional Reference

For command patterns and output expectations, see [references/cli-workflows.md](references/cli-workflows.md).
