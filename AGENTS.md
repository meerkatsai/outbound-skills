# AGENTS.md

Guidelines for AI agents working in this repository.

## Repository Overview

This repository contains **Agent Skills** for GTM workflows following the [Agent Skills specification](https://agentskills.io/specification.md). Skills install to `.agents/skills/` (the cross-agent standard). This repo also serves as a **Claude Code plugin marketplace** via `.claude-plugin/marketplace.json`.

- **Name**: GTM Skills
- **GitHub**: [meerkatsai/gtm-skills](https://github.com/meerkatsai/gtm-skills)
- **Creator**: meerkatsai
- **License**: MIT

## Repository Structure

```text
gtm-skills/
├── .claude-plugin/
│   └── marketplace.json   # Claude Code plugin marketplace manifest
├── skills/                # Agent Skills
│   └── skill-name/
│       └── SKILL.md       # Required skill file
├── tools/
│   ├── clis/              # Zero-dependency Node.js CLI tools
│   ├── integrations/      # API integration guides per tool
│   └── REGISTRY.md        # Tool index with capabilities
├── tests/                 # Node test runner test files
├── CONTRIBUTING.md
├── LICENSE
├── README.md
└── VERSIONS.md
```

## Build / Lint / Test Commands

**Skills** are content-first. Verify:
- YAML frontmatter is valid
- `name` field matches directory name exactly
- `name` is 1-64 chars, lowercase alphanumeric and hyphens only
- `description` is 1-1024 characters

Run local validation before opening a PR:

```bash
npm test
./validate-skills.sh
```

**CLI tools** (`tools/clis/*.js`) are zero-dependency Node.js scripts (Node 18+). Verify with:

```bash
node --check tools/clis/<name>.js
node tools/clis/<name>.js
node tools/clis/<name>.js <cmd> --dry-run
```

## Agent Skills Specification

Skills follow the [Agent Skills spec](https://agentskills.io/specification.md).

### Required Frontmatter

```yaml
---
name: skill-name
description: What this skill does and when to use it. Include trigger phrases.
---
```

### Frontmatter Field Constraints

| Field         | Required | Constraints                                                      |
|---------------|----------|------------------------------------------------------------------|
| `name`        | Yes      | 1-64 chars, lowercase `a-z`, numbers, hyphens. Must match dir.   |
| `description` | Yes      | 1-1024 chars. Describe what it does and when to use it.          |
| `license`     | No       | License name (default: MIT)                                      |
| `metadata`    | No       | Key-value pairs (author, version, etc.)                          |

### Name Field Rules

- Lowercase letters, numbers, and hyphens only
- Cannot start or end with hyphen
- No consecutive hyphens (`--`)
- Must match parent directory name exactly

**Valid**: `smartlead-outbound`, `competitor-alternatives`, `email-sequence`
**Invalid**: `Smartlead-Outbound`, `-outbound`, `smartlead--outbound`

### Optional Skill Directories

```text
skills/skill-name/
├── SKILL.md        # Required - main instructions (<500 lines)
├── references/     # Optional - detailed docs loaded on demand
├── scripts/        # Optional - executable code
├── assets/         # Optional - templates, data files
└── evals/          # Optional - evaluation inputs/fixtures
```

## Writing Style Guidelines

### Structure

- Keep `SKILL.md` under 500 lines (move details to `references/`)
- Use H2 (`##`) for main sections, H3 (`###`) for subsections
- Use bullet points and numbered lists liberally
- Keep paragraphs short

### Tone

- Direct and instructional
- Second person where useful
- Professional and practical

### Formatting

- Bold (`**text**`) for key terms
- Code blocks for examples and templates
- Tables for reference data
- Avoid excessive emojis

### Clarity Principles

- Clarity over cleverness
- Specific over vague
- Active voice over passive
- One idea per section

### Description Field Best Practices

The `description` drives skill discovery. Include:
1. What the skill does
2. When to use it (trigger phrases)
3. Related skills for scope boundaries

```yaml
description: When the user needs to build or improve outbound workflows in Smartlead. Use when the user says "smartlead sequence," "outbound campaign," or "email outreach setup." For competitor page messaging, see competitor-alternatives.
```

## Claude Code Plugin

This repo also serves as a plugin marketplace. The manifest at `.claude-plugin/marketplace.json` is used for installation workflows.

```bash
/plugin marketplace add meerkatsai/gtm-skills
/plugin install gtm-skills
```

See [Claude Code plugins documentation](https://code.claude.com/docs/en/plugins.md) for details.

## Git Workflow

### Branch Naming

- New skills/features: `feature/skill-name`
- Fixes and improvements: `fix/skill-name-description`
- Documentation: `docs/description`

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat: add smartlead-outbound skill`
- `fix: improve apollo dry-run validation`
- `docs: update AGENTS guidelines`

### Pull Request Checklist

- [ ] `name` matches directory name exactly
- [ ] `name` follows naming rules (lowercase, hyphens, no `--`)
- [ ] `description` is 1-1024 chars with trigger phrases
- [ ] `SKILL.md` is under 500 lines
- [ ] Local checks pass (`npm test` and `./validate-skills.sh`)
- [ ] No sensitive data or credentials

## Tool Integrations

This repository includes a tools registry for GTM-compatible tooling.

- **Tool discovery**: Read `tools/REGISTRY.md` to see available tools and capabilities
- **Integration details**: See `tools/integrations/{tool}.md` for API endpoints, auth, and operations
- **CLI implementations**: Use `tools/clis/{tool}.js` for executable workflows

### Registry Structure

```text
tools/
├── REGISTRY.md
├── clis/
│   ├── apollo.js
│   ├── icypeas.js
│   ├── findymail.js
│   ├── neverbounce.js
│   ├── millionverifier.js
│   ├── prospeo.js
│   ├── rocketreach.js
│   ├── builtwith.js
│   ├── smartlead.js
│   ├── instantly.js
│   ├── hunter.js
│   ├── lemlist.js
│   ├── resend.js
│   ├── google-ads.js
│   ├── meta-ads.js
│   ├── firecrawl.js
│   ├── parallel-ai.js
│   └── tavily-ai.js
└── integrations/
    ├── apollo.md
    ├── icypeas.md
    ├── findymail.md
    ├── neverbounce.md
    ├── millionverifier.md
    ├── prospeo.md
    ├── rocketreach.md
    ├── reversecontact.md
    ├── builtwith.md
    ├── heyreach.md
    ├── lagrowthmachine.md
    ├── smartlead.md
    ├── instantly.md
    ├── hunter.md
    ├── lemlist.md
    ├── resend.md
    ├── vercel.md
    ├── firecrawl.md
    ├── parallel-ai.md
    ├── tavily-ai.md
    ├── google-ads.md
    ├── meta-ads.md
    ├── hubspot.md
    └── stripe.md
```

### When to Use Tools

Skills should reference relevant tools for execution. Examples:
- `smartlead-outbound` skill -> smartlead, instantly, lemlist, resend guides
- enrichment/account targeting work -> apollo, hunter, hubspot guides
- paid acquisition work -> google-ads, meta-ads guides

## Checking for Updates

When using any skill from this repository:

1. Once per session, on first skill use, check for updates:
   - Fetch `VERSIONS.md` from GitHub: https://raw.githubusercontent.com/meerkatsai/gtm-skills/main/VERSIONS.md
   - Compare versions against local skill files
2. Only prompt if meaningful:
   - 2 or more skills have updates, OR
   - Any skill has a major version bump
3. Non-blocking notification at end of response:

```text
---
Skills update available: X GTM skills have updates.
Say "update skills" to update automatically, or run `git pull` in your gtm-skills folder.
```

4. If user says "update skills":
   - Run `git pull` in the `gtm-skills` directory
   - Confirm what was updated

## Skill Categories

See `README.md` for current skills and repository scope. When adding new skills, follow existing naming and structure patterns in `skills/`.
