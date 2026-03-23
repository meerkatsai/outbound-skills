#!/usr/bin/env node

const fs = require('fs')

const API_KEY = process.env.PHANTOMBUSTER_API_KEY
const BASE_URL = process.env.PHANTOMBUSTER_BASE_URL || 'https://api.phantombuster.com/api/v2'
const IS_DRY_RUN = process.argv.includes('--dry-run')

if (!API_KEY && !IS_DRY_RUN) {
  console.error(JSON.stringify({ error: 'PHANTOMBUSTER_API_KEY environment variable required' }))
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

function readJsonFile(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}

function parseJsonFlag(value, label) {
  if (value === undefined) return undefined
  try {
    return JSON.parse(value)
  } catch (err) {
    throw new Error(`Invalid JSON for --${label}: ${err.message}`)
  }
}

function parseIntFlag(value, label) {
  if (value === undefined) return undefined
  const parsed = Number(value)
  if (!Number.isInteger(parsed)) throw new Error(`--${label} must be an integer`)
  return parsed
}

function parseBoolFlag(value) {
  if (value === undefined) return undefined
  if (value === true || value === false) return value
  if (value === 'true' || value === '1') return true
  if (value === 'false' || value === '0') return false
  throw new Error('Expected boolean value (true/false/1/0)')
}

function requireFlag(value, label) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`--${label} required`)
  }
  return value
}

function bodyFromFlags(fallback) {
  if (args['body-file']) return readJsonFile(args['body-file'])
  if (args.body) return parseJsonFlag(args.body, 'body')
  return fallback
}

function queryFromArgs(allowed) {
  const query = {}
  for (const [flag, mapper] of allowed) {
    if (args[flag] === undefined) continue
    query[flag] = mapper(args[flag])
  }
  return query
}

function mergeQuery(base, extra) {
  return { ...(base || {}), ...(extra || {}) }
}

