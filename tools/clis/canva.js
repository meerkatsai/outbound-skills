#!/usr/bin/env node

const crypto = require('crypto')

const ACCESS_TOKEN = process.env.CANVA_ACCESS_TOKEN
const CLIENT_ID = process.env.CANVA_CLIENT_ID
const CLIENT_SECRET = process.env.CANVA_CLIENT_SECRET
const BASE_URL = 'https://api.canva.com/rest/v1'
const AUTHORIZE_URL = 'https://www.canva.com/api/oauth/authorize'

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

function parseCsv(value) {
  if (!value) return undefined
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function parseInteger(value, name) {
  if (value === undefined) return undefined
  const parsed = Number(value)
  if (!Number.isInteger(parsed)) {
    throw new Error(`${name} must be an integer`)
  }
  return parsed
}

function requireAccessToken() {
  if (!ACCESS_TOKEN) {
    throw new Error('CANVA_ACCESS_TOKEN environment variable required')
  }
}

function requireClientCredentials() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('CANVA_CLIENT_ID and CANVA_CLIENT_SECRET environment variables required')
  }
}

function buildQuery(params) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

async function api(method, path, body, options = {}) {
  const needsAuth = options.auth !== false
  const useForm = options.form === true

  if (needsAuth) requireAccessToken()

  const headers = { Accept: 'application/json' }
  if (needsAuth) headers.Authorization = `Bearer ${ACCESS_TOKEN}`
  if (body && !useForm) headers['Content-Type'] = 'application/json'
  if (body && useForm) headers['Content-Type'] = 'application/x-www-form-urlencoded'

  let requestBody
  if (body && useForm) requestBody = new URLSearchParams(body).toString()
  if (body && !useForm) requestBody = JSON.stringify(body)

  if (args['dry-run']) {
    const maskedHeaders = { ...headers }
    if (maskedHeaders.Authorization) maskedHeaders.Authorization = '***'
    if (maskedHeaders.Authorization && maskedHeaders.Authorization.startsWith('Basic ')) {
      maskedHeaders.Authorization = 'Basic ***'
    }
    return {
      _dry_run: true,
      method,
      url: `${BASE_URL}${path}`,
      headers: maskedHeaders,
      body: useForm && requestBody ? requestBody : body || undefined,
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: requestBody,
  })
  const text = await res.text()
  let payload
  try {
    payload = JSON.parse(text)
  } catch {
    payload = { body: text }
  }
  if (!res.ok) {
    return { status: res.status, ...payload }
  }
  return payload
}

async function oauthToken(body) {
  requireClientCredentials()
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')
  const headers = {
    Authorization: `Basic ${auth}`,
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  const formBody = new URLSearchParams(body).toString()

  if (args['dry-run']) {
    return {
      _dry_run: true,
      method: 'POST',
      url: `${BASE_URL}/oauth/token`,
      headers: { ...headers, Authorization: 'Basic ***' },
      body,
    }
  }

  const res = await fetch(`${BASE_URL}/oauth/token`, {
    method: 'POST',
    headers,
    body: formBody,
  })
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return { status: res.status, body: text }
  }
}

function generatePkce(length = 96) {
  if (!Number.isInteger(length) || length < 43 || length > 128) {
    throw new Error('--length must be an integer between 43 and 128')
  }
  const codeVerifier = crypto.randomBytes(length).toString('base64url').slice(0, length)
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url')
  const state = crypto.randomBytes(32).toString('base64url')
  return {
    code_verifier: codeVerifier,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  }
}

function buildDesignCreateBody() {
  const title = args.title
  const assetId = args['asset-id']
  const preset = args.preset
  const width = args.width
  const height = args.height

  if (!preset && !(width && height)) {
    throw new Error('Provide either --preset <doc|whiteboard|presentation> or both --width and --height')
  }
  if (preset && (width || height)) {
    throw new Error('Use either --preset or custom --width/--height, not both')
  }

  const body = {}
  if (title) body.title = title
  if (assetId) body.asset_id = assetId

  if (preset) {
    body.design_type = {
      type: 'preset',
      name: preset,
    }
  } else {
    body.design_type = {
      type: 'custom',
      width: parseInteger(width, '--width'),
      height: parseInteger(height, '--height'),
    }
  }

  return body
}

