---
name: instantly-integration
description: Use when the user needs to set up, test, or troubleshoot an Instantly integration, Instantly campaign workflow, lead sync, account warmup status check, blocklist update, or analytics pull. Trigger on phrases like "Instantly integration," "Instantly campaign," "add leads to Instantly," "Instantly warmup," or "Instantly API."
metadata:
  version: 1.0.0
---

# Instantly Integration

Use this skill for Instantly campaign, lead, account, blocklist, and analytics workflows.

## Execution Preference

1. Use the local Instantly CLI in this repo for repeatable API testing and operations.
2. Use direct API requests only when the user needs a payload or endpoint the CLI does not cover.
3. Treat account health and warmup status as a first-class dependency before changing campaign volume.

Do not assume Instantly uses bearer auth. Its documented API uses `api_key` as a query parameter.

## Required First Step

Before making changes, confirm or infer:

- objective (`setup`, `test`, `troubleshoot`, or `build`)
- Instantly workflow type (`campaigns`, `leads`, `accounts`, `analytics`, or `blocklist`)
- whether the user already has an `INSTANTLY_API_KEY`
- campaign ID or account email when the task targets a specific campaign or inbox

If the request is broad, narrow it to the smallest Instantly action first.

## Core Rules

- Use the existing Instantly CLI before hand-writing requests.
- Require `campaign_id` for campaign lead operations.
- Use the email account ID exactly as Instantly expects for account status and warmup checks.
- Check warmup/account status before recommending higher send volume or campaign launch.
- Use dry-run when testing request shape without sending live mutations.

## Common Workflows

### Manage campaigns

1. List campaigns or fetch a specific campaign.
2. Inspect status.
3. Launch or pause once prerequisites are clear.

CLI path:

```bash
node tools/clis/instantly.js campaigns list --limit 20
node tools/clis/instantly.js campaigns status --id cam_abc123
node tools/clis/instantly.js campaigns launch --id cam_abc123
```

### Sync leads into a campaign

1. Confirm the target `campaign_id`.
2. Add, inspect, or remove leads.
3. Check lead status after the change.

CLI path:

```bash
node tools/clis/instantly.js leads add --campaign-id cam_abc123 --email john@example.com --first-name John --last-name Doe --company "Example Inc"
node tools/clis/instantly.js leads status --campaign-id cam_abc123 --email john@example.com
```

### Check account health and warmup

1. List connected accounts.
2. Check account status.
3. Check warmup status before scaling.

CLI path:

```bash
node tools/clis/instantly.js accounts list --limit 20
node tools/clis/instantly.js accounts status --account-id me@example.com
node tools/clis/instantly.js accounts warmup-status --account-id me@example.com
```

### Pull analytics

Use analytics when the user needs campaign performance, step-level breakdowns, or account-wide date-range stats.

CLI path:

```bash
node tools/clis/instantly.js analytics campaign --campaign-id cam_abc123 --start-date 2026-01-01 --end-date 2026-01-31
node tools/clis/instantly.js analytics steps --campaign-id cam_abc123
node tools/clis/instantly.js analytics account --start-date 2026-01-01 --end-date 2026-01-31
```

### Update the blocklist

Use this when the user needs to suppress internal domains, competitors, or invalid addresses.

CLI path:

```bash
node tools/clis/instantly.js blocklist list
node tools/clis/instantly.js blocklist add --entries "competitor.com,spam@example.com"
```

## Troubleshooting Order

Check these in order:

1. `INSTANTLY_API_KEY` is present and valid.
2. The campaign ID or account email is correct.
3. The target account is healthy and warmup is in a safe state.
4. Lead email format and required fields are valid.
5. Date ranges or campaign IDs passed to analytics match real entities.

## Output Expectations

Return:

- workflow used (`campaigns`, `leads`, `accounts`, `analytics`, or `blocklist`)
- whether the task was `setup`, `test`, `troubleshoot`, or `build`
- commands run or API calls proposed
- campaign IDs or account emails involved
- smallest next corrective step if something is blocked

## References

- Integration guide: `tools/integrations/instantly.md`
- CLI: `tools/clis/instantly.js`
- Tool registry: `tools/REGISTRY.md`
