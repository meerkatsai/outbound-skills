# Meta Ads CLI Workflows

## Fast Triage

1. `accounts list`
2. `campaigns list --account-id <id>`
3. `campaigns insights --id <campaign_id>`

## Status Change Pattern

1. Read campaign:
   - `campaigns list --account-id <id>`
2. Dry run change:
   - `campaigns update --id <campaign_id> --status PAUSED --dry-run`
3. Execute without dry run.
4. Re-read campaign list or insights to verify update.

## Audience Expansion Pattern

1. List existing audiences:
   - `audiences list --account-id <id>`
2. Dry run lookalike creation:
   - `audiences create-lookalike --account-id <id> --source-id <id> --country US --dry-run`
3. Execute.
4. Re-list audiences and capture new audience ID.

## Output Contract

Always return:

- Raw JSON from CLI.
- Human summary with key IDs and status fields.
- Clear next step if follow-up action is needed.
