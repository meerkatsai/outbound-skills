---
name: vercel-operations
description: "Operate Vercel projects and deployments using the Vercel MCP server. Use when users ask about Vercel project status, deployment failures, build logs, preview/production releases, domain checks, alias checks, or team/project lookups."
metadata:
  version: 1.0.0
---

# Vercel Operations

Use this skill for common Vercel operational tasks, with MCP first.

## Prerequisites

- Vercel MCP server: `https://mcp.vercel.com`
- OAuth authorization to access the user's Vercel scope
- Optional fallback: `VERCEL_TOKEN` for REST API/CLI workflows

## Core Workflow

1. Identify scope first: team, project, environment (`preview` or `production`).
2. Start with read-only checks to establish baseline state.
3. For incidents, gather deployment details and build logs before suggesting changes.
4. For domain issues, verify domain status and aliases together.
5. Report concrete IDs and links: `projectId`, `deploymentId`, URL, status.

## Common MCP Tasks

### 1) List projects

Tool: `list_projects`

```json
{
  "limit": 20
}
```

### 2) Check recent deployments for a project

Tool: `list_deployments`

```json
{
  "projectId": "prj_xxx",
  "limit": 20
}
```

### 3) Inspect one deployment

Tool: `get_deployment`

```json
{
  "id": "dpl_xxx"
}
```

### 4) Pull build logs for failures

Tool: `get_deployment_build_logs`

```json
{
  "id": "dpl_xxx"
}
```

### 5) Review deployment events/timeline

Tool: `get_deployment_events`

```json
{
  "id": "dpl_xxx"
}
```

### 6) Validate domains and routing

Tools: `list_domains`, `check_domain_status`, `list_aliases`

```json
{
  "limit": 50
}
```

## Quick Triage Playbook

### Deployment failed

1. `get_deployment`
2. `get_deployment_events`
3. `get_deployment_build_logs`
4. Summarize root cause and the first unblocking fix

### Site down / wrong version live

1. `list_deployments` (filter by target)
2. `get_deployment` for latest production
3. `list_aliases` and domain checks
4. Confirm expected deployment URL is aliased

### Domain not resolving

1. `list_domains`
2. `check_domain_status`
3. `list_aliases`
4. Identify whether issue is verification, DNS, or alias mapping

## Status Signals to Report

- `readyState`: `QUEUED`, `BUILDING`, `READY`, `ERROR`
- `target`: `preview` or `production`
- `createdAt`: timestamp to identify freshest deployment
- deployment URL and any attached aliases/domains

## Fallbacks

- If MCP access is unavailable, use REST API calls from `tools/integrations/vercel.md`.
- Keep operations read-only unless user explicitly asks to mutate state.

## Related Guides

- Integration reference: [../../tools/integrations/vercel.md](../../tools/integrations/vercel.md)
- Optional deep workflows: [references/common-workflows.md](references/common-workflows.md)
