#!/usr/bin/env node

const API_TOKEN = process.env.TIMELINESAI_API_TOKEN
const BASE_URL = process.env.TIMELINESAI_BASE_URL || 'https://app.timelines.ai/integrations/api'

if (!API_TOKEN && !process.argv.includes('--dry-run')) {
  console.error(JSON.stringify({error: 'TIMELINESAI_API_TOKEN environment variable required'}))
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

async function api(method, path, query) {
  const qs = query ? new URLSearchParams(query).toString() : ''
  const url = `${BASE_URL}${path}${qs ? '?' + qs : ''}`
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${API_TOKEN}`,
  }

  if (args['dry-run']) {
    return {
      _dry_run: true,
      method,
      url,
      headers: {...headers, Authorization: 'Bearer ***'},
    }
  }

  const res = await fetch(url, {method, headers})
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return {status: res.status, body: text}
  }
}

function maybeSet(query, key, value) {
  if (value !== undefined && value !== null && value !== '') query[key] = String(value)
}

const args = parseArgs(process.argv.slice(2))
const [cmd, sub] = args._

async function main() {
  let result

  switch (cmd) {
    case 'chats':
      switch (sub) {
        case 'list': {
          const query = {}
          maybeSet(query, 'label', args.label)
          maybeSet(query, 'whatsapp_account_id', args['whatsapp-account-id'])
          maybeSet(query, 'group', args.group)
          maybeSet(query, 'responsible', args.responsible)
          maybeSet(query, 'name', args.name)
          maybeSet(query, 'phone', args.phone)
          maybeSet(query, 'read', args.read)
          maybeSet(query, 'closed', args.closed)
          maybeSet(query, 'chatgpt_autoresponse_enabled', args['chatgpt-autoresponse-enabled'])
          maybeSet(query, 'page', args.page)
          maybeSet(query, 'created_after', args['created-after'])
          maybeSet(query, 'created_before', args['created-before'])
          result = await api('GET', '/chats', query)
          break
        }
        default:
          result = {error: 'Unknown chats subcommand. Use: list'}
      }
      break

    case 'messages':
      switch (sub) {
        case 'list': {
          const chatId = args['chat-id']
          if (!chatId) {
            result = {error: '--chat-id required'}
            break
          }
          const query = {}
          maybeSet(query, 'from_me', args['from-me'])
          maybeSet(query, 'after', args.after)
          maybeSet(query, 'before', args.before)
          maybeSet(query, 'after_message', args['after-message'])
          maybeSet(query, 'before_message', args['before-message'])
          maybeSet(query, 'sorting_order', args['sorting-order'])
          result = await api('GET', `/chats/${chatId}/messages`, query)
          break
        }
        default:
          result = {error: 'Unknown messages subcommand. Use: list'}
      }
      break

    case 'whatsapp-accounts':
      switch (sub) {
        case 'list':
          result = await api('GET', '/whatsapp_accounts')
          break
        default:
          result = {error: 'Unknown whatsapp-accounts subcommand. Use: list'}
      }
      break

    case 'webhooks':
      switch (sub) {
        case 'list':
          result = await api('GET', '/webhooks')
          break
        default:
          result = {error: 'Unknown webhooks subcommand. Use: list'}
      }
      break

    case 'quotas':
      switch (sub) {
        case 'get':
          result = await api('GET', '/quotas')
          break
        default:
          result = {error: 'Unknown quotas subcommand. Use: get'}
      }
      break

    default:
      result = {
        error: 'Unknown command',
        usage: {
          chats: 'chats list [--label <csv>] [--whatsapp-account-id <wid>] [--group true|false] [--responsible <csv>] [--name <csv>] [--phone <phone>] [--read true|false] [--closed true|false] [--page <n>]',
          messages: 'messages list --chat-id <id> [--from-me true|false] [--after <iso>] [--before <iso>] [--after-message <uid>] [--before-message <uid>] [--sorting-order asc|desc]',
          'whatsapp-accounts': 'whatsapp-accounts list',
          webhooks: 'webhooks list',
          quotas: 'quotas get',
        },
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error(JSON.stringify({error: err.message}))
  process.exit(1)
})
