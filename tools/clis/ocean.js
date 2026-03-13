#!/usr/bin/env node

const fs = require('fs')

const API_TOKEN = process.env.OCEAN_API_TOKEN
const BASE_URL = 'https://api.ocean.io'

if (!API_TOKEN) {
  console.error(JSON.stringify({error: 'OCEAN_API_TOKEN environment variable required'}))
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

function parseInteger(value, key) {
  if (value === undefined) return undefined
  const parsed = Number(value)
  if (!Number.isInteger(parsed)) {
    throw new Error(`${key} must be an integer`)
  }
  return parsed
}

function loadJsonInput(options, fallback) {
  if (options['body-file']) {
    return JSON.parse(fs.readFileSync(options['body-file'], 'utf8'))
  }
  if (options.body) {
    return JSON.parse(options.body)
  }
  return fallback
}

async function api(method, path, body) {
  const headers = {
    'X-Api-Token': API_TOKEN,
    'Accept': 'application/json',
  }
  if (body) headers['Content-Type'] = 'application/json'

  if (args['dry-run']) {
    return {
      _dry_run: true,
      method,
      url: `${BASE_URL}${path}`,
      headers: {...headers, 'X-Api-Token': '***'},
      body: body || undefined,
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
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
    case 'data-fields':
      result = sub === 'list' ? await api('GET', '/v2/data-fields') : {error: 'Unknown data-fields subcommand. Use: list'}
      break

    case 'warmup':
      switch (sub) {
        case 'companies': {
          const domains = parseCsv(args.domains)
          if (!domains || domains.length === 0) {
            result = {error: '--domains required (comma-separated)'}
            break
          }
          result = await api('POST', '/v2/warmup/companies', {domains})
          break
        }
        default:
          result = {error: 'Unknown warmup subcommand. Use: companies'}
      }
      break

    case 'autocomplete':
      switch (sub) {
        case 'companies': {
          if (!args.name) {
            result = {error: '--name required'}
            break
          }
          const body = {name: args.name}
          const countries = parseCsv(args.countries)
          const excludeDomains = parseCsv(args['exclude-domains'])
          if (countries) body.countryFilters = countries
          if (excludeDomains) body.excludeDomains = excludeDomains
          result = await api('POST', '/v2/autocomplete/companies', body)
          break
        }
        default:
          result = {error: 'Unknown autocomplete subcommand. Use: companies'}
      }
      break

    case 'enrich':
      switch (sub) {
        case 'company': {
          const body = loadJsonInput(args, {})
          if (!body.company) {
            const company = {}
            if (args.domain) company.domain = args.domain
            if (args.name) company.name = args.name
            if (args.country) company.countryCode = args.country
            if (Object.keys(company).length > 0) body.company = company
            const fields = parseCsv(args.fields)
            if (fields) body.fields = fields
          }
          if (!body.company) {
            result = {error: 'Provide --domain/--name or pass --body/--body-file with a company object'}
            break
          }
          result = await api('POST', '/v2/enrich/company', body)
          break
        }
        case 'person': {
          const body = loadJsonInput(args, {})
          if (!body.person) {
            const person = {}
            if (args['linkedin-handle']) person.linkedinHandle = args['linkedin-handle']
            if (args.email) person.email = args.email
            if (args['first-name']) person.firstName = args['first-name']
            if (args['last-name']) person.lastName = args['last-name']
            if (args['job-title']) person.jobTitle = args['job-title']
            if (Object.keys(person).length > 0) body.person = person
            if (args['company-domain']) body.company = {domain: args['company-domain']}
            if (args['reveal-emails']) body.revealEmails = {includeEmails: true, webhookUrl: args['webhook-url']}
            if (args['reveal-phones']) body.revealPhones = {includePhones: true, webhookUrl: args['webhook-url']}
          }
          if (!body.person) {
            result = {error: 'Provide person fields or pass --body/--body-file with a person object'}
            break
          }
          result = await api('POST', '/v2/enrich/person', body)
          break
        }
        case 'people': {
          const body = loadJsonInput(args)
          if (!body || !body.peopleDataMapping || !body.webhookUrl) {
            result = {error: 'Use --body/--body-file with peopleDataMapping and webhookUrl'}
            break
          }
          result = await api('POST', '/v2/enrich/people', body)
          break
        }
        default:
          result = {error: 'Unknown enrich subcommand. Use: company, person, people'}
      }
      break

    case 'lookup':
      switch (sub) {
        case 'people': {
          const body = loadJsonInput(args, {})
          if (!body.linkedinHandles) body.linkedinHandles = parseCsv(args['linkedin-handles'])
          if (!body.oceanIds) body.oceanIds = parseCsv(args['ocean-ids'])
          if ((!body.linkedinHandles || body.linkedinHandles.length === 0) && (!body.oceanIds || body.oceanIds.length === 0)) {
            result = {error: 'Provide --linkedin-handles and/or --ocean-ids, or pass --body/--body-file'}
            break
          }
          result = await api('POST', '/v2/lookup/people', body)
          break
        }
        default:
          result = {error: 'Unknown lookup subcommand. Use: people'}
      }
      break

    case 'search':
      switch (sub) {
        case 'companies': {
          const body = loadJsonInput(args, {})
          if (body.size === undefined && args.size !== undefined) body.size = parseInteger(args.size, '--size')
          if (!body.searchAfter && args['search-after']) body.searchAfter = args['search-after']
          if (!body.fields && args.fields) body.fields = parseCsv(args.fields)
          if (!body.companiesFilters && !body.peopleFilters) {
            result = {error: 'Use --body/--body-file with companiesFilters and/or peopleFilters'}
            break
          }
          result = await api('POST', '/v3/search/companies', body)
          break
        }
        case 'people': {
          const body = loadJsonInput(args, {})
          if (body.size === undefined && args.size !== undefined) body.size = parseInteger(args.size, '--size')
          if (body.peoplePerCompany === undefined && args['people-per-company'] !== undefined) {
            body.peoplePerCompany = parseInteger(args['people-per-company'], '--people-per-company')
          }
          if (!body.searchAfter && args['search-after']) body.searchAfter = args['search-after']
          if (!body.peopleFilters && !body.companiesFilters) {
            result = {error: 'Use --body/--body-file with peopleFilters and/or companiesFilters'}
            break
          }
          result = await api('POST', '/v3/search/people', body)
          break
        }
        default:
          result = {error: 'Unknown search subcommand. Use: companies, people'}
      }
      break

    default:
      result = {
        error: 'Unknown command',
        usage: {
          'data-fields': 'data-fields list',
          warmup: 'warmup companies --domains ocean.io,example.com',
          autocomplete: 'autocomplete companies --name ocea [--countries dk,se] [--exclude-domains ocean.io]',
          enrich: [
            'enrich company --domain ocean.io [--fields domain,name,employeeCountOcean]',
            'enrich person --linkedin-handle john-doe [--company-domain ocean.io] [--reveal-emails] [--webhook-url https://example.com/webhook]',
            'enrich people --body-file batch.json',
          ],
          lookup: 'lookup people --linkedin-handles john-doe,jane-smith [--ocean-ids id1,id2]',
          search: [
            'search companies --body-file company-search.json',
            'search people --body-file people-search.json',
          ],
          options: '--body <json> --body-file <path> --dry-run',
        },
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error(JSON.stringify({error: err.message}))
  process.exit(1)
})
