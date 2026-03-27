#!/usr/bin/env node

const fs = require('fs')

const IS_DRY_RUN = process.argv.includes('--dry-run')

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

function readJsonFile(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'))
}

function parseJsonFlag(value, label) {
  if (value === undefined) return undefined
  try {
    return JSON.parse(value)
  } catch (err) {
    throw new Error(`Invalid JSON for --${label}: ${err.message}`)
  }
}

function requireFlag(value, label) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`--${label} required`)
  }
  return value
}

function loadPayloadFromFlags(defaultPayload) {
  if (args['payload-file']) return readJsonFile(args['payload-file'])
  if (args.payload) return parseJsonFlag(args.payload, 'payload')
  return defaultPayload
}

function normalizeEvent(value) {
  const input = String(value || '').trim().toLowerCase()
  if (!input) return 'invite_sent'
  if (input === 'invite' || input === 'invite-sent' || input === 'invite_sent') return 'invite_sent'
  if (input === 'message' || input === 'message-sent' || input === 'message_sent') return 'message_sent'
  if (input === 'response' || input === 'reply') return 'response'
  return input.replace(/[^a-z0-9_]/g, '_')
}

function parseHeaders(value) {
  const headers = {}
  if (!value) return headers
  const pairs = String(value).split(',').map((part) => part.trim()).filter(Boolean)
  for (const pair of pairs) {
    const idx = pair.indexOf(':')
    if (idx <= 0) throw new Error(`Invalid header format: ${pair}. Use --headers "Name:Value,Another:Value"`)
    const key = pair.slice(0, idx).trim()
    const val = pair.slice(idx + 1).trim()
    if (!key) throw new Error(`Invalid empty header key in: ${pair}`)
    headers[key] = val
  }
  return headers
}

function buildSamplePayload(event) {
  const now = new Date().toISOString()
  const base = {
    event,
    campaign: {
      id: 'cmp_123456',
      name: 'LinkedIn Outbound - Q2',
    },
    lead: {
      id: 'lead_987654',
      linkedin_url: 'https://www.linkedin.com/in/jane-doe/',
      first_name: 'Jane',
      last_name: 'Doe',
      company: 'Example Inc',
      title: 'Head of Growth',
    },
    created_at: now,
  }
  if (event === 'response') {
    base.response = {
      channel: 'linkedin',
      // Dripify docs note message content is not included in webhook data.
      content_available: false,
    }
  }
  return base
}

function setIfDefined(obj, key, value) {
  if (value !== undefined && value !== null && value !== '') obj[key] = value
}

function extractPayload(data) {
  const event = normalizeEvent(data.event || data.trigger || data.type || data.action || 'unknown')
  const campaignId = data?.campaign?.id || data?.campaign_id || data?.campaignId || null
  const leadId = data?.lead?.id || data?.lead_id || data?.leadId || null
  const createdAt = data.created_at || data.createdAt || data.timestamp || null
  return {
    event,
    campaign_id: campaignId,
    lead_id: leadId,
    created_at: createdAt,
    raw: data,
  }
}

async function postWebhook(url, payload, extraHeaders) {
  const headers = {
    'Content-Type': 'application/json',
    ...(extraHeaders || {}),
  }

  if (IS_DRY_RUN) {
    return {
      _dry_run: true,
      method: 'POST',
      url,
      headers,
      body: payload,
    }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  const text = await res.text()
  try {
    return {
      status: res.status,
      ok: res.ok,
      data: JSON.parse(text),
    }
  } catch {
    return {
      status: res.status,
      ok: res.ok,
      body: text,
    }
  }
}

const args = parseArgs(process.argv.slice(2))
const [cmd, sub] = args._

async function main() {
  let result

  switch (cmd) {
    case 'webhook':
      switch (sub) {
        case 'template': {
          const event = normalizeEvent(args.event)
          result = buildSamplePayload(event)
          break
        }

        case 'inspect': {
          const payload = loadPayloadFromFlags(undefined)
          if (!payload) {
            result = { error: 'Provide --payload or --payload-file' }
            break
          }
          result = extractPayload(payload)
          break
        }

        case 'send-test': {
          const url = requireFlag(args.url, 'url')
          const event = normalizeEvent(args.event)
          const payload = loadPayloadFromFlags(buildSamplePayload(event))
          const headers = parseHeaders(args.headers)
          result = await postWebhook(url, payload, headers)
          break
        }

        case 'forward': {
          const url = requireFlag(args.url, 'url')
          const event = normalizeEvent(args.event)
          const fallback = buildSamplePayload(event)
          setIfDefined(fallback, 'event', event)
          setIfDefined(fallback, 'campaign_id', args['campaign-id'])
          setIfDefined(fallback, 'lead_id', args['lead-id'])
          setIfDefined(fallback, 'created_at', args.timestamp)

          const payload = loadPayloadFromFlags(fallback)
          const headers = parseHeaders(args.headers)
          result = await postWebhook(url, payload, headers)
          break
        }

        default:
          result = {
            error: 'Unknown webhook subcommand. Use: template, inspect, send-test, forward',
          }
      }
      break

    default:
      result = {
        error: 'Unknown command',
        usage: {
          webhook: {
            template: 'webhook template [--event invite_sent|message_sent|response]',
            inspect: 'webhook inspect --payload <json> | --payload-file <path>',
            send_test: 'webhook send-test --url <https://...> [--event response] [--payload <json>|--payload-file <path>] [--headers "Authorization:Bearer x"]',
            forward: 'webhook forward --url <https://...> [--event invite_sent] [--campaign-id <id>] [--lead-id <id>] [--timestamp <iso>] [--payload <json>|--payload-file <path>] [--headers "X-Token:abc"]',
          },
        },
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }))
  process.exit(1)
})
