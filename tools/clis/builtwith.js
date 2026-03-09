#!/usr/bin/env node

const API_KEY = process.env.BUILTWITH_API_KEY
const BASE_URL = process.env.BUILTWITH_BASE_URL || 'https://api.builtwith.com'
const IS_DRY_RUN = process.argv.includes('--dry-run')

if (!API_KEY && !IS_DRY_RUN) {
  console.error(JSON.stringify({ error: 'BUILTWITH_API_KEY environment variable required' }))
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

function buildUrl(path, query) {
  const qs = new URLSearchParams(query).toString()
  return `${BASE_URL}${path}?${qs}`
}

async function api(url) {
  if (args['dry-run']) {
    return {
      _dry_run: true,
      method: 'GET',
      url: url.replace(API_KEY || '', '***'),
      headers: {},
    }
  }

  const res = await fetch(url)
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return { status: res.status, body: text }
  }
}

async function main() {
  let result

  switch (cmd) {
    case 'free': {
      const lookup = args.lookup || args.domain
      if (!lookup) { result = { error: '--lookup or --domain required' }; break }
      const url = buildUrl('/free1/api.json', {
        KEY: API_KEY,
        LOOKUP: lookup,
      })
      result = await api(url)
      break
    }

    case 'domain': {
      const lookup = args.lookup || args.domain
      if (!lookup) { result = { error: '--lookup or --domain required' }; break }
      const query = {
        KEY: API_KEY,
        LOOKUP: lookup,
      }
      if (args['hide-text']) query.HIDETEXT = 'yes'
      if (args['no-meta']) query.NOMETA = 'yes'
      if (args['no-pii']) query.NOPII = 'yes'
      if (args['no-attr']) query.NOATTR = 'yes'
      const url = buildUrl('/v22/api.json', query)
      result = await api(url)
      break
    }

    case 'relationships': {
      const lookup = args.lookup || args.domain
      if (!lookup) { result = { error: '--lookup or --domain required' }; break }
      const url = buildUrl('/rv4/api.json', {
        KEY: API_KEY,
        LOOKUP: lookup,
      })
      result = await api(url)
      break
    }

    case 'lists': {
      const tech = args.tech
      if (!tech) { result = { error: '--tech required' }; break }
      const url = buildUrl('/lists12/api.json', {
        KEY: API_KEY,
        TECH: tech,
      })
      result = await api(url)
      break
    }

    case 'company': {
      const company = args.company
      if (!company) { result = { error: '--company required' }; break }
      const url = buildUrl('/ctu3/api.json', {
        KEY: API_KEY,
        COMPANY: company,
      })
      result = await api(url)
      break
    }

    default:
      result = {
        error: 'Unknown command',
        usage: {
          free: 'free --lookup <domain>',
          domain: 'domain --lookup <domain_or_csv_domains> [--hide-text] [--no-meta] [--no-pii] [--no-attr]',
          relationships: 'relationships --lookup <domain>',
          lists: 'lists --tech <technology_name>',
          company: 'company --company <company_name>',
        },
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }))
  process.exit(1)
})
