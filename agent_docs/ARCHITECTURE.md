# Architecture

Core principles, structure, and design patterns for Investify.

## Core Principles

1. **Server Components by Default** - All components are Server Components unless interactivity required
2. **Client Components for Interactivity** - Add `'use client'` only for forms, state, event handlers
3. **Server Actions over API Routes** - Mutations via Server Actions, not API routes
4. **Zod Validation** - All external input validated with Zod schemas
5. **Firebase Authentication** - Session-based auth via `@/lib/session`
6. **Type Safety** - Strict TypeScript, no `any` (use `unknown` + type guards)
7. **Code Quality Enforced** - ESLint 9 + Prettier 3 (100 char, 2 spaces, single quotes)

## Project Structure

```
src/
├── app/                    # Next.js App Router (layouts, pages, not-found)
├── components/             # Shared UI (shadcn/ui - add via `npx shadcn@latest add`)
├── features/               # Feature modules
│   └── {feature}/
│       ├── components/     # Feature UI components
│       ├── repository.ts   # Database layer (Firestore)
│       ├── service.ts      # Business logic, view models
│       ├── action.ts       # Server Actions
│       ├── type.ts         # Types
│       └── schema.ts       # Zod schemas
├── hooks/                  # React hooks
├── lib/                    # Shared utilities (db, firebase, session, utils)
├── styles/                 # CSS & Tailwind
└── types/                  # Shared types
```

## Data Flow Patterns

### Listing (Read)

**Flow:** Server Component → service → repository → Firestore → Client Component

Server-side page fetches data from service, passes to client components for display.

Example: `features/schemes/service.ts:18` (getSchemeViews)

### Create/Update (Write)

**Flow:** User Input → Form → Server Action → Zod Validation → service → repository → Firestore

1. User submits form in client component
2. Server Action receives FormData
3. Zod schema validates input
4. Service executes business logic
5. Repository persists to Firestore
6. revalidatePath() clears cache, redirect() navigates user

Example: `features/goal/action.ts:11` (handleCreateGoal)

### Error Handling

**Current State:** Throw errors with context messages. Structured error handling planned for future.

```typescript
throw new Error(`Failed to fetch scheme ${schemeId}: ${error.message}`);
```

## Service Communication

### Layer Responsibilities

| Layer             | Calls                      | Never Calls          |
| ----------------- | -------------------------- | -------------------- |
| **action.ts**     | service                    | repository directly  |
| **service.ts**    | other services, repository | -                    |
| **repository.ts** | @/lib/db only              | other repos/services |

### Cross-Feature Calls

Services call other services, never repositories directly.

Example: `features/portfolio/service.ts:3-4` imports from schemes/service and transactions/service

## Adding shadcn Components

All UI components come from shadcn/ui. Add components using the latest command format:

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add form
```

Components are installed to `src/components/ui/` and can be imported directly:

```typescript
import { Button } from '@/components/ui/button';
```

Available components in the project: button, input, form, dialog, select, textarea, checkbox, radio-group, switch, alert, card, badge, tabs, and more.

## Related Documentation

- [CODE_CONVENTIONS.md](CODE_CONVENTIONS.md) - Code style and patterns
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Firestore structure
- [SERVICE_ARCHITECTURE.md](SERVICE_ARCHITECTURE.md) - Service details
