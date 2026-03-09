---
name: vercel-integration
description: Use when a user needs Vercel operations like listing projects, checking deployments, reading/updating environment variables, or managing team-scoped Vercel resources. Prefer Vercel MCP first, then use REST API when deterministic endpoint calls are needed.
metadata:
  version: 1.0.0
---

# Vercel Integration

Use this skill for Vercel project and deployment operations.

## Execution Preference

1. Use **Vercel MCP** first (`https://mcp.vercel.com`, OAuth).
2. Use **Vercel REST API** second (`https://api.vercel.com`) for explicit endpoint workflows.

Do not assume a local Vercel CLI exists for this skill flow.

## Required First Step

Before execution, confirm:

- target scope (`personal` or team slug/teamId)
- operation type (projects, deployments, or env vars)

If scope is not provided, ask for it first.

## Auth Requirements

- **MCP**: OAuth via configured MCP server
- **REST**: `Authorization: Bearer ${VERCEL_API_TOKEN}`

## Common Operations (REST Fallback)

### List projects

```bash
curl --request GET \
  --url "https://api.vercel.com/v9/projects" \
  --header "Authorization: Bearer ${VERCEL_API_TOKEN}"
```

### List deployments

```bash
curl --request GET \
  --url "https://api.vercel.com/v6/deployments" \
  --header "Authorization: Bearer ${VERCEL_API_TOKEN}"
```

### List project env vars

```bash
curl --request GET \
  --url "https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env" \
  --header "Authorization: Bearer ${VERCEL_API_TOKEN}"
```

### Create project env var

```bash
curl --request POST \
  --url "https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/env" \
  --header "Authorization: Bearer ${VERCEL_API_TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{"key":"API_URL","value":"https://api.example.com","target":["production"],"type":"plain"}'
```

## Team Scope Rules

- For team resources, include `teamId` or `slug` query parameters.
- If results are empty, verify active scope before assuming resources do not exist.

## Output Expectations

Return:

- execution path used (`MCP` or `REST`)
- scope used (personal/team slug/teamId)
- operation performed
- concise result summary (project names, deployment states, env keys)
- next corrective step when an error occurs (auth, scope, or permission)

## Reference

- Integration guide: `tools/integrations/vercel.md`
