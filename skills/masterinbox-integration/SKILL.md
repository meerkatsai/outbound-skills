---
name: masterinbox-integration
description: Use when the user needs to set up, test, or troubleshoot a Master Inbox integration, send or draft a Master Inbox message, manage prospects, labels, workspaces, members, channels, exclusions, or trigger a Master Inbox webhook. Trigger on phrases like "Master Inbox integration," "Master Inbox API," "send with Master Inbox," "Master Inbox workspace," or "Master Inbox labels."
metadata:
  version: 1.0.0
---

# Master Inbox Integration

Use this skill for Master Inbox API and CLI workflows.

## Execution Preference

1. Use the local Master Inbox CLI in this repo for repeatable API testing and operational workflows.
2. Use direct API calls only when the user needs an endpoint or payload shape not yet covered by the CLI.
3. Prefer `--body-file` for complex payloads such as invitations, custom providers, and exclusion updates.

Do not assume query-string auth. The documented API uses bearer auth in the `Authorization` header.

## Required First Step

Before making changes, confirm or infer:

- objective (`setup`, `test`, `troubleshoot`, or `build`)
- workflow type (`messages`, `prospects`, `labels`, `workspaces`, `members`, `channels`, `providers`, `exclusions`, or `webhooks`)
- whether the user already has a `MASTERINBOX_API_TOKEN`
- the target identifiers such as `prospect_id`, `label_id`, `workspace`, `channel_id`, or `workflow_id`

If the request is broad, narrow it to the smallest Master Inbox action first.

## Core Rules

- Use `Authorization: Bearer {MASTERINBOX_API_TOKEN}`.
- Use the published API field names exactly as documented.
- Prefer dry-run first when validating a new request shape.
- For send-message operations, include all documented required fields even if some are blank strings.
- For bulk or nested payloads, store JSON in files and pass them with `--body-file`.

## Common Workflows

### Send or draft a message

1. Confirm `prospect_id` and recipients.
2. Send the message or save a draft.
3. If needed, inspect messages or replies for the same prospect.

CLI path:

```bash
node tools/clis/masterinbox.js messages send --prospect-id 123 --subject "Intro" --message "Hi there" --to person@example.com
node tools/clis/masterinbox.js messages draft --prospect-id 123 --message "Follow-up draft"
node tools/clis/masterinbox.js replies list --page 1 --limit 25 --sort-by createdAt --prospect-id 123 --search-keyword ""
```

### Manage labels and prospect labels

1. List existing labels.
2. Create or update a label.
3. Attach the label to a prospect or inspect current prospect labels.

CLI path:

```bash
node tools/clis/masterinbox.js labels list
node tools/clis/masterinbox.js labels add --label-name "Priority" --label-color "#ff6b6b"
node tools/clis/masterinbox.js prospects add-label --prospect-id 123 --email person@example.com --label-id 77
```

### Manage prospects and inbox assignment

1. Create or update the prospect.
2. Look up the prospect by email or LinkedIn URL.
3. Move one or more prospects into the correct inbox type.

CLI path:

```bash
node tools/clis/masterinbox.js prospects create --first-name Jane --last-name Doe --email jane@example.com --custom-1 "" --custom-2 ""
node tools/clis/masterinbox.js prospects by-email --email jane@example.com
node tools/clis/masterinbox.js prospects move-to-list --prospect-ids 123,124 --inbox-type-id 9
```

### Manage workspaces, members, and channels

1. List or create the workspace.
2. Send a member invitation when permissions are clear.
3. Inspect or remove channels if inbox plumbing is the issue.

CLI path:

```bash
node tools/clis/masterinbox.js workspaces list
node tools/clis/masterinbox.js members invite --body-file member-invite.json
node tools/clis/masterinbox.js channels list --page 1 --limit 25 --imap true --smtp true --provider-type all
```

### Configure exclusions or custom providers

Use this when deliverability, routing, or provider setup is the blocker.

CLI path:

```bash
node tools/clis/masterinbox.js exclusions get
node tools/clis/masterinbox.js exclusions add-tags --exclusion-tags "competitor,internal"
node tools/clis/masterinbox.js providers add-custom --body-file custom-provider.json
```

## Troubleshooting Order

Check these in order:

1. `MASTERINBOX_API_TOKEN` is present and valid.
2. The target resource ID is correct.
3. Required DTO fields are present, especially on message, prospect, and invitation payloads.
4. Complex payloads are passed with `--body-file` instead of fragile inline JSON.
5. Workspace, inbox type, label, or channel dependencies exist before attaching other objects to them.

## Output Expectations

Return:

- workflow used (`messages`, `prospects`, `labels`, `workspaces`, `members`, `channels`, `providers`, `exclusions`, or `webhooks`)
- whether the task was `setup`, `test`, `troubleshoot`, or `build`
- commands run or request shapes proposed
- IDs or emails involved
- smallest next corrective step if anything is blocked

## References

- Integration guide: `tools/integrations/masterinbox.md`
- CLI: `tools/clis/masterinbox.js`
- Tool registry: `tools/REGISTRY.md`
