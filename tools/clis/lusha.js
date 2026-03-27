#!/usr/bin/env node

const fs = require('fs')

const API_KEY = process.env.LUSHA_API_KEY
const BASE_URL = process.env.LUSHA_BASE_URL || 'https://api.lusha.com'

if (!API_KEY && !process.argv.includes('--dry-run')) {
  console.error(JSON.stringify({error: 'LUSHA_API_KEY environment variable required'}))
  process.exit(1)
}

function parseArgs(argv) {
  const result = {_: []}
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

function loadJsonInput(args, fallback) {
  if (args['body-file']) return JSON.parse(fs.readFileSync(args['body-file'], 'utf8'))
  if (args.body) return JSON.parse(args.body)
  return fallback
}

async function api(method, path, body, query) {
  const qs = query ? new URLSearchParams(query).toString() : ''
  const url = `${BASE_URL}${path}${qs ? '?' + qs : ''}`
  const headers = {
    Accept: 'application/json',
    api_key: API_KEY,
  }
  if (body) headers['Content-Type'] = 'application/json'

  if (args['dry-run']) {
    return {
      _dry_run: true,
      method,
      url,
      headers: {...headers, api_key: '***'},
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
    return {status: res.status, body: text}
  }
}

const args = parseArgs(process.argv.slice(2))
const [cmd, sub] = args._

async function main() {
  let result

  switch (cmd) {
    case 'person':
      switch (sub) {
        case 'get': {
          const query = {}
          if (args.email) query.email = args.email
          if (args['linkedin-url']) query.linkedinUrl = args['linkedin-url']
          if (args['first-name']) query.firstName = args['first-name']
          if (args['last-name']) query.lastName = args['last-name']
          if (args['company-name']) query.companyName = args['company-name']
          if (args['company-domain']) query.companyDomain = args['company-domain']
          if (Object.keys(query).length === 0) {
            result = {error: 'Provide lookup fields such as --email, --linkedin-url, or name + company'}
            break
          }
          result = await api('GET', '/v2/person', undefined, query)
          break
        }
        case 'search': {
          const body = loadJsonInput(args)
          if (!body) {
            result = {error: 'Use --body or --body-file with a Lusha person search payload'}
            break
          }
          result = await api('POST', '/v2/person', body)
          break
        }
        default:
          result = {error: 'Unknown person subcommand. Use: get, search'}
      }
      break

    case 'company':
      switch (sub) {
        case 'get': {
          const query = {}
          if (args.domain) query.domain = args.domain
          if (args.name) query.companyName = args.name
          if (Object.keys(query).length === 0) {
            result = {error: 'Provide --domain or --name'}
            break
          }
          result = await api('GET', '/v2/company', undefined, query)
          break
        }
        case 'search': {
          const body = loadJsonInput(args)
          if (!body) {
            result = {error: 'Use --body or --body-file with a Lusha company search payload'}
            break
          }
          result = await api('POST', '/v2/company', body)
          break
        }
        default:
          result = {error: 'Unknown company subcommand. Use: get, search'}
      }
      break

    case 'account':
      switch (sub) {
        case 'usage':
          result = await api('GET', '/account/usage')
          break
        default:
          result = {error: 'Unknown account subcommand. Use: usage'}
      }
      break

    default:
      result = {
        error: 'Unknown command',
        usage: {
          person: {
            get: 'person get --email <email> | --linkedin-url <url> | --first-name <n> --last-name <n> [--company-name <c>|--company-domain <d>]',
            search: 'person search --body <json> | --body-file <path>',
          },
          company: {
            get: 'company get --domain <domain> | --name <company>',
            search: 'company search --body <json> | --body-file <path>',
          },
          account: {
            usage: 'account usage',
          },
        },
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error(JSON.stringify({error: err.message}))
  process.exit(1)
})
