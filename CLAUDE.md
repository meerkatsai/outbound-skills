# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This directory is a **collection of independent projects**, not a single monorepo. Each subdirectory is its own project with its own `package.json`, dependencies, and Git history. The projects are primarily focused on Claude AI integrations and MCP (Model Context Protocol) tooling.

## Projects and Commands

### NanoClaw (`/nanoclaw/`)
Personal Claude assistant via WhatsApp. Single Node.js process routing messages to Claude Agent SDK in Apple Containers (Linux VMs). Each WhatsApp group has isolated filesystem and memory (`groups/{name}/CLAUDE.md`).

```bash
npm run dev          # Run with hot reload (tsx)
npm run build        # Compile TypeScript
npm run auth         # WhatsApp authentication
npm run typecheck    # TypeScript type checking
./container/build.sh # Rebuild agent container
# Service management (macOS):
launchctl load ~/Library/LaunchAgents/com.nanoclaw.plist
launchctl unload ~/Library/LaunchAgents/com.nanoclaw.plist
```

Key files: `src/index.ts` (main — WhatsApp connection + message routing), `src/container-runner.ts` (spawns agent containers), `src/task-scheduler.ts` (cron tasks), `src/db.ts` (SQLite), `src/config.ts` (triggers/paths/intervals).

### Backgammon MCP (`/backgammon-mcp/`)
Backgammon game integrated with Claude Desktop via MCP. **pnpm workspace monorepo** with packages: `game` (Redux logic), `viewer` (React board UI), `web-app` (Vite standalone), `mcp-server` (MCP integration with bundled UI).

```bash
pnpm dev             # Web app dev server
pnpm build           # Build all packages
pnpm test            # Vitest
pnpm typecheck       # Type check all packages
pnpm mcp             # Start MCP server
pnpm lint            # ESLint
pnpm format          # Prettier
```

### DXT (`/dxt/`)
CLI toolchain for packaging MCP servers as installable Desktop Extensions (`.dxt` files). See `MANIFEST.md` for the extension format spec and `CLI.md` for tool usage.

```bash
yarn build           # tsc compilation
yarn test            # Jest
yarn lint            # tsc + eslint
yarn fix             # eslint --fix + prettier
yarn dev             # Watch mode
```

### Claude Artifact Runner (`/claude-artifact-runner/`)
Framework for running Claude AI artifacts as standalone React apps with file-based routing. Uses Vite + Shadcn UI.

```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm run lint         # ESLint
```

### OpenAI Realtime UI (`/openai-realtime-ui/`)
Web app for OpenAI Realtime API. Requires `.env` with `OPENAI_API_KEY` (and optional `SEARXNG_URL`). Express.js SSR + Vite client.

```bash
npm run dev          # Dev server
npm run build        # Build client & server
npm run lint         # ESLint
```

### My MCP Server (`/my-mcp-server/`)
Authless remote MCP server deployed on Cloudflare Workers.

```bash
npm run dev          # Wrangler local dev
npm run deploy       # Deploy to Cloudflare
npm run type-check   # TypeScript checking
npm run format       # Biome format
```

### Meerkats Website (`/meerkats website/meerkats.ai/`)
Main product website. Next.js 14 deployed on Netlify. Note the space in the directory name.

```bash
npm run dev          # Next.js dev on port 4028
npm run build        # Production build
npm run type-check   # TypeScript
npm run lint         # ESLint
npm run format       # Prettier
```

### MDX Blog (`/mdx-blog/`)
Next.js blog with MDX content.

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint
```

## Coding Standards

These patterns apply across all TypeScript projects in this repo (enforced explicitly in `backgammon-mcp`):

- **Discriminated unions** over optional properties — model state without impossible combinations
- **No TypeScript enums** — use string literal unions instead
- **No classes** unless required by a dependency — prefer factory functions and builder patterns
- **Explicit return type annotations** on functions unless the type is complex enough to benefit from inference (rule of thumb: annotate if the return type is under ~20 characters)
- **Named arguments via object destructuring** for functions with 3+ parameters

## Technology Stack

| Concern | Technology |
|---------|-----------|
| Language | TypeScript 5.x (universal) |
| Frontend | React 18, Next.js 14/15, Vite |
| Styling | Tailwind CSS 3/4, Shadcn UI, Radix UI |
| Backend | Node.js 20+, Express, Cloudflare Workers |
| Testing | Vitest (backgammon-mcp), Jest (dxt) |
| Linting | ESLint 9 + Prettier (most), Biome (mcp-server) |
| Schema validation | Zod |
| Database | SQLite via better-sqlite3 (nanoclaw) |
| Package managers | npm (most), pnpm (backgammon-mcp), yarn (dxt) |
