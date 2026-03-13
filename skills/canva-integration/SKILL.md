---
name: canva-integration
description: Use when the user needs to set up, test, or troubleshoot a Canva integration, Canva API workflow, brand template autofill flow, design export automation, asset upload, or OAuth/PKCE connection. Trigger on phrases like "Canva integration," "Canva API," "Canva brand templates," "autofill Canva," "export Canva designs," or "create a Canva tool."
metadata:
  version: 1.0.0
---

# Canva Integration

Use this skill for Canva Connect API setup, testing, and troubleshooting workflows.

## Execution Preference

1. Use Canva Connect API for programmatic design, export, folder, and asset workflows.
2. Use Canva brand templates when the user wants repeatable campaign or catalog creative generation.
3. Use Canva Enterprise autofill only when the user explicitly needs template dataset mapping and their workspace supports it.

Do not assume Canva supports static API keys for these flows. Default to OAuth 2.0 with PKCE.

## Required First Step

Before making changes, confirm or infer:

- objective (`setup`, `test`, `troubleshoot`, or `build`)
- Canva workflow type (`oauth`, `designs`, `exports`, `assets`, `folders`, or `brand-templates`)
- whether the user has Canva Enterprise if brand-template autofill is involved

If the user request is ambiguous, narrow it to the smallest viable Canva workflow first.

## Core Rules

- For user-authorized Canva access, use OAuth 2.0 Authorization Code with PKCE.
- Keep `code_verifier` server-side and send only `code_challenge` in the browser redirect.
- Use `http://127.0.0.1:<port>` for local OAuth callbacks, not `localhost`.
- Treat asset URL upload APIs as preview functionality and call that out if the user plans a public production integration.
- Brand-template dataset reading and autofill are Enterprise-oriented workflows; do not promise them for standard Canva plans.
- Prefer the local CLI for repeatable testing before hand-writing fetch snippets.

## Common Workflows

### Generate OAuth URL and exchange tokens

1. Generate PKCE values.
2. Build the Canva authorization URL with scopes and redirect URI.
3. Exchange the authorization code on the backend.
4. Store refresh/access tokens securely.

CLI path:

```bash
node tools/clis/canva.js oauth pkce
CANVA_CLIENT_ID=... node tools/clis/canva.js oauth auth-url --scopes 'design:meta:read profile:read' --code-challenge <challenge> --redirect-uri 'http://127.0.0.1:3000/callback'
```

### Create and export a design

1. Create a preset or custom-size design.
2. If needed, upload or attach assets.
3. Create an export job.
4. Poll export status and collect output URLs.

CLI path:

```bash
node tools/clis/canva.js designs create --title "Campaign Draft" --width 1080 --height 1080
node tools/clis/canva.js exports create --design-id <design_id> --format png --pages 1
```

### Upload marketing assets into Canva

1. Confirm the asset is reachable at a public URL.
2. Create a URL asset upload job.
3. Poll until the import completes.
4. Reuse the returned asset in designs or templates.

### Build a brand-template autofill flow

1. Verify the user has Canva Enterprise.
2. List/select the brand template.
3. Read the dataset definition.
4. Map source fields to Canva dataset fields.
5. Run autofill, then export or hand off to a human editor.

## Troubleshooting Order

Check these in order:

1. OAuth scopes match the endpoint being used.
2. Redirect URI exactly matches the app configuration.
3. Access token is valid and not expired.
4. The Canva account/team has access to the target design or template.
5. The workflow requires Enterprise and the workspace may not have it.
6. Preview APIs are not being relied on for production approval.

## Output Expectations

Return:

- workflow used (`oauth`, `designs`, `exports`, `assets`, `folders`, or `brand-templates`)
- whether the task was `setup`, `test`, `troubleshoot`, or `build`
- required scopes and plan constraints
- commands run or API calls proposed
- smallest next corrective step if anything is blocked

## References

- Integration guide: `tools/integrations/canva.md`
- CLI: `tools/clis/canva.js`
- Tool registry: `tools/REGISTRY.md`
