#!/usr/bin/env node

const API_TOKEN = process.env.CHATMITRA_API_TOKEN || process.env.CHATMITRA_API_KEY
const BASE_URL =
  process.env.CHATMITRA_API_URL || 'https://backend.chatmitra.com/developer/api'

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

function assertToken() {
  if (!API_TOKEN && !args['dry-run']) {
    throw new Error('CHATMITRA_API_TOKEN (or CHATMITRA_API_KEY) environment variable required')
  }
}

async function apiSendMessage(payload) {
  assertToken()
  const url = `${BASE_URL.replace(/\/$/, '')}/send_message`
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_TOKEN}`,
  }

  if (args['dry-run']) {
    return {
      _dry_run: true,
      method: 'POST',
      url,
      headers: {
        ...headers,
        Authorization: 'Bearer ***',
      },
      payload,
    }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return { status: res.status, body: text }
  }
}

function getRequired(name) {
  const value = args[name]
  if (!value) throw new Error(`--${name} is required`)
  return value
}

async function main() {
  let result
  switch (cmd) {
    case 'send-text': {
      const to = getRequired('to')
      const message = getRequired('message')
      result = await apiSendMessage({
        recipient_mobile_number: to,
        message,
      })
      break
    }
    case 'send-image': {
      const to = getRequired('to')
      const link = getRequired('link')
      result = await apiSendMessage({
        recipient_mobile_number: to,
        messages: [
          {
            kind: 'raw',
            payload: {
              type: 'image',
              image: {
                link,
                caption: args.caption || undefined,
              },
            },
          },
        ],
      })
      break
    }
    case 'send-document': {
      const to = getRequired('to')
      const link = getRequired('link')
      result = await apiSendMessage({
        recipient_mobile_number: to,
        messages: [
          {
            kind: 'raw',
            payload: {
              type: 'document',
              document: {
                link,
                filename: args.filename || undefined,
              },
            },
          },
        ],
      })
      break
    }
    default:
      result = {
        error: 'Unknown command',
        usage: {
          'send-text': 'send-text --to <msisdn> --message "<text>" [--dry-run]',
          'send-image': 'send-image --to <msisdn> --link <https-url> [--caption "<text>"] [--dry-run]',
          'send-document':
            'send-document --to <msisdn> --link <https-url> [--filename "file.pdf"] [--dry-run]',
        },
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error(JSON.stringify({ error: err.message }))
  process.exit(1)
})
