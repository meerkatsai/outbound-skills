#!/usr/bin/env node

const fs = require('fs')

const API_TOKEN = process.env.MASTERINBOX_API_TOKEN
const BASE_URL = process.env.MASTERINBOX_BASE_URL || 'https://api.masterinbox.com'

if (!API_TOKEN && !process.argv.includes('--dry-run')) {
  console.error(JSON.stringify({error: 'MASTERINBOX_API_TOKEN environment variable required'}))
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

function boolLike(value) {
  if (value === undefined) return undefined
  if (typeof value === 'boolean') return value
  if (value === 'true' || value === '1') return true
  if (value === 'false' || value === '0') return false
  return value
}

function csv(value) {
  if (!value) return []
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function intLike(value, label) {
  if (value === undefined) return undefined
  const parsed = Number(value)
  if (!Number.isInteger(parsed)) throw new Error(`--${label} must be an integer`)
  return parsed
}

function maybeSet(obj, key, value) {
  if (value !== undefined && value !== null && value !== '') {
    obj[key] = value
  }
}

function bodyFromFlags(fallback) {
  if (args['body-file']) return readJsonFile(args['body-file'])
  if (args.body) return parseJsonFlag(args.body, 'body')
  return fallback
}

async function api(method, path, body) {
  const url = `${BASE_URL}${path}`
  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${API_TOKEN}`,
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (args['dry-run']) {
    return {
      _dry_run: true,
      method,
      url,
      headers: {...headers, Authorization: 'Bearer ***'},
      body,
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return {status: res.status, body: text}
  }
}

function requireFlag(value, label) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`--${label} required`)
  }
  return value
}

const args = parseArgs(process.argv.slice(2))
const [cmd, sub] = args._

async function main() {
  let result

  switch (cmd) {
    case 'messages':
      switch (sub) {
        case 'send':
          result = await api('POST', '/api/api-webhook/v1/api/send-message', bodyFromFlags({
            prospect_id: requireFlag(args['prospect-id'], 'prospect-id'),
            subject: requireFlag(args.subject, 'subject'),
            message: requireFlag(args.message, 'message'),
            to: requireFlag(args.to, 'to'),
            cc: args.cc || '',
            bcc: args.bcc || '',
          }))
          break
        case 'draft':
          result = await api('POST', '/api/api-webhook/v1/api/draft-message', bodyFromFlags({
            prospect_id: requireFlag(args['prospect-id'], 'prospect-id'),
            message: requireFlag(args.message, 'message'),
          }))
          break
        case 'list':
          result = await api('POST', '/api/api-webhook/v1/api/get-messages', bodyFromFlags({
            page: intLike(requireFlag(args.page, 'page'), 'page'),
            limit: intLike(requireFlag(args.limit, 'limit'), 'limit'),
            sort_by: requireFlag(args['sort-by'], 'sort-by'),
            prospect_id: requireFlag(args['prospect-id'], 'prospect-id'),
            search_keyword: requireFlag(args['search-keyword'], 'search-keyword'),
          }))
          break
        default:
          result = {error: 'Unknown messages subcommand. Use: send, draft, list'}
      }
      break

    case 'replies':
      switch (sub) {
        case 'list':
          result = await api('POST', '/api/api-webhook/v1/api/get-replies', bodyFromFlags({
            page: intLike(requireFlag(args.page, 'page'), 'page'),
            limit: intLike(requireFlag(args.limit, 'limit'), 'limit'),
            sort_by: requireFlag(args['sort-by'], 'sort-by'),
            prospect_id: requireFlag(args['prospect-id'], 'prospect-id'),
            search_keyword: requireFlag(args['search-keyword'], 'search-keyword'),
          }))
          break
        default:
          result = {error: 'Unknown replies subcommand. Use: list'}
      }
      break

    case 'inbox-types':
      switch (sub) {
        case 'list':
          result = await api('GET', '/api/api-webhook/v1/api/get-inbox-types')
          break
        default:
          result = {error: 'Unknown inbox-types subcommand. Use: list'}
      }
      break

    case 'labels':
      switch (sub) {
        case 'list':
          result = await api('GET', '/api/api-webhook/v1/api/get-labels')
          break
        case 'add':
          result = await api('POST', '/api/api-webhook/v1/api/add-label', bodyFromFlags({
            label_name: requireFlag(args['label-name'], 'label-name'),
            label_color: requireFlag(args['label-color'], 'label-color'),
          }))
          break
        case 'update':
          result = await api('PATCH', '/api/api-webhook/v1/api/update-label', bodyFromFlags({
            label_id: requireFlag(args['label-id'], 'label-id'),
            label_name: requireFlag(args['label-name'], 'label-name'),
            label_color: requireFlag(args['label-color'], 'label-color'),
          }))
          break
        default:
          result = {error: 'Unknown labels subcommand. Use: list, add, update'}
      }
      break

    case 'prospects':
      switch (sub) {
        case 'create':
          result = await api('POST', '/api/api-webhook/v1/api/create-new-prospect', bodyFromFlags({
            first_name: requireFlag(args['first-name'], 'first-name'),
            last_name: requireFlag(args['last-name'], 'last-name'),
            email: requireFlag(args.email, 'email'),
            custom_1: requireFlag(args['custom-1'], 'custom-1'),
            custom_2: requireFlag(args['custom-2'], 'custom-2'),
          }))
          break
        case 'update':
          result = await api('PATCH', '/api/api-webhook/v1/api/update-prospect', bodyFromFlags({
            prospect_id: requireFlag(args['prospect-id'], 'prospect-id'),
            first_name: requireFlag(args['first-name'], 'first-name'),
            last_name: requireFlag(args['last-name'], 'last-name'),
            email: requireFlag(args.email, 'email'),
            folder: requireFlag(args.folder, 'folder'),
            seen: boolLike(requireFlag(args.seen, 'seen')),
            is_replied: boolLike(requireFlag(args['is-replied'], 'is-replied')),
            is_sent: boolLike(requireFlag(args['is-sent'], 'is-sent')),
            custom_1: requireFlag(args['custom-1'], 'custom-1'),
            custom_2: requireFlag(args['custom-2'], 'custom-2'),
          }))
          break
        case 'by-email':
          result = await api('POST', '/api/api-webhook/v1/api/get-prospects-by-email', bodyFromFlags({
            email: requireFlag(args.email, 'email'),
          }))
          break
        case 'by-linkedin':
          result = await api('POST', '/api/api-webhook/v1/api/get-prospects-by-linkedin-url', bodyFromFlags({
            linkedin_url: requireFlag(args['linkedin-url'], 'linkedin-url'),
          }))
          break
        case 'labels':
          result = await api('GET', `/api/api-webhook/v1/api/get-prospect-labels/${encodeURIComponent(requireFlag(args['prospect-id'], 'prospect-id'))}`)
          break
        case 'add-label':
          result = await api('POST', '/api/api-webhook/v1/api/add-prospect-label', bodyFromFlags({
            prospect_id: requireFlag(args['prospect-id'], 'prospect-id'),
            email: requireFlag(args.email, 'email'),
            label_id: requireFlag(args['label-id'], 'label-id'),
          }))
          break
        case 'update-label':
          result = await api('PATCH', '/api/api-webhook/v1/api/update-prospect-label', bodyFromFlags({
            prospect_id: requireFlag(args['prospect-id'], 'prospect-id'),
            email: requireFlag(args.email, 'email'),
            label_id: requireFlag(args['label-id'], 'label-id'),
          }))
          break
        case 'move-to-list':
          result = await api('PATCH', '/api/api-webhook/v1/api/move-prospect-to-list', bodyFromFlags({
            prospect_ids: args['prospect-ids'] ? csv(args['prospect-ids']) : requireFlag(parseJsonFlag(args['prospect-ids-json'], 'prospect-ids-json'), 'prospect-ids-json'),
            inbox_type_id: requireFlag(args['inbox-type-id'], 'inbox-type-id'),
          }))
          break
        default:
          result = {error: 'Unknown prospects subcommand. Use: create, update, by-email, by-linkedin, labels, add-label, update-label, move-to-list'}
      }
      break

    case 'workspaces':
      switch (sub) {
        case 'list':
          result = await api('GET', '/api/api-webhook/v1/api/get-all-workspaces')
          break
        case 'create':
          result = await api('POST', '/api/api-webhook/v1/api/create-new-workspace', bodyFromFlags({
            name: requireFlag(args.name, 'name'),
            description: requireFlag(args.description, 'description'),
            timezone: requireFlag(args.timezone, 'timezone'),
          }))
          break
        case 'update':
          result = await api('PATCH', '/api/api-webhook/v1/api/update-workspace', bodyFromFlags({
            name: requireFlag(args.name, 'name'),
            description: requireFlag(args.description, 'description'),
            timezone: requireFlag(args.timezone, 'timezone'),
            isolated_views: boolLike(requireFlag(args['isolated-views'], 'isolated-views')),
            isolated_types: boolLike(requireFlag(args['isolated-types'], 'isolated-types')),
          }))
          break
        default:
          result = {error: 'Unknown workspaces subcommand. Use: list, create, update'}
      }
      break

    case 'members':
      switch (sub) {
        case 'invite':
          result = await api('POST', '/api/api-webhook/v1/api/send-member-invitation', bodyFromFlags({
            member_email: requireFlag(args['member-email'], 'member-email'),
            access_channels: boolLike(requireFlag(args['access-channels'], 'access-channels')),
            add_email: boolLike(requireFlag(args['add-email'], 'add-email')),
            add_linkedin: boolLike(requireFlag(args['add-linkedin'], 'add-linkedin')),
            add_member: boolLike(requireFlag(args['add-member'], 'add-member')),
            add_labels: boolLike(requireFlag(args['add-labels'], 'add-labels')),
            labels: boolLike(requireFlag(args.labels, 'labels')),
            add_views: boolLike(requireFlag(args['add-views'], 'add-views')),
            views: boolLike(requireFlag(args.views, 'views')),
            reply_message: boolLike(requireFlag(args['reply-message'], 'reply-message')),
            ai_labels: boolLike(requireFlag(args['ai-labels'], 'ai-labels')),
            sequences: boolLike(requireFlag(args.sequences, 'sequences')),
            webhooks: boolLike(requireFlag(args.webhooks, 'webhooks')),
            workflows: boolLike(requireFlag(args.workflows, 'workflows')),
            reply_agent: boolLike(requireFlag(args['reply-agent'], 'reply-agent')),
            apis: boolLike(requireFlag(args.apis, 'apis')),
            add_exclusions: boolLike(requireFlag(args['add-exclusions'], 'add-exclusions')),
            channels: boolLike(requireFlag(args.channels, 'channels')),
            integration: boolLike(requireFlag(args.integration, 'integration')),
            integrations: boolLike(requireFlag(args.integrations, 'integrations')),
          }))
          break
        case 'accept':
          result = await api('POST', '/api/api-webhook/v1/api/accept-member-invitation', bodyFromFlags({
            varification_code: requireFlag(args['varification-code'], 'varification-code'),
            full_name: args['full-name'],
            password: args.password,
          }))
          break
        case 'remove':
          result = await api('DELETE', `/api/api-webhook/v1/api/remove-member-from-workspace/${encodeURIComponent(requireFlag(args['user-id'], 'user-id'))}-user-id`)
          break
        default:
          result = {error: 'Unknown members subcommand. Use: invite, accept, remove'}
      }
      break

    case 'channels':
      switch (sub) {
        case 'list':
          result = await api('POST', '/api/api-webhook/v1/api/get-channels', bodyFromFlags({
            page: intLike(requireFlag(args.page, 'page'), 'page'),
            limit: intLike(requireFlag(args.limit, 'limit'), 'limit'),
            ids: args.ids || '',
            query: args.query || '',
            imap: boolLike(requireFlag(args.imap, 'imap')),
            smtp: boolLike(requireFlag(args.smtp, 'smtp')),
            provider_type: requireFlag(args['provider-type'], 'provider-type'),
          }))
          break
        case 'delete':
          result = await api('DELETE', '/api/api-webhook/v1/api/delete-channel', bodyFromFlags({
            channel_id: requireFlag(args['channel-id'], 'channel-id'),
          }))
          break
        default:
          result = {error: 'Unknown channels subcommand. Use: list, delete'}
      }
      break

    case 'providers':
      switch (sub) {
        case 'add-custom':
          result = await api('POST', '/api/api-webhook/v1/api/add-custom-provider', bodyFromFlags({
            email: requireFlag(args.email, 'email'),
            name: requireFlag(args.name, 'name'),
            smtp_host: requireFlag(args['smtp-host'], 'smtp-host'),
            smtp_port: intLike(requireFlag(args['smtp-port'], 'smtp-port'), 'smtp-port'),
            smtp_encryption: requireFlag(args['smtp-encryption'], 'smtp-encryption'),
            smtp_username: args['smtp-username'],
            smtp_password: requireFlag(args['smtp-password'], 'smtp-password'),
            imap_host: requireFlag(args['imap-host'], 'imap-host'),
            imap_port: intLike(requireFlag(args['imap-port'], 'imap-port'), 'imap-port'),
            imap_encryption: requireFlag(args['imap-encryption'], 'imap-encryption'),
            imap_username: args['imap-username'],
            imap_password: requireFlag(args['imap-password'], 'imap-password'),
          }))
          break
        default:
          result = {error: 'Unknown providers subcommand. Use: add-custom'}
      }
      break

    case 'exclusions':
      switch (sub) {
        case 'get':
          result = await api('GET', '/api/api-webhook/v1/api/get-exclusion-data')
          break
        case 'add-tags':
          result = await api('POST', '/api/api-webhook/v1/api/add-exclusion-tags', bodyFromFlags({
            exclusion_tags: args['exclusion-tags'] ? csv(args['exclusion-tags']) : requireFlag(parseJsonFlag(args['exclusion-tags-json'], 'exclusion-tags-json'), 'exclusion-tags-json'),
          }))
          break
        case 'update-keywords':
          result = await api('PATCH', '/api/api-webhook/v1/api/update-exclution-keywords', bodyFromFlags(
            args['body-file'] || args.body
              ? undefined
              : {
                  exclusion_keywords: args['exclusion-keywords'] ? csv(args['exclusion-keywords']) : [],
                }
          ))
          break
        default:
          result = {error: 'Unknown exclusions subcommand. Use: get, add-tags, update-keywords'}
      }
      break

    case 'password':
      switch (sub) {
        case 'reset':
          result = await api('POST', '/api/api-webhook/v1/api/reset-password', bodyFromFlags({
            member_email: requireFlag(args['member-email'], 'member-email'),
            password: requireFlag(args.password, 'password'),
          }))
          break
        default:
          result = {error: 'Unknown password subcommand. Use: reset'}
      }
      break

    case 'webhooks':
      switch (sub) {
        case 'incoming':
          result = await api('POST', `/api/api-webhook/v1/api/incoming-webhook/${encodeURIComponent(requireFlag(args['workflow-id'], 'workflow-id'))}/${encodeURIComponent(requireFlag(args['api-key'], 'api-key'))}`, bodyFromFlags({}))
          break
        default:
          result = {error: 'Unknown webhooks subcommand. Use: incoming'}
      }
      break

    default:
      result = {
        error: 'Unknown command',
        usage: {
          messages: 'messages send|draft|list ...',
          replies: 'replies list --page <n> --limit <n> --sort-by <field> --prospect-id <id> --search-keyword <term>',
          'inbox-types': 'inbox-types list',
          labels: 'labels list|add|update ...',
          prospects: 'prospects create|update|by-email|by-linkedin|labels|add-label|update-label|move-to-list ...',
          workspaces: 'workspaces list|create|update ...',
          members: 'members invite|accept|remove ...',
          channels: 'channels list|delete ...',
          providers: 'providers add-custom ...',
          exclusions: 'exclusions get|add-tags|update-keywords ...',
          password: 'password reset --member-email <email> --password <new-password>',
          webhooks: 'webhooks incoming --workflow-id <id> --api-key <key> [--body <json>]',
        },
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch((err) => {
  console.error(JSON.stringify({error: err.message}))
  process.exit(1)
})
