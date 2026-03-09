const test = require('node:test')
const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')
const path = require('node:path')

const repoRoot = path.resolve(__dirname, '..')

function runCli(relativePath, args) {
  const fullPath = path.join(repoRoot, relativePath)
  const output = execFileSync('node', [fullPath, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: { ...process.env },
  })
  return JSON.parse(output)
}

test('all CLIs allow --dry-run without integration env vars', () => {
  const scripts = [
    'tools/clis/apollo.js',
    'tools/clis/builtwith.js',
    'tools/clis/firecrawl.js',
    'tools/clis/findymail.js',
    'tools/clis/google-ads.js',
    'tools/clis/hunter.js',
    'tools/clis/icypeas.js',
    'tools/clis/instantly.js',
    'tools/clis/lemlist.js',
    'tools/clis/meta-ads.js',
    'tools/clis/millionverifier.js',
    'tools/clis/neverbounce.js',
    'tools/clis/parallel-ai.js',
    'tools/clis/prospeo.js',
    'tools/clis/rocketreach.js',
    'tools/clis/resend.js',
    'tools/clis/smartlead.js',
    'tools/clis/tavily-ai.js',
  ]

  for (const script of scripts) {
    const result = runCli(script, ['unknown', '--dry-run'])
    assert.equal(typeof result.error, 'string')
    assert.match(result.error.toLowerCase(), /unknown command/)
  }
})

test('resend validates required ID arguments', () => {
  const result = runCli('tools/clis/resend.js', ['emails', 'get', '--dry-run'])
  assert.equal(result.error, 'Email ID required')
})
