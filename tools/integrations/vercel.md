# Vercel

Frontend cloud platform for deployments, preview environments, domains, and edge configuration.

## Capabilities

| Integration | Available | Notes |
|-------------|-----------|-------|
| API | ✓ | Vercel REST API for projects, deployments, domains |
| MCP | ✓ | Official MCP server at `https://mcp.vercel.com` |
| CLI | ✓ | Local CLI: [vercel.js](../clis/vercel.js); official `vercel` CLI also available |
| SDK | ✓ | Official SDKs and API clients |

## Authentication

- **Type**: OAuth (MCP) and API token (REST API)
- **MCP server**: `https://mcp.vercel.com`
- **REST header**: `Authorization: Bearer {VERCEL_TOKEN}`
- **Env var**: `VERCEL_TOKEN` (required for `tools/clis/vercel.js` unless `--dry-run`)

## Common Agent Operations

### MCP: list projects

Tool: `list_projects`

```json
{
  "limit": 20
}
```

### MCP: list deployments

Tool: `list_deployments`

```json
{
  "projectId": "prj_xxx",
  "limit": 20
}
```

### MCP: get deployment details

Tool: `get_deployment`

```json
{
  "id": "dpl_xxx"
}
```

### MCP: get deployment build logs

Tool: `get_deployment_build_logs`

```json
{
  "id": "dpl_xxx"
}
```

### MCP: list domains

Tool: `list_domains`

```json
{
  "limit": 50
}
```

### REST API: list projects

```bash
GET https://api.vercel.com/v9/projects
```

### REST API: list deployments

```bash
GET https://api.vercel.com/v13/deployments?projectId={project_id}&limit=20
```

### REST API: get deployment

```bash
GET https://api.vercel.com/v13/deployments/{deployment_id}
```

### REST API: list domains

```bash
GET https://api.vercel.com/v6/domains
```

## Key Metrics

| Metric | Description |
|--------|-------------|
| `readyState` | Deployment status (`QUEUED`, `BUILDING`, `READY`, `ERROR`) |
| `createdAt` | Deployment creation timestamp |
| `target` | Environment target (`production`, `preview`) |
| `url` | Deployment URL |
| `build logs` | Build and runtime output for troubleshooting |
| `domain status` | Verification and assignment state for custom domains |

## MCP Tool Groups

- **Project/Team**: `get_team`, `list_projects`, `get_project`
- **Deployments**: `list_deployments`, `get_deployment`, `get_deployment_events`, `get_deployment_build_logs`
- **Domains/Aliases**: `list_domains`, `check_domain_status`, `list_aliases`
- **Config & Access**: `list_edge_configs`, `list_access_groups`, `get_access_group`
- **Docs/Search**: `search_docs`, `search_changelog`, `search_marketplace`, `search_templates`

## When to Use

- Auditing deployment health and release status
- Investigating failed builds and deployment errors
- Reviewing preview vs production deployments
- Checking custom domain verification and routing
- Discovering Vercel docs/templates/changelog from inside agent workflows

## Rate Limits

- Vercel applies API and account-level limits by plan and endpoint
- Use pagination (`limit`, cursors) for large result sets
- Back off and retry on `429` responses

## Relevant Skills

- launch-strategy
- page-cro
- analytics-tracking
- site-architecture
