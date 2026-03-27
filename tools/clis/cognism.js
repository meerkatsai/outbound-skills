#!/usr/bin/env node

const fs = require('fs')

const API_KEY = process.env.COGNISM_API_KEY
const BASE_URL = process.env.COGNISM_BASE_URL || 'https://app.cognism.com'

if (!API_KEY && !process.argv.includes('--dry-run')) {
  console.error(JSON.stringify({error: 'COGNISM_API_KEY environment variable required'}))
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

function parseCsv(value) {
  if (!value) return undefined
  return value.split(',').map((item) => item.trim()).filter(Boolean)
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
    Authorization: `Bearer ${API_KEY}`,
  }
  if (body) headers['Content-Type'] = 'application/json'

  if (args['dry-run']) {
    return {
      _dry_run: true,
      method,
      url,
      headers: {...headers, Authorization: 'Bearer ***'},
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
    case 'contact':
      switch (sub) {
        case 'search': {
          const query = {}
          if (args['last-returned-key']) query.lastReturnedKey = args['last-returned-key']
          if (args['index-size']) query.indexSize = args['index-size']
          const body = loadJsonInput(args, {})
          if (!args.body && !args['body-file']) {
            if (args['first-name']) body.firstName = args['first-name']
            if (args['last-name']) body.lastName = args['last-name']
            if (args['job-title']) body.jobTitles = parseCsv(args['job-title'])
            if (args['exclude-job-title']) body.excludeJobTitles = parseCsv(args['exclude-job-title'])
            if (args.region) body.regions = parseCsv(args.region)
            if (args['account-name']) body.account = {names: parseCsv(args['account-name'])}
          }
          if (Object.keys(body).length === 0) {
            result = {error: 'Provide search fields or pass --body/--body-file'}
            break
          }
          result = await api('POST', '/api/search/contact/search', body, query)
          break
        }
        case 'enrich': {
          const body = loadJsonInput(args, {})
          if (!args.body && !args['body-file']) {
            if (args.email) body.email = args.email
            if (args['linkedin-url']) body.linkedinUrl = args['linkedin-url']
            if (args['first-name']) body.firstName = args['first-name']
            if (args['last-name']) body.lastName = args['last-name']
            if (args['job-title']) body.jobTitle = args['job-title']
            if (args['account-name']) body.accountName = args['account-name']
            if (args['account-website']) body.accountWebsite = args['account-website']
            if (args['min-match-score']) body.minMatchScore = Number(args['min-match-score'])
          }
          if (Object.keys(body).length === 0) {
            result = {error: 'Provide enrich fields or pass --body/--body-file'}
            break
          }
          result = await api('POST', '/api/search/contact/enrich', body)
          break
        }
        case 'redeem': {
          const body = loadJsonInput(args, {})
          if (!body.redeemIds) body.redeemIds = parseCsv(args['redeem-ids'])
          if (!body.redeemIds || body.redeemIds.length === 0) {
            result = {error: 'Provide --redeem-ids or pass --body/--body-file'}
            break
          }
          result = await api('POST', '/api/search/contact/redeem', body)
          break
        }
        default:
          result = {error: 'Unknown contact subcommand. Use: search, enrich, redeem'}
      }
      break

    default:
      result = {
        error: 'Unknown command',
        usage: {
          contact: {
            search: 'contact search [--first-name <n>] [--last-name <n>] [--job-title <t1,t2>] [--region <r1,r2>] [--account-name <a1,a2>] [--index-size <20-100>] [--last-returned-key <key>] | --body-file <path>',
            enrich: 'contact enrich --email <email> | --linkedin-url <url> | --first-name <n> --last-name <n> [--account-website <domain>] | --body-file <path>',
            redeem: 'contact redeem --redeem-ids <id1,id2> | --body-file <path>',
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