function buildExportFormat() {
  const type = args.format
  if (!type) throw new Error('--format required')

  const pages = parseCsv(args.pages)?.map(value => parseInteger(value, 'pages'))
  const exportQuality = args['export-quality']
  const width = parseInteger(args.width, '--width')
  const height = parseInteger(args.height, '--height')
  const qualityNumber = parseInteger(args.quality, '--quality')

  switch (type) {
    case 'pdf': {
      const format = { type }
      if (exportQuality) format.export_quality = exportQuality
      if (args.size) format.size = args.size
      if (pages) format.pages = pages
      return format
    }
    case 'jpg': {
      if (qualityNumber === undefined) throw new Error('--quality required for jpg exports')
      const format = { type, quality: qualityNumber }
      if (width !== undefined) format.width = width
      if (height !== undefined) format.height = height
      if (pages) format.pages = pages
      return format
    }
    case 'png': {
      const format = { type }
      if (width !== undefined) format.width = width
      if (height !== undefined) format.height = height
      if (pages) format.pages = pages
      if (args.lossless) format.lossless = true
      if (args['as-single-image']) format.as_single_image = true
      return format
    }
    case 'pptx': {
      const format = { type }
      if (pages) format.pages = pages
      return format
    }
    case 'gif': {
      const format = { type }
      if (width !== undefined) format.width = width
      if (height !== undefined) format.height = height
      if (pages) format.pages = pages
      if (exportQuality) format.export_quality = exportQuality
      return format
    }
    case 'mp4': {
      if (!args.quality) throw new Error('--quality required for mp4 exports')
      const format = { type, quality: args.quality }
      if (pages) format.pages = pages
      if (exportQuality) format.export_quality = exportQuality
      return format
    }
    default:
      throw new Error('Unsupported --format. Use pdf, jpg, png, pptx, gif, or mp4')
  }
}

