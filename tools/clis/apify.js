#!/usr/bin/env node

const fs = require('fs')

const API_TOKEN = process.env.APIFY_API_TOKEN
const BASE_URL = process.env.APIFY_BASE_URL || 'https://api.apify.com/v2'

if (!API_TOKEN && !process.argv.includes('--dry-run')) {
  console.error(JSON.stringify({ error: 'APIFY_API_TOKEN environment variable required' }))
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

function parseJsonFlag(value, label) {
  if (!value) return undefined
  try {
    return JSON.parse(value)
  } catch (err) {
    throw new Error(`Invalid JSON for --${label}: ${err.message}`)
  }
}

function readJsonFile(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}

function parseCsv(value) {
  if (!value) return undefined
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function parseIntFlag(value, label) {
  if (value === undefined) return undefined
  const parsed = Number(value)
  if (!Number.isInteger(parsed)) throw new Error(`--${label} must be an integer`)
  return parsed
}

function buildQueryFromFlags() {
  const query = {}
  if (args.limit !== undefined) query.limit = String(parseIntFlag(args.limit, 'limit'))
  if (args.offset !== undefined) query.offset = String(parseIntFlag(args.offset, 'offset'))
  if (args.desc !== undefined) query.desc = String(args.desc)
  if (args.clean !== undefined) query.clean = String(args.clean)
  if (args.format !== undefined) query.format = String(args.format)
  if (args.fields !== undefined) query.fields = String(args.fields)
  if (args.unwind !== undefined) query.unwind = String(args.unwind)
  if (args['skip-empty'] !== undefined) query.skipEmpty = String(args['skip-empty'])
  if (args['skip-hidden'] !== undefined) query.skipHidden = String(args['skip-hidden'])
  if (args['simplified'] !== undefined) query.simplified = String(args['simplified'])
  return query
}

async function api(method, path, { body, headers, query } = {}) {
  const qs = query ? new URLSearchParams(query).toString() : ''
  const url = `${BASE_URL}${path}${qs ? '?' + qs : ''}`

  const finalHeaders = {
    Accept: 'application/json',
    ...(headers || {}),
  }
  if (!args['dry-run']) {
    finalHeaders.Authorization = `Bearer ${API_TOKEN}`
  }
  if (body !== undefined && body !== null && !finalHeaders['Content-Type']) {
    finalHeaders['Content-Type'] = 'application/json'
  }

  if (args['dry-run']) {
    return {
      _dry_run: true,
      method,
      url,
      headers: { ...finalHeaders, Authorization: finalHeaders.Authorization ? 'Bearer ***' : undefined },
      body: body,
    }
  }

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body === undefined || body === null
      ? undefined
      : (finalHeaders['Content-Type'] === 'application/json' ? JSON.stringify(body) : body),
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
    case 'users':
      switch (sub) {
        case 'me':
          result = await api('GET', '/users/me')
          break
        default:
          result = { error: 'Unknown users subcommand. Use: me' }
      }
      break

    case 'actors':
      switch (sub) {
        case 'run': {
          const actorId = args.id || args.actor
          if (!actorId) { result = { error: '--id required (actor ID or username~actor-name)' }; break }
          const query = {}
          if (args.timeout !== undefined) query.timeout = String(args.timeout)
          if (args.memory !== undefined) query.memory = String(args.memory)
          if (args['build'] !== undefined) query.build = String(args['build'])
          if (args['wait-for-finish'] !== undefined) query.waitForFinish = String(args['wait-for-finish'])

          let input = undefined
          if (args['input-file']) input = readJsonFile(args['input-file'])
          if (args.input) input = parseJsonFlag(args.input, 'input')

          result = await api('POST', `/acts/${encodeURIComponent(actorId)}/runs`, { body: input, query })
          break
        }
        default:
          result = { error: 'Unknown actors subcommand. Use: run' }
      }
      break

    case 'runs':
      switch (sub) {
        case 'get': {
          const runId = args.id
          if (!runId) { result = { error: '--id required (run ID)' }; break }
          result = await api('GET', `/actor-runs/${encodeURIComponent(runId)}`)
          break
        }
        case 'log': {
          const runId = args.id
          if (!runId) { result = { error: '--id required (run ID)' }; break }
          const query = {}
          if (args.offset !== undefined) query.offset = String(parseIntFlag(args.offset, 'offset'))
          if (args.limit !== undefined) query.limit = String(parseIntFlag(args.limit, 'limit'))
          if (args.stream !== undefined) query.stream = String(args.stream)
          result = await api('GET', `/actor-runs/${encodeURIComponent(runId)}/log`, { query })
          break
        }
        case 'dataset-items': {
          const runId = args.id
          if (!runId) { result = { error: '--id required (run ID)' }; break }
          const query = buildQueryFromFlags()
          result = await api('GET', `/actor-runs/${encodeURIComponent(runId)}/dataset/items`, { query })
          break
        }
        default:
          result = { error: 'Unknown runs subcommand. Use: get, log, dataset-items' }
      }
      break

    case 'datasets':
      switch (sub) {
        case 'items': {
          const datasetId = args.id
          if (!datasetId) { result = { error: '--id required (dataset ID or username~dataset-name)' }; break }
          const query = buildQueryFromFlags()
          result = await api('GET', `/datasets/${encodeURIComponent(datasetId)}/items`, { query })
          break
        }
        default:
          result = { error: 'Unknown datasets subcommand. Use: items' }
      }
      break

    case 'kv':
      switch (sub) {
        case 'stores': {
          const action = args.action || 'list'
          if (action !== 'list') { result = { error: 'Unknown kv stores action. Use: --action list' }; break }
          const query = {}
          if (args.limit !== undefined) query.limit = String(parseIntFlag(args.limit, 'limit'))
          if (args.offset !== undefined) query.offset = String(parseIntFlag(args.offset, 'offset'))
          if (args.desc !== undefined) query.desc = String(args.desc)
          result = await api('GET', '/key-value-stores', { query })
          break
        }
        case 'get': {
          const storeId = args['store-id']
          const key = args.key
          if (!storeId || !key) { result = { error: '--store-id and --key required' }; break }
          const query = {}
          if (args.disableRedirect !== undefined) query.disableRedirect = String(args.disableRedirect)
          // KVS record endpoint can return non-JSON. Keep Accept generic.
          result = await api('GET', `/key-value-stores/${encodeURIComponent(storeId)}/records/${encodeURIComponent(key)}`, {
            headers: { Accept: args.accept || 'application/json' },
            query,
          })
          break
        }
        case 'put': {
          const storeId = args['store-id']
          const key = args.key
          if (!storeId || !key) { result = { error: '--store-id and --key required' }; break }

          let contentType = args['content-type'] || 'application/json'
          let value = undefined

          if (args['value-file']) {
            value = fs.readFileSync(args['value-file'])
            if (!args['content-type']) contentType = 'application/octet-stream'
          } else if (args.value) {
            if (contentType === 'application/json') value = parseJsonFlag(args.value, 'value')
            else value = args.value
          } else {
            result = { error: '--value or --value-file required' }
            break
          }

          result = await api('PUT', `/key-value-stores/${encodeURIComponent(storeId)}/records/${encodeURIComponent(key)}`, {
            headers: { 'Content-Type': contentType, Accept: 'application/json' },
            body: value,
          })
          break
        }
        default:
          result = { error: 'Unknown kv subcommand. Use: stores, get, put' }
      }
      break

    default:
      result = {
        error: 'Unknown command',
        usage: {
          users: 'users me',
          actors: 'actors run --id <actorId|username~actor-name> [--input <json>|--input-file <path>] [--timeout <sec>] [--memory <mb>] [--build <tag>] [--wait-for-finish <sec>]',
          runs: {
            get: 'runs get --id <runId>',
            log: 'runs log --id <runId> [--offset <n>] [--limit <n>] [--stream true|false]',
            'dataset-items': 'runs dataset-items --id <runId> [--limit <n>] [--offset <n>] [--clean true|false] [--format json|csv] [--fields <csv>]',
          },
          datasets: 'datasets items --id <datasetId> [--limit <n>] [--offset <n>] [--clean true|false] [--format json|csv] [--fields <csv>]',
          kv: {
            stores: 'kv stores [--action list] [--limit <n>] [--offset <n>] [--desc 1]',
            get: 'kv get --store-id <id> --key <key> [--accept <mime>]',
            put: 'kv put --store-id <id> --key <key> --value <json_or_string> [--content-type application/json] | --value-file <path> [--content-type <mime>]',
          },
          options: '--dry-run',
        },
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }))
  process.exit(1)
})

