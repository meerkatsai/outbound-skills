#!/usr/bin/env node

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

function parseCsv(value, fallback = []) {
  if (!value) return fallback
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function buildLeadBodyTemplate(kind) {
  switch (kind) {
    case 'minimal':
      return {
        email: '{{email}}',
      }
    case 'signal':
      return {
        signal_name: '{{signal.name}}',
        signal_description: '{{signal.description}}',
        severity: '{{signal.severity}}',
        source: '{{postUrl}}',
        contact: {
          first_name: '{{firstName}}',
          last_name: '{{lastName}}',
          email: '{{email}}',
        },
      }
    case 'lead':
    default:
      return {
        name: '{{firstName}} {{lastName}}',
        first_name: '{{firstName}}',
        last_name: '{{lastName}}',
        email: '{{email}}',
        company: '{{companyName}}',
        title: '{{jobTitle}}',
        signal: '{{text}}',
        source: '{{postUrl}}',
        sentiment: '{{sentiment}}',
      }
  }
}

function buildHttpRequestTemplate() {
  const method = (args.method || 'POST').toUpperCase()
  const url = args.url || 'https://api.example.com/v1/leads'
  const authScheme = args['auth-scheme'] || 'bearer'
  const authHeader = args['auth-header'] || 'Authorization'
  const authValue = args['auth-value'] || (authScheme === 'bearer' ? 'Bearer YOUR_API_KEY' : 'YOUR_API_KEY')
  const bodyTemplate = buildLeadBodyTemplate(args['body-template'] || 'lead')
  const query = {}

  parseCsv(args.query).forEach((pair) => {
    const [key, value] = pair.split('=')
    if (key && value !== undefined) query[key] = value
  })

  const headers = {
    'Content-Type': 'application/json',
  }

  if (authScheme !== 'none') {
    headers[authHeader] = authValue
  }

  return {
    trigify_node: 'HTTP Request',
    configuration: {
      method,
      url,
      headers,
      query_parameters: query,
      body: method === 'GET' || method === 'DELETE' ? undefined : bodyTemplate,
    },
    notes: [
      'Paste this into the Trigify HTTP Request node and replace placeholder auth values.',
      'Use Trigify variables directly in headers, query params, or body fields where needed.',
      'Check workflow logs for statusCode, success, and result if the request fails.',
    ],
  }
}

function buildWebhookTemplate() {
  return {
    trigify_flow: 'Webhook Auto-Push',
    configuration: {
      endpoint_url: args.url || 'https://your-app.com/api/trigify/webhook',
      subscribed_events: parseCsv(args.events, ['new_lead']),
      recommended_security: {
        auth: args.auth || 'Embed auth in the destination URL or verify a shared secret at the receiver',
        transport: 'HTTPS only',
      },
    },
    checklist: [
      'Open Integrations or Update Connection inside Trigify.',
      'Choose Webhook.',
      'Add the endpoint URL.',
      'Select subscribed events.',
      'Create the endpoint and send a test event.',
      'Verify the receiver accepts the payload and handles duplicates safely.',
    ],
    warnings: [
      'Trigify auto-push webhook delivery sends leads as they are discovered.',
      'Apply filtering or qualification downstream if you do not want every lead.',
    ],
  }
}

function buildSignalTemplate() {
  return {
    trigify_node: 'Configure Signal',
    configuration: {
      name: args.name || 'High Intent Lead',
      description: args.description || 'Prospect posted about a pain point we solve.',
      severity: args.severity || 'high',
      category: args.category || 'SALES',
      emoji: args.emoji || '🔥',
    },
    valid_severities: ['low', 'medium', 'high', 'critical'],
    valid_categories: ['SALES', 'MARKETING', 'SUPPORT', 'PRODUCT', 'HR', 'FINANCE', 'GENERAL'],
    output_variable_example: '{{configureSignal.signalId}}',
  }
}

function buildSearchTemplate() {
  const type = args.type || 'social-listening'
  if (type === 'profile-monitoring') {
    return {
      trigify_node: 'Create Profile Monitoring Search',
      configuration: {
        platform: args.platform || 'LinkedIn',
        profile_url: args['profile-url'] || 'https://www.linkedin.com/in/example',
        purpose: args.purpose || 'Monitor target account activity for outreach timing',
      },
      supported_platforms: ['LinkedIn profiles', 'Twitter profiles'],
    }
  }
  return {
    trigify_node: 'Create Social Listening Search',
    configuration: {
      platforms: parseCsv(args.platforms, ['LinkedIn', 'Twitter', 'Reddit']),
      keywords: parseCsv(args.keywords, ['competitor alternative', 'looking for recommendation']),
      purpose: args.purpose || 'Track demand and buying-signal conversations',
    },
    supported_platforms: ['LinkedIn', 'Twitter', 'Reddit', 'YouTube', 'Podcasts'],
  }
}

function buildNativeList() {
  return {
    documented_native_integrations: [
      {
        name: 'HubSpot',
        actions: ['Create Contact', 'Update Contact', 'Get Contact', 'Create Company', 'Update Company', 'Get Company'],
      },
      {
        name: 'Smartlead',
        actions: ['Send to Smartlead Campaign'],
      },
      {
        name: 'Instantly',
        actions: ['Send to Instantly Campaign', 'Add to Instantly Automation'],
      },
      {
        name: 'HeyReach',
        actions: ['API-key based native connection documented'],
      },
      {
        name: 'Webhook',
        actions: ['Auto-push discovered leads to external endpoints'],
      },
      {
        name: 'HTTP Request',
        actions: ['Custom GET/POST/PUT/PATCH/DELETE requests to external APIs'],
      },
    ],
    note: 'This list only includes integrations and actions explicitly verified from current public Trigify docs in this session.',
  }
}

async function main() {
  let result

  switch (cmd) {
    case 'native':
      result = sub === 'list' ? buildNativeList() : { error: 'Unknown native subcommand. Use: list' }
      break
    case 'http-request':
      result = sub === 'template' ? buildHttpRequestTemplate() : { error: 'Unknown http-request subcommand. Use: template' }
      break
    case 'webhook':
      result = sub === 'template' ? buildWebhookTemplate() : { error: 'Unknown webhook subcommand. Use: template' }
      break
    case 'signal':
      result = sub === 'template' ? buildSignalTemplate() : { error: 'Unknown signal subcommand. Use: template' }
      break
    case 'search':
      result = sub === 'template' ? buildSearchTemplate() : { error: 'Unknown search subcommand. Use: template' }
      break
    default:
      result = {
        error: 'Unknown command',
        usage: {
          native: 'native list',
          'http-request': 'http-request template --url <endpoint> [--method POST] [--body-template lead|signal|minimal] [--auth-scheme bearer|api-key|none] [--auth-header Authorization] [--auth-value "Bearer TOKEN"] [--query page=1,limit=50]',
          webhook: 'webhook template --url <endpoint> [--events new_lead,updated_lead] [--auth <description>]',
          signal: 'signal template [--name <name>] [--description <text>] [--severity low|medium|high|critical] [--category SALES]',
          search: 'search template [--type social-listening|profile-monitoring] [--platforms LinkedIn,Twitter] [--keywords k1,k2] [--profile-url <url>]',
        },
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }))
  process.exit(1)
})
