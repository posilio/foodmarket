# CLAUDE.md — Claude Code Behaviour Rules for FoodMarket

> ⚠️ MANDATORY: Write SESSION_OUTPUT.txt to the project root after EVERY task, no exceptions. If you are about to respond with a completion message without having written SESSION_OUTPUT.txt first, stop and write it now.

> These rules apply to every Claude Code session in this project. Read this file before starting any task.

---

## Session Output Rule (MANDATORY)

After **every completed task**, write `SESSION_OUTPUT.txt` to the project root.
Always **overwrite** — never append. Use exactly this format:

```
SESSION NAME: <short description of what was done>
DATE: <today's date>

FILES CHANGED:
- <full/path/to/file.ts> — <what changed and why>
- ...

FILES CREATED:
- <full/path/to/file.ts> — <what the file does>
- ...

MIGRATIONS:
- <migration folder name> — <what schema change it applies>
  (or "None")

ENDPOINTS ADDED/CHANGED:
- METHOD /path — <request shape> → <response shape>
  (or "None")

FRONTEND CHANGES:
- <ComponentName> (<package>) — <what changed>
  (or "None")

ERRORS/ISSUES ENCOUNTERED:
- <description of any error hit and how it was resolved>
  (or "None")

TEST RESULTS:
- Build: PASS / FAIL
- Tests: <N> passed, <N> failed
- (or "Tests not run")

NOTES FOR CLAUDE.AI:
- <open questions, follow-ups, or things the next prompt should address>
  (or "None")
```

This file is the handoff artifact between Claude Code and Claude.ai. It must be written even if the session only changed one line.

---

## Workflow

This project uses a two-tool loop:

1. **Claude.ai** writes detailed implementation prompts
2. Prompt is pasted into **Claude Code** (this tool) locally
3. Claude Code implements, runs tests, writes `SESSION_OUTPUT.txt`
4. `SESSION_OUTPUT.txt` is copied and pasted back to **Claude.ai**
5. Claude.ai reviews and writes the next prompt

---

## General Rules

- Always run `npx tsc --noEmit` on affected packages before committing
- Always run `npm run test --workspace=packages/backend` before committing
- Never skip tests unless the user explicitly says to
- Prefer editing existing files over creating new ones
- Never commit `.env` files
- Never upgrade Prisma to v7 (v6 is pinned — v7 removed `url` from datasource)
- Next.js config must be `.mjs`, not `.ts` (Next.js 14 limitation)
- `import logger from '../lib/logger'` — default export, NOT named import
- Kill stale tsx/node processes before starting dev servers on Windows

---

## Key Infrastructure

- PostgreSQL port: **5433** (not 5432 — native Windows PG occupies 5432 locally)
- Docker container: `foodmarket-postgres-1`
- Backend dev: `http://localhost:4000`
- Storefront dev: `http://localhost:3000`
- Admin dev: `http://localhost:3001`

## Prisma Commands (from `packages/backend/`)

```bash
node_modules/.bin/prisma.cmd migrate dev --schema=src/prisma/schema.prisma --name <name>
node_modules/.bin/prisma.cmd migrate deploy --schema=src/prisma/schema.prisma
node_modules/.bin/prisma.cmd generate --schema=src/prisma/schema.prisma
```

> `migrate dev` requires a TTY. In bash subprocesses: write SQL manually, then use `migrate deploy` + `generate`.

---

> Before marking any task complete: have you written SESSION_OUTPUT.txt? If not, do it now.
