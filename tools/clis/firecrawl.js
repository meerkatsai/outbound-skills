#!/usr/bin/env node

const API_KEY = process.env.FIRECRAWL_API_KEY
const BASE_URL = process.env.FIRECRAWL_BASE_URL || 'https://api.firecrawl.dev/v2'
const IS_DRY_RUN = process.argv.includes('--dry-run')

if (!API_KEY && !IS_DRY_RUN) {
  console.error(JSON.stringify({ error: 'FIRECRAWL_API_KEY environment variable required' }))
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

function buildCommonPayload() {
  const payload = {}
  if (args.url) payload.url = args.url
  if (args.formats) payload.formats = args.formats.split(',').map((v) => v.trim()).filter(Boolean)
  if (args.limit) payload.limit = Number(args.limit)
  if (args['max-depth']) payload.maxDepth = Number(args['max-depth'])
  if (args['only-main-content']) payload.onlyMainContent = true
  if (args.wait) payload.waitFor = Number(args.wait)
  if (args.prompt) payload.prompt = args.prompt
  if (args.query) payload.query = args.query
  if (args.urls) payload.urls = args.urls.split(',').map((v) => v.trim()).filter(Boolean)
  if (args['include-tags']) payload.includeTags = args['include-tags'].split(',').map((v) => v.trim()).filter(Boolean)
  if (args['exclude-tags']) payload.excludeTags = args['exclude-tags'].split(',').map((v) => v.trim()).filter(Boolean)

  const scrapeOptions = parseJsonFlag(args['scrape-options'], 'scrape-options')
  if (scrapeOptions) payload.scrapeOptions = scrapeOptions

  return payload
}

async function main() {
  let result

  switch (cmd) {
    case 'scrape': {
      const body = args.json ? parseJsonFlag(args.json, 'json') : buildCommonPayload()
      if (!body.url) { result = { error: '--url required' }; break }
      result = await api('POST', '/scrape', body)
      break
    }

    case 'crawl': {
      if (sub === 'status') {
        const id = args.id
        if (!id) { result = { error: '--id required' }; break }
        result = await api('GET', `/crawl/${encodeURIComponent(id)}`)
        break
      }
      const body = args.json ? parseJsonFlag(args.json, 'json') : buildCommonPayload()
      if (!body.url) { result = { error: '--url required' }; break }
      result = await api('POST', '/crawl', body)
      break
    }

    case 'map': {
      const body = args.json ? parseJsonFlag(args.json, 'json') : buildCommonPayload()
      if (!body.url) { result = { error: '--url required' }; break }
      result = await api('POST', '/map', body)
      break
    }

    case 'search': {
      const body = args.json ? parseJsonFlag(args.json, 'json') : buildCommonPayload()
      if (!body.query) { result = { error: '--query required' }; break }
      result = await api('POST', '/search', body)
      break
    }

    case 'extract': {
      if (sub === 'status') {
        const id = args.id
        if (!id) { result = { error: '--id required' }; break }
        result = await api('GET', `/extract/${encodeURIComponent(id)}`)
        break
      }
      const body = args.json ? parseJsonFlag(args.json, 'json') : buildCommonPayload()
      if (!body.urls && !body.url) { result = { error: '--urls or --url required' }; break }
      if (body.url && !body.urls) body.urls = [body.url]
      delete body.url
      result = await api('POST', '/extract', body)
      break
    }

    default:
      result = {
        error: 'Unknown command',
        usage: {
          scrape: 'scrape --url <url> [--formats markdown,html] [--only-main-content] [--json <payload_json>]',
          crawl: 'crawl --url <url> [--limit <n>] [--max-depth <n>] [--json <payload_json>] | crawl status --id <job_id>',
          map: 'map --url <url> [--limit <n>] [--json <payload_json>]',
          search: 'search --query <text> [--limit <n>] [--json <payload_json>]',
          extract: 'extract --urls <u1,u2> [--prompt <text>] [--json <payload_json>] | extract status --id <job_id>',
        },
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }))
  process.exit(1)
})