async function main() {
  let result

  switch (cmd) {
    case 'oauth':
      switch (sub) {
        case 'pkce':
          result = generatePkce(args.length ? parseInteger(args.length, '--length') : 96)
          break
        case 'auth-url': {
          if (!CLIENT_ID) throw new Error('CANVA_CLIENT_ID environment variable required')
          const scopes = args.scopes
          if (!scopes) throw new Error('--scopes required')
          const codeChallenge = args['code-challenge']
          if (!codeChallenge) throw new Error('--code-challenge required')
          const state = args.state
          const authUrl = new URL(AUTHORIZE_URL)
          authUrl.searchParams.set('client_id', CLIENT_ID)
          authUrl.searchParams.set('response_type', 'code')
          authUrl.searchParams.set('scope', scopes)
          authUrl.searchParams.set('code_challenge_method', args['challenge-method'] || 'S256')
          authUrl.searchParams.set('code_challenge', codeChallenge)
          if (args['redirect-uri']) authUrl.searchParams.set('redirect_uri', args['redirect-uri'])
          if (state) authUrl.searchParams.set('state', state)
          result = {
            authorization_url: authUrl.toString(),
            note: 'Canva requires PKCE. Use `oauth pkce` to generate a verifier/challenge pair. Keep code_verifier server-side and send only code_challenge in the browser redirect.',
          }
          break
        }
        case 'token': {
          const code = args.code
          const codeVerifier = args['code-verifier']
          if (!code || !codeVerifier) throw new Error('--code and --code-verifier required')
          const body = {
            grant_type: 'authorization_code',
            code,
            code_verifier: codeVerifier,
          }
          if (args['redirect-uri']) body.redirect_uri = args['redirect-uri']
          result = await oauthToken(body)
          break
        }
        case 'refresh': {
          const refreshToken = args['refresh-token']
          if (!refreshToken) throw new Error('--refresh-token required')
          result = await oauthToken({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
          })
          break
        }
        default:
          result = {
            error: 'Unknown oauth subcommand. Use: auth-url, token, refresh',
          }
      }
      break

    case 'users':
      switch (sub) {
        case 'me':
          result = await api('GET', '/users/me')
          break
        case 'profile':
          result = await api('GET', '/users/me/profile')
          break
        default:
          result = { error: 'Unknown users subcommand. Use: me, profile' }
      }
      break

    case 'designs':
      switch (sub) {
        case 'list': {
          const query = buildQuery({
            query: args.query,
            continuation: args.continuation,
            limit: args.limit,
            ownership: args.ownership,
            sort_by: args['sort-by'],
          })
          result = await api('GET', `/designs${query}`)
          break
        }
        case 'create':
          result = await api('POST', '/designs', buildDesignCreateBody())
          break
        default:
          result = { error: 'Unknown designs subcommand. Use: list, create' }
      }
      break

    case 'exports':
      switch (sub) {
        case 'create': {
          const designId = args['design-id']
          if (!designId) throw new Error('--design-id required')
          result = await api('POST', '/exports', {
            design_id: designId,
            format: buildExportFormat(),
          })
          break
        }
        case 'get': {
          const id = args.id
          if (!id) throw new Error('--id required')
          result = await api('GET', `/exports/${id}`)
          break
        }
        default:
          result = { error: 'Unknown exports subcommand. Use: create, get' }
      }
      break

    case 'folders':
      switch (sub) {
        case 'create': {
          const name = args.name
          const parentFolderId = args['parent-folder-id'] || 'root'
          if (!name) throw new Error('--name required')
          result = await api('POST', '/folders', {
            name,
            parent_folder_id: parentFolderId,
          })
          break
        }
        case 'items': {
          const id = args.id
          if (!id) throw new Error('--id required')
          const query = buildQuery({
            continuation: args.continuation,
            limit: args.limit,
            item_types: args['item-types'],
            sort_by: args['sort-by'],
          })
          result = await api('GET', `/folders/${id}/items${query}`)
          break
        }
        default:
          result = { error: 'Unknown folders subcommand. Use: create, items' }
      }
      break

    case 'assets':
      switch (sub) {
        case 'import-url': {
          const name = args.name
          const url = args.url
          if (!name || !url) throw new Error('--name and --url required')
          result = await api('POST', '/url-asset-uploads', { name, url })
          break
        }
        case 'import-url-status': {
          const jobId = args['job-id']
          if (!jobId) throw new Error('--job-id required')
          result = await api('GET', `/url-asset-uploads/${jobId}`)
          break
        }
        default:
          result = { error: 'Unknown assets subcommand. Use: import-url, import-url-status' }
      }
      break

    case 'brand-templates':
      switch (sub) {
        case 'list': {
          const query = buildQuery({
            query: args.query,
            continuation: args.continuation,
            limit: args.limit,
            ownership: args.ownership,
            sort_by: args['sort-by'],
            dataset: args.dataset,
          })
          result = await api('GET', `/brand-templates${query}`)
          break
        }
        case 'get': {
          const id = args.id
          if (!id) throw new Error('--id required')
          result = await api('GET', `/brand-templates/${id}`)
          break
        }
        case 'dataset': {
          const id = args.id
          if (!id) throw new Error('--id required')
          result = await api('GET', `/brand-templates/${id}/dataset`)
          break
        }
        default:
          result = { error: 'Unknown brand-templates subcommand. Use: list, get, dataset' }
      }
      break

    default:
      result = {
        error: 'Unknown command',
        usage: {
          oauth: 'oauth [pkce [--length <43-128>] | auth-url --scopes <space-separated> --code-challenge <pkce_challenge> [--redirect-uri <uri>] [--state <value>] | token --code <code> --code-verifier <verifier> [--redirect-uri <uri>] | refresh --refresh-token <token>]',
          users: 'users [me | profile]',
          designs: 'designs [list [--query <text>] [--limit <n>] [--ownership any|owned|shared] [--sort-by relevance|modified_descending|modified_ascending|title_descending|title_ascending] | create [--title <title>] (--preset <doc|whiteboard|presentation> | --width <px> --height <px>) [--asset-id <asset_id>]]',
          exports: 'exports [create --design-id <id> --format <pdf|jpg|png|pptx|gif|mp4> [format options] | get --id <export_job_id>]',
          folders: 'folders [create --name <name> [--parent-folder-id <id|root|uploads>] | items --id <folder_id> [--item-types design,folder,image] [--limit <n>]]',
          assets: 'assets [import-url --name <name> --url <public_url> | import-url-status --job-id <job_id>]',
          brandTemplates: 'brand-templates [list [--query <text>] [--dataset any|non_empty] | get --id <id> | dataset --id <id>]',
          options: '--dry-run',
        },
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch(err => {
  console.error(JSON.stringify({ error: err.message }))
  process.exit(1)
})
