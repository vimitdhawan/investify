<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Investify

A web application for analyzing Indian mutual fund portfolios. Track investments, analyze performance, and generate tax reports.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Language:** TypeScript 5 (strict mode)
- **Database:** Firebase (Firestore)
- **Auth:** Firebase Authentication
- **UI:** Tailwind CSS 4 + shadcn/ui
- **Validation:** Zod
- **Testing:** Jest 29
- **Code Quality:** ESLint 9 + Prettier 3

## Quick Start

```bash
npm install       # Install dependencies
npm run dev       # Development server
npm test          # Run tests
npm run build     # Build for production
```

## Agent Guidelines (Token Efficiency)

### Approach

- **Think before acting.** Read existing files before writing code.
- **Be concise.** Concise in output but thorough in reasoning.
- **Prefer editing.** Edit existing files over rewriting whole files.
- **No redundant reads.** Do not re-read files you have already read unless the file may have changed.
- **Test thoroughly.** Test your code before declaring done.
- **No fluff.** No sycophantic openers or closing fluff.
- **Keep simple.** Keep solutions simple and direct. No over-engineering.
- **Be honest.** If unsure: say so. Never guess or invent file paths.
- **User first.** User instructions always override this file.

### Efficiency

- **Read before writing.** Understand the problem before coding.
- **No redundant reads.** Read each file once.
- **One focused pass.** Avoid write-delete-rewrite cycles.
- **Test once.** Test once, fix if needed, verify once. No unnecessary iterations.
- **Budget conscious.** Work efficiently within operational constraints.

## Documentation

Start here based on what you're working on:

- **New to the project?** → [agent_docs/ARCHITECTURE.md](agent_docs/ARCHITECTURE.md)
- **Writing code?** → [agent_docs/CODE_CONVENTIONS.md](agent_docs/CODE_CONVENTIONS.md)
- **Working with data?** → [agent_docs/DATABASE_SCHEMA.md](agent_docs/DATABASE_SCHEMA.md)
- **Understanding services?** → [agent_docs/SERVICE_ARCHITECTURE.md](agent_docs/SERVICE_ARCHITECTURE.md)
- **Server Actions/Forms?** → [agent_docs/SERVICE_COMMUNICATION_PATTERNS.md](agent_docs/SERVICE_COMMUNICATION_PATTERNS.md)
- **Writing tests?** → [agent_docs/RUNNING_TESTS.md](agent_docs/RUNNING_TESTS.md)
- **Building/deploying?** → [agent_docs/BUILDING_THE_PROJECT.md](agent_docs/BUILDING_THE_PROJECT.md)
- **Implementing features?** → [openspec/AGENTS.md](openspec/AGENTS.md)

## Key Files for Agents

Quick reference to important configuration and utility files:

- **Config:** `tsconfig.json`, `eslint.config.mjs`, `.prettierrc.json`, `next.config.ts`
- **Tests:** `jest.config.js`, `jest.setup.js`
- **Database:** `src/lib/db.ts`, `src/lib/firebase.ts`
- **Logging:** `src/lib/logger.ts`

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:

- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"` to keep the graph current
