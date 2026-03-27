#!/usr/bin/env node

const fs = require('fs')

const API_KEY = process.env.UPLEAD_API_KEY
const BASE_URL = process.env.UPLEAD_BASE_URL || 'https://api.uplead.com/v2'

if (!API_KEY && !process.argv.includes('--dry-run')) {
  console.error(JSON.stringify({error: 'UPLEAD_API_KEY environment variable required'}))
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
    Authorization: API_KEY,
  }
  if (body) headers['Content-Type'] = 'application/json'

  if (args['dry-run']) {
    return {
      _dry_run: true,
      method,
      url,
      headers: {...headers, Authorization: '***'},
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
    case 'credits':
      result = await api('GET', '/credits')
      break

    case 'company':
      if (sub !== 'search') {
        result = {error: 'Unknown company subcommand. Use: search'}
        break
      }
      result = await api('POST', '/company-search', loadJsonInput(args, {domain: args.domain, company: args.name, id: args.id}))
      break

    case 'person':
      if (sub !== 'search') {
        result = {error: 'Unknown person subcommand. Use: search'}
        break
      }
      result = await api('POST', '/person-search', loadJsonInput(args, {
        email: args.email,
        first_name: args['first-name'],
        last_name: args['last-name'],
        domain: args.domain,
        id: args.id,
      }))
      break

    case 'combined':
      if (sub !== 'search') {
        result = {error: 'Unknown combined subcommand. Use: search'}
        break
      }
      if (!args.email && !args.body && !args['body-file']) {
        result = {error: '--email required unless using --body/--body-file'}
        break
      }
      result = await api('POST', '/combined-search', loadJsonInput(args, {email: args.email}))
      break

    case 'prospector':
      if (sub !== 'search') {
        result = {error: 'Unknown prospector subcommand. Use: search'}
        break
      }
      result = await api('POST', '/prospector-search', loadJsonInput(args))
      break

    case 'prospector-pro':
      if (sub !== 'search') {
        result = {error: 'Unknown prospector-pro subcommand. Use: search'}
        break
      }
      result = await api('POST', '/prospector-pro-search', loadJsonInput(args))
      break

    case 'industries':
      if (sub !== 'search') {
        result = {error: 'Unknown industries subcommand. Use: search'}
        break
      }
      result = await api('POST', '/industries', loadJsonInput(args, {text: args.text}))
      break

    case 'name-to-domain':
      if (sub !== 'search') {
        result = {error: 'Unknown name-to-domain subcommand. Use: search'}
        break
      }
      if (!args.company && !args.body && !args['body-file']) {
        result = {error: '--company required unless using --body/--body-file'}
        break
      }
      result = await api('POST', '/company-name-to-domain-search', loadJsonInput(args, {company: args.company}))
      break

    default:
      result = {
        error: 'Unknown command',
        usage: {
          credits: 'credits',
          company: 'company search --domain <domain> | --name <company> | --id <id>',
          person: 'person search --email <email> | --first-name <n> --last-name <n> --domain <domain>',
          combined: 'combined search --email <email>',
          prospector: 'prospector search --body-file <path>',
          'prospector-pro': 'prospector-pro search --body-file <path>',
          industries: 'industries search [--text <query>]',
          'name-to-domain': 'name-to-domain search --company <name>',
        },
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error(JSON.stringify({error: err.message}))
  process.exit(1)
})
