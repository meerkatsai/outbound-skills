#!/usr/bin/env node

const TOKEN = process.env.VERCEL_TOKEN
const BASE_URL = 'https://api.vercel.com'
const IS_DRY_RUN = process.argv.includes('--dry-run')

if (!TOKEN && !IS_DRY_RUN) {
  console.error(JSON.stringify({ error: 'VERCEL_TOKEN environment variable required' }))
  process.exit(1)
}

function parseArgs(argv) {
  const result = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const next = argv[i + 1]
      if (next && !next.startsWith('--')) {
        result[key] = next
        i++
      } else {
        result[key] = true
      }
    } else {
      result._.push(arg)
    }
  }
  return result
}

function withQuery(path, params) {
  const query = new URLSearchParams()
  for (const [k, v] of Object.entries(params || {})) {
    if (v !== undefined && v !== null && v !== '') {
      query.set(k, String(v))
    }
  }
  const qs = query.toString()
  return qs ? `${path}?${qs}` : path
}

async function api(method, path, body) {
  const url = `${BASE_URL}${path}`
  const headers = {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  }
  if (args['dry-run']) {
    return {
      _dry_run: true,
      method,
      url,
      headers: { ...headers, Authorization: 'Bearer ***' },
      body: body || undefined,
    }
  }
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return { status: res.status, body: text }
  }
}

const args = parseArgs(process.argv.slice(2))
const [cmd, sub] = args._

function optionalScope() {
  return args['team-id'] ? { teamId: args['team-id'] } : {}
}

async function main() {
  let result

  switch (cmd) {
    case 'projects':
      switch (sub) {
        case 'list':
          result = await api('GET', withQuery('/v9/projects', {
            ...optionalScope(),
            limit: args.limit || 20,
            from: args.from,
          }))
          break
        case 'get': {
          const id = args.id || args.name
          if (!id) { result = { error: '--id or --name required' }; break }
          result = await api('GET', withQuery(`/v9/projects/${encodeURIComponent(id)}`, optionalScope()))
          break
        }
        default:
          result = { error: 'Unknown projects subcommand. Use: list, get' }
      }
      break

    case 'deployments':
      switch (sub) {
        case 'list': {
          result = await api('GET', withQuery('/v6/deployments', {
            ...optionalScope(),
            projectId: args['project-id'],
            target: args.target,
            limit: args.limit || 20,
            from: args.from,
          }))
          break
        }
        case 'get': {
          const id = args.id || args['deployment-id']
          if (!id) { result = { error: '--id or --deployment-id required' }; break }
          result = await api('GET', withQuery(`/v13/deployments/${encodeURIComponent(id)}`, optionalScope()))
          break
        }
        case 'events': {
          const id = args.id || args['deployment-id']
          if (!id) { result = { error: '--id or --deployment-id required' }; break }
          result = await api('GET', withQuery(`/v2/deployments/${encodeURIComponent(id)}/events`, {
            ...optionalScope(),
            limit: args.limit,
            follow: args.follow ? 1 : undefined,
            until: args.until,
            since: args.since,
          }))
          break
        }
        case 'logs': {
          const id = args.id || args['deployment-id']
          if (!id) { result = { error: '--id or --deployment-id required' }; break }
          result = await api('GET', withQuery(`/v2/deployments/${encodeURIComponent(id)}/events`, {
            ...optionalScope(),
            builds: 1,
            limit: args.limit,
          }))
          break
        }
        default:
          result = { error: 'Unknown deployments subcommand. Use: list, get, events, logs' }
      }
      break

    case 'domains':
      switch (sub) {
        case 'list':
          result = await api('GET', withQuery('/v6/domains', {
            ...optionalScope(),
            limit: args.limit || 20,
            since: args.since,
            until: args.until,
          }))
          break
        case 'check': {
          const domain = args.domain
          if (!domain) { result = { error: '--domain required' }; break }
          result = await api('GET', withQuery(`/v6/domains/${encodeURIComponent(domain)}/config`, optionalScope()))
          break
        }
        default:
          result = { error: 'Unknown domains subcommand. Use: list, check' }
      }
      break

    case 'aliases':
      switch (sub) {
        case 'list':
          result = await api('GET', withQuery('/v2/aliases', {
            ...optionalScope(),
            deploymentId: args['deployment-id'],
            projectId: args['project-id'],
            limit: args.limit || 20,
            from: args.from,
          }))
          break
        default:
          result = { error: 'Unknown aliases subcommand. Use: list' }
      }
      break

    case 'team':
      switch (sub) {
        case 'get': {
          const id = args['team-id'] || args.id
          if (!id) { result = { error: '--team-id or --id required' }; break }
          result = await api('GET', `/v2/teams/${encodeURIComponent(id)}`)
          break
        }
        default:
          result = { error: 'Unknown team subcommand. Use: get' }
      }
      break

    default:
      result = {
        error: 'Unknown command',
        usage: {
          projects: {
            list: 'projects list [--team-id <id>] [--limit <n>] [--from <cursor>]',
            get: 'projects get --id <project_id> | --name <project_name> [--team-id <id>]',
          },
          deployments: {
            list: 'deployments list [--project-id <id>] [--target preview|production] [--team-id <id>] [--limit <n>]',
            get: 'deployments get --id <deployment_id> [--team-id <id>]',
            events: 'deployments events --id <deployment_id> [--team-id <id>] [--follow] [--limit <n>]',
            logs: 'deployments logs --id <deployment_id> [--team-id <id>] [--limit <n>]',
          },
          domains: {
            list: 'domains list [--team-id <id>] [--limit <n>]',
            check: 'domains check --domain <name> [--team-id <id>]',
          },
          aliases: {
            list: 'aliases list [--deployment-id <id>] [--project-id <id>] [--team-id <id>] [--limit <n>]',
          },
          team: {
            get: 'team get --team-id <id>',
          },
        },
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }))
  process.exit(1)
})
