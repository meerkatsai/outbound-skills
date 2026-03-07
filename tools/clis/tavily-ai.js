#!/usr/bin/env node

const API_KEY = process.env.TAVILY_API_KEY
const BASE_URL = process.env.TAVILY_BASE_URL || 'https://api.tavily.com'
const IS_DRY_RUN = process.argv.includes('--dry-run')

if (!API_KEY && !IS_DRY_RUN) {
  console.error(JSON.stringify({ error: 'TAVILY_API_KEY environment variable required' }))
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
const [cmd] = args._

function parseJsonFlag(value, label) {
  if (!value) return undefined
  try {
    return JSON.parse(value)
  } catch (err) {
    throw new Error(`Invalid JSON for --${label}: ${err.message}`)
  }
}

async function api(method, path, body) {
  const url = `${BASE_URL}${path}`
  const headers = {
    Authorization: `Bearer ${API_KEY}`,
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

function buildBody() {
  const body = {}
  if (args.query) body.query = args.query
  if (args.url) body.url = args.url
  if (args.urls) body.urls = args.urls.split(',').map((v) => v.trim()).filter(Boolean)
  if (args.limit) body.limit = Number(args.limit)
  if (args['max-results']) body.max_results = Number(args['max-results'])
  if (args['max-depth']) body.max_depth = Number(args['max-depth'])
  if (args['search-depth']) body.search_depth = args['search-depth']
  if (args['include-answer']) body.include_answer = true
  if (args['include-raw-content']) body.include_raw_content = true
  if (args.topic) body.topic = args.topic
  return body
}

async function main() {
  let result

  switch (cmd) {
    case 'search': {
      const body = args.json ? parseJsonFlag(args.json, 'json') : buildBody()
      if (!body.query) { result = { error: '--query required' }; break }
      result = await api('POST', '/search', body)
      break
    }

    case 'extract': {
      const body = args.json ? parseJsonFlag(args.json, 'json') : buildBody()
      if (!body.urls && !body.url) { result = { error: '--urls or --url required' }; break }
      if (body.url && !body.urls) body.urls = [body.url]
      delete body.url
      result = await api('POST', '/extract', body)
      break
    }

    case 'crawl': {
      const body = args.json ? parseJsonFlag(args.json, 'json') : buildBody()
      if (!body.url) { result = { error: '--url required' }; break }
      result = await api('POST', '/crawl', body)
      break
    }

    case 'map': {
      const body = args.json ? parseJsonFlag(args.json, 'json') : buildBody()
      if (!body.url) { result = { error: '--url required' }; break }
      result = await api('POST', '/map', body)
      break
    }

    default:
      result = {
        error: 'Unknown command',
        usage: {
          search: 'search --query <text> [--search-depth basic|advanced] [--max-results <n>] [--include-answer] [--json <payload_json>]',
          extract: 'extract --urls <u1,u2> [--json <payload_json>]',
          crawl: 'crawl --url <url> [--max-depth <n>] [--limit <n>] [--json <payload_json>]',
          map: 'map --url <url> [--json <payload_json>]',
        },
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }))
  process.exit(1)
})