async function api(method, path, { body, query, headers } = {}) {
  const qs = query ? new URLSearchParams(query).toString() : ''
  const url = `${BASE_URL}${path}${qs ? '?' + qs : ''}`
  const finalHeaders = {
    Accept: 'application/json',
    'X-Phantombuster-Key': API_KEY,
    ...(headers || {}),
  }
  if (body !== undefined && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json'
  }

  if (args['dry-run']) {
    return {
      _dry_run: true,
      method,
      url,
      headers: { ...finalHeaders, 'X-Phantombuster-Key': '***' },
      body,
    }
  }

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
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

async function main() {
  let result

  switch (cmd) {
    case 'orgs':
      switch (sub) {
        case 'fetch':
          result = await api('GET', '/orgs/fetch')
          break
        case 'running-containers':
          result = await api('GET', '/orgs/fetch-running-containers')
          break
        default:
          result = { error: 'Unknown orgs subcommand. Use: fetch, running-containers' }
      }
      break

    case 'agents':
      switch (sub) {
        case 'fetch':
          result = await api('GET', '/agents/fetch', {
            query: mergeQuery({ id: requireFlag(args.id, 'id') }, parseJsonFlag(args['query-json'], 'query-json')),
          })
          break
        case 'fetch-all': {
          const query = mergeQuery(queryFromArgs([
            ['limit', (v) => String(parseIntFlag(v, 'limit'))],
            ['skip', (v) => String(parseIntFlag(v, 'skip'))],
          ]), parseJsonFlag(args['query-json'], 'query-json'))
          result = await api('GET', '/agents/fetch-all', { query })
          break
        }
        case 'fetch-output':
          result = await api('GET', '/agents/fetch-output', {
            query: mergeQuery({ id: requireFlag(args.id, 'id') }, parseJsonFlag(args['query-json'], 'query-json')),
          })
          break
        case 'launch': {
          const payload = bodyFromFlags({
            id: Number(requireFlag(args.id, 'id')),
            argument: args.argument !== undefined ? args.argument : undefined,
            saveArgument: args['save-argument'] !== undefined ? parseBoolFlag(args['save-argument']) : undefined,
          })
          result = await api('POST', '/agents/launch', { body: payload })
          break
        }
        case 'launch-sync': {
          const payload = bodyFromFlags({
            id: Number(requireFlag(args.id, 'id')),
            argument: args.argument !== undefined ? args.argument : undefined,
          })
          result = await api('POST', '/agents/launch-sync', { body: payload })
          break
        }
        case 'launch-soon': {
          const payload = bodyFromFlags({
            id: Number(requireFlag(args.id, 'id')),
            argument: args.argument !== undefined ? args.argument : undefined,
          })
          result = await api('POST', '/agents/launch-soon', { body: payload })
          break
        }
        case 'stop': {
          const payload = bodyFromFlags({ id: Number(requireFlag(args.id, 'id')) })
          result = await api('POST', '/agents/stop', { body: payload })
          break
        }
        case 'unschedule-all': {
          const payload = bodyFromFlags({ id: Number(requireFlag(args.id, 'id')) })
          result = await api('POST', '/agents/unschedule-all', { body: payload })
          break
        }
        default:
          result = {
            error: 'Unknown agents subcommand. Use: fetch, fetch-all, fetch-output, launch, launch-sync, launch-soon, stop, unschedule-all',
          }
      }
      break

    case 'containers':
      switch (sub) {
        case 'fetch':
          result = await api('GET', '/containers/fetch', {
            query: mergeQuery({ id: requireFlag(args.id, 'id') }, parseJsonFlag(args['query-json'], 'query-json')),
          })
          break
        case 'fetch-all': {
          const query = mergeQuery(queryFromArgs([
            ['id', (v) => String(parseIntFlag(v, 'id'))],
            ['limit', (v) => String(parseIntFlag(v, 'limit'))],
            ['skip', (v) => String(parseIntFlag(v, 'skip'))],
          ]), parseJsonFlag(args['query-json'], 'query-json'))
          if (!query.id) throw new Error('--id required (agent ID)')
          result = await api('GET', '/containers/fetch-all', { query })
          break
        }
        case 'fetch-output':
          result = await api('GET', '/containers/fetch-output', {
            query: mergeQuery({ id: requireFlag(args.id, 'id') }, parseJsonFlag(args['query-json'], 'query-json')),
          })
          break
        case 'fetch-result-object':
          result = await api('GET', '/containers/fetch-result-object', {
            query: mergeQuery({ id: requireFlag(args.id, 'id') }, parseJsonFlag(args['query-json'], 'query-json')),
          })
          break
        default:
          result = { error: 'Unknown containers subcommand. Use: fetch, fetch-all, fetch-output, fetch-result-object' }
      }
      break

    case 'request': {
      const method = String(requireFlag(args.method, 'method')).toUpperCase()
      const path = requireFlag(args.path, 'path')
      const query = args['query-json'] ? parseJsonFlag(args['query-json'], 'query-json') : undefined
      const body = bodyFromFlags(undefined)
      result = await api(method, path.startsWith('/') ? path : `/${path}`, { query, body })
      break
    }

    default:
      result = {
        error: 'Unknown command',
        usage: {
          orgs: {
            fetch: 'orgs fetch',
            running_containers: 'orgs running-containers',
          },
          agents: {
            fetch: 'agents fetch --id <agentId>',
            fetch_all: 'agents fetch-all [--limit <n>] [--skip <n>]',
            fetch_output: 'agents fetch-output --id <agentId>',
            launch: 'agents launch --id <agentId> [--argument "<json string>"] [--save-argument true|false]',
            launch_sync: 'agents launch-sync --id <agentId> [--argument "<json string>"]',
            launch_soon: 'agents launch-soon --id <agentId> [--argument "<json string>"]',
            stop: 'agents stop --id <agentId>',
            unschedule_all: 'agents unschedule-all --id <agentId>',
          },
          containers: {
            fetch: 'containers fetch --id <containerId>',
            fetch_all: 'containers fetch-all --id <agentId> [--limit <n>] [--skip <n>]',
            fetch_output: 'containers fetch-output --id <containerId>',
            fetch_result_object: 'containers fetch-result-object --id <containerId>',
          },
          request: {
            generic: 'request --method GET --path /agents/fetch --query-json \'{"id":123}\'',
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
