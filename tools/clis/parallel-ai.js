#!/usr/bin/env node

const API_KEY = process.env.PARALLEL_API_KEY
const BASE_URL = process.env.PARALLEL_BASE_URL || 'https://api.parallel.ai'
const IS_DRY_RUN = process.argv.includes('--dry-run')

if (!API_KEY && !IS_DRY_RUN) {
  console.error(JSON.stringify({ error: 'PARALLEL_API_KEY environment variable required' }))
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

const args = parseArgs(process.argv.slice(2))
const [cmd, sub] = args._

function parseJsonFlag(value, label) {
  if (!value) return undefined
  try {
    return JSON.parse(value)
  } catch (err) {
    throw new Error(`Invalid JSON for --${label}: ${err.message}`)
  }
}

async function api(method, path, body, extraHeaders = {}) {
  const url = `${BASE_URL}${path}`
  const headers = {
    'x-api-key': API_KEY,
    'Content-Type': 'application/json',
    ...extraHeaders,
  }

  if (args['dry-run']) {
    return {
      _dry_run: true,
      method,
      url,
      headers: { ...headers, 'x-api-key': '***' },
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

function buildBody() {
  const body = {}
  if (args.objective) body.objective = args.objective
  if (args.query) body.query = args.query
  if (args.url) body.url = args.url
  if (args.input) body.input = args.input
  if (args.processor) body.processor = args.processor
  if (args['max-results']) body.max_results = Number(args['max-results'])
  return body
}

async function main() {
  let result

  switch (cmd) {
    case 'search': {
      const body = args.json ? parseJsonFlag(args.json, 'json') : buildBody()
      if (!body.objective && !body.query) { result = { error: '--objective or --query required' }; break }
      if (body.query && !body.objective) body.objective = body.query
      delete body.query
      result = await api('POST', '/v1beta/search', body)
      break
    }

    case 'extract': {
      const body = args.json ? parseJsonFlag(args.json, 'json') : buildBody()
      if (!body.url) { result = { error: '--url required' }; break }
      result = await api('POST', '/v1beta/extract', body)
      break
    }

    case 'tasks':
      switch (sub) {
        case 'run': {
          const body = args.json ? parseJsonFlag(args.json, 'json') : buildBody()
          if (!body.input) { result = { error: '--input required' }; break }
          const betaHeaders = args['beta-features'] ? { 'x-parallel-beta-features': args['beta-features'] } : {}
          result = await api('POST', '/v1/tasks/runs', body, betaHeaders)
          break
        }
        case 'get': {
          const id = args.id
          if (!id) { result = { error: '--id required' }; break }
          result = await api('GET', `/v1/tasks/runs/${encodeURIComponent(id)}`)
          break
        }
        default:
          result = { error: 'Unknown tasks subcommand. Use: run, get' }
      }
      break

    default:
      result = {
        error: 'Unknown command',
        usage: {
          search: 'search --objective <text> [--processor <name>] [--max-results <n>] [--json <payload_json>]',
          extract: 'extract --url <url> [--objective <text>] [--json <payload_json>]',
          tasks: 'tasks run --input <text> [--processor <name>] [--beta-features <val>] [--json <payload_json>] | tasks get --id <run_id>',
        },
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }))
  process.exit(1)
})
