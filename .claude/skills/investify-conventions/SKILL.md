---
name: investify-conventions
description: Investify code conventions and quality rules enforced by ESLint and Prettier. Use when writing any TypeScript or TSX file, reviewing code, or implementing features. These rules are checked in CI and cause PR failures if violated.
user-invocable: false
---

# Investify Code Conventions

Follow these conventions when writing code. They are enforced by ESLint, Prettier, and TypeScript in CI (`npm run check-all`).

---

## Quick Checklist (Most Common Issues)

Before committing, verify:

- [ ] No `any` type — use `unknown` + type guards instead
- [ ] All type-only imports use `import type { X }`
- [ ] All exports are named (never `export default`)
- [ ] Unused function parameters prefixed with `_`
- [ ] No `console.log` in production code — use `logger` or `console.warn/error/info`
- [ ] Import order correct (react → next → third-party → @/ → relative)
- [ ] Run `npm run check-all` before pushing — must pass

---

## 1. No `any` Type — Use `unknown` + Type Guards

### ❌ WRONG

```typescript
// Using any is forbidden
try {
  await doSomething();
} catch (error: any) {
  console.log(error.message); // Unsafe - error might not have .message
}

// Type assertion is also wrong
const value: any = getData();
```

### ✅ CORRECT

```typescript
// Use unknown with type guard
try {
  await doSomething();
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  logger.error({ error }, message);
}

// Type-safe check before accessing properties
function handleValue(value: unknown) {
  if (typeof value === 'string') {
    console.log(value.toUpperCase()); // Safe - we know it's a string
  }
}
```

### Type Guard Patterns

```typescript
// Error handling (most common)
catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return { errorMessage: message };
}

// Object properties
if (typeof obj === 'object' && obj !== null && 'id' in obj) {
  const id = (obj as { id: string }).id;
}

// Union type narrowing
if (typeof value === 'string') { }
if (typeof value === 'number') { }
if (Array.isArray(value)) { }

// Custom type guard
function isGoal(obj: unknown): obj is Goal {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj
  );
}
```

### Exception

- ✅ Allowed in `*.test.ts` and `*.spec.ts` files only

---

## 2. Type-Only Imports Must Use `import type`

### ❌ WRONG

```typescript
import { GoalActionState, GoalView } from './type';
```

### ✅ CORRECT

```typescript
import type { GoalActionState, GoalView } from './type';
```

### Why?

When TypeScript compiles to JavaScript, unused imports are removed. Using `import type` explicitly tells TypeScript to remove the import entirely at build time, shrinking bundle size.

### Mixed Pattern (Types and Values)

```typescript
// ❌ WRONG - mixing in one line
import { GoalView, createGoal } from './module';

// ✅ CORRECT - separate type and value imports
import type { GoalView } from './type';
import { createGoal } from './service';
```

---

## 3. Named Exports Only — Never `export default`

### ❌ WRONG

```typescript
// Default export forbidden
export default function GoalCard() {}

// Or
const GoalCard = () => {};
export default GoalCard;
```

### ✅ CORRECT

```typescript
export function GoalCard() {}

// Or
export const GoalCard = () => {};
```

### Why?

Named exports make refactoring easier and prevent naming collisions. They're also more explicit when importing:

```typescript
// Clear what you're importing
import { GoalCard, GoalForm } from './components';

// vs unclear default export
import GoalCard from './goal-card'; // What is this?
import GoalForm from './goal-form'; // What is this?
```

---

## 4. Unused Variables Must Prefix with `_`

### ❌ WRONG

```typescript
// Unused parameter without _
export async function handleCreateGoal(prev, formData) {}

// Unused variable
const result = someFunction();
```

### ✅ CORRECT

```typescript
// Prefix unused param with _
export async function handleCreateGoal(_prev: GoalActionState, formData: FormData) {}

// Prefix unused variable with _
const _result = someFunction();
```

### Common Patterns

```typescript
// useActionState - first param is often unused
const [state, action, isPending] = useActionState(handleCreateGoal, {});

// Destructuring with unused fields
const { id, _timestamp, name } = goal;

// Array iteration ignoring index
list.forEach((_item, index) => {
  console.log(index);
});
```

### Exception

- ✅ Allowed to skip the `_` prefix in `*.test.ts` files

---

## 5. No `console.log` in Production Code

### ❌ WRONG

```typescript
// Forbidden in production files
console.log('User created:', user);
```

### ✅ CORRECT

**For structured logging**, use `@/lib/logger`:

```typescript
import { logger } from '@/lib/logger';

logger.info({ userId: user.id }, 'User created');
logger.warn({ error: err }, 'Validation failed');
logger.error({ error: err }, 'Database error');
```

**For simple debug messages**, use allowed methods:

```typescript
console.warn('Deprecated API used');
console.error('Failed to load data');
console.info('Processing complete');
```

### When is `console.log` Allowed?

- ✅ In test files (`*.test.ts`, `*.spec.ts`)
- ❌ Never in production code (`src/` excluding tests)
- ❌ Never in public scripts that run on users' machines

### Logger Setup

```typescript
// src/lib/logger.ts (already configured)
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});
```

### Usage Examples

```typescript
// Simple info
logger.info('Goal created successfully');

// With context
logger.info({ goalId, userId }, 'Goal created');

// Warning
logger.warn({ amount, limit }, 'Amount exceeds limit');

// Error
logger.error({ error: err.message, stack: err.stack }, 'Failed to fetch');

// Multiple fields
logger.debug(
  {
    userId,
    goalId,
    action: 'update',
    newAmount: 500000,
  },
  'Attempting goal update'
);
```

---

## 6. Import Order (Enforced by Prettier)

### Order (Top to Bottom)

1. **React** — `import React from 'react'` (if needed)
2. **Next.js** — `import Link from 'next/link'`, `import { cookies } from 'next/headers'`
3. **Third-party UI libraries** — `import { Button } from '@radix-ui/...', from '@tabler/icons-react'`
4. **Third-party utilities** — `import { z } from 'zod'`, `import pino from 'pino'`
5. **Project components** — `import { Card } from '@/components/ui/card'`
6. **Project features** — `import { GoalService } from '@/features/goal/service'`
7. **Project utilities/lib** — `import { logger } from '@/lib/logger'`, `import { formatCurrency } from '@/lib/utils'`
8. **Relative imports** — `import { goalFormSchema } from './schema'`, `import type { GoalView } from '../type'`

### Real Example

```typescript
// ✅ CORRECT ORDER
import Link from 'next/link';

import { Calendar, Target } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { formatDateToYYYYMMDD } from '@/lib/utils/date';

import type { GoalView } from '../type';
```

### If Violated

Prettier will automatically reformat on `npm run format`. If you run `npm run format:check` and it fails, run `npm run format` to fix automatically.

---

## 7. File Naming (Kebab-Case)

All files use **lowercase kebab-case** with hyphens:

| File Type  | Pattern          | Example                                  |
| ---------- | ---------------- | ---------------------------------------- |
| Components | `{name}.tsx`     | ✅ `goal-card.tsx`, `scheme-card.tsx`    |
| Services   | `service.ts`     | ✅ `src/features/goal/service.ts`        |
| Actions    | `action.ts`      | ✅ `src/features/goal/action.ts`         |
| Types      | `type.ts`        | ✅ `src/features/goal/type.ts`           |
| Schemas    | `schema.ts`      | ✅ `src/features/goal/schema.ts`         |
| Tests      | `{name}.test.ts` | ✅ `utils.test.ts`, `date.test.ts`       |
| Utilities  | `{name}.ts`      | ✅ `format-currency.ts`, `parse-date.ts` |

### ❌ WRONG

- `GoalCard.tsx` (PascalCase)
- `goalCard.tsx` (camelCase)
- `goal_card.tsx` (snake_case)

---

## 8. Type Naming (PascalCase)

All type names use **PascalCase**:

```typescript
// ✅ CORRECT
export interface Goal {
  id: string;
  name: string;
}

export type GoalActionState = {
  errors?: Record<string, string[]>;
};

export interface SchemeCardProps {
  scheme: SchemeView;
}

// ❌ WRONG
export interface goal {}
export type goalView = {};
export interface schemeCardProps {}
```

---

## 9. Arrow Function Syntax

Arrow functions always require **parentheses around parameters**, even for single parameters:

### ❌ WRONG

```typescript
// Missing parentheses
const getValue = (x) => x * 2;
const mapGoals = (goals) => goals.map((g) => g.name);
```

### ✅ CORRECT

```typescript
// Parentheses required
const getValue = (x) => x * 2;
const mapGoals = (goals) => goals.map((g) => g.name);

// Multi-line arrow function
const processGoal = (goal: GoalView) => {
  const progress = calculateProgress(goal);
  return { ...goal, progress };
};
```

---

## 10. Trailing Commas (ES5 Style)

Use trailing commas in **objects and arrays**, but **NOT in function parameters**:

### ✅ CORRECT (Objects/Arrays)

```typescript
export type GoalActionState = {
  errors?: Record<string, string[]>;
  errorMessage?: string;
  success?: boolean;
};

const config = {
  name: 'test',
  value: 123,
};

const list = ['item1', 'item2', 'item3'];
```

### ✅ CORRECT (No Trailing Comma in Function Params)

```typescript
// No comma after last parameter
function createGoal(name: string, amount: number, date: Date) {}

// No comma in arrow function
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {};
```

### ❌ WRONG

```typescript
// Trailing comma in function parameters - forbidden
function createGoal(name: string, amount: number) {}
```

---

## 11. Quotes (Single in JS, Double in JSX)

### ✅ CORRECT

```typescript
// Single quotes in JavaScript
const name = 'John Doe';
const message = 'Hello, world!';

// Double quotes in JSX attributes
<Button className="px-4 py-2" disabled={false}>
  Click me
</Button>

// Single quotes can appear inside double quotes without escaping
<div title="It's working">Content</div>
```

### ❌ WRONG

```typescript
// Double quotes in JavaScript
const name = "John Doe";

// Single quotes in JSX attributes
<Button className='px-4 py-2'>Click</Button>
```

---

## 12. Semicolons Always Required

Every statement ends with a semicolon:

### ✅ CORRECT

```typescript
const name = 'John';
function greet() {}
export function handleClick() {}
```

### ❌ WRONG

```typescript
const name = 'John'; // Missing semicolon
function greet() {} // Missing semicolon
export function handleClick() {} // Missing semicolon
```

---

## 13. Print Width (100 Characters)

Lines should not exceed 100 characters. Prettier will auto-wrap long lines.

### ✅ CORRECT

```typescript
// Short enough
const longVariableName = formatCurrency(amount, locale);

// Wrapped if too long
const description =
  'This is a very long description that exceeds 100 characters ' +
  'so it gets wrapped to multiple lines';

// Function parameters wrapped
function createGoal(name: string, targetAmount: number, targetDate: Date, schemeIds: string[]) {}
```

---

## 14. Indentation (2 Spaces)

Always use **2 spaces**, never tabs:

```typescript
// ✅ CORRECT - 2 spaces
function MyComponent() {
  if (true) {
    return <div>Content</div>;
  }
}

// ❌ WRONG - Tabs or 4 spaces
function MyComponent() {
→ if (true) {
→ → return <div>Content</div>;
→ }
}
```

---

## 15. Server vs Client Components

### Server Components (Default)

```typescript
// No directive = Server Component ✅
export function GoalCard({ goal }: { goal: GoalView }) {
  return <Card>{goal.name}</Card>;
}
```

### Client Components

```typescript
// Must have 'use client' at the top ✅
'use client';

import { useState } from 'react';

export function GoalForm() {
  const [name, setName] = useState('');
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}
```

### When to Use `'use client'`

- ✅ Using React hooks (`useState`, `useEffect`, `useContext`)
- ✅ Using browser APIs (`window`, `localStorage`, `fetch` for suspense)
- ✅ Using event listeners (`onClick`, `onChange`)
- ❌ Don't use if it's a server-only function

---

## 16. Helper Components (Internal Functions)

Helper components that are not exported should be defined **before** the main exported component:

```typescript
// ✅ CORRECT ORDER

// 1. Helper component (not exported)
function FinancialDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return <div>{label}: {value}</div>;
}

// 2. Main exported component
export function SchemeCard({ scheme }: SchemeCardProps) {
  return (
    <div>
      <FinancialDetail label="NAV" value={scheme.nav} />
    </div>
  );
}
```

---

## 17. Component File Order

Within a component file, follow this order:

1. **Directives** — `'use client'`, `'use server'`
2. **Imports** — sorted by import order rules
3. **Type definitions** — `interface Props`, `type MyType`
4. **Helper components** — internal components (not exported)
5. **Main exported component** — the component you're exporting

```typescript
// ✅ CORRECT FILE STRUCTURE

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';

interface GoalCardProps {
  goal: GoalView;
}

// Helper
function GoalProgress({ percent }: { percent: number }) {
  return <div>{percent}%</div>;
}

// Main component
export function GoalCard({ goal }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card>
      <GoalProgress percent={50} />
    </Card>
  );
}
```

---

## CI/CD: Commands That Enforce Conventions

### Before Pushing

```bash
# Type check (fails on type errors)
npm run type-check

# Lint check (fails on ESLint violations)
npm run lint

# Format check (fails if formatting needed)
npm run format:check

# Run everything (type-check + lint + format:check + tests)
npm run check-all
```

### Auto-Fix

```bash
# Auto-fix linting issues
npm run lint:fix

# Auto-fix formatting issues
npm run format
```

### What Causes PR Failures

- ❌ Type errors (TypeScript)
- ❌ ESLint violations (no `any`, unused vars, console.log, etc.)
- ❌ Prettier formatting violations
- ❌ Test failures
- ❌ Failed type-check

---

## Quick Fixes

**If ESLint fails:**

```bash
npm run lint:fix
```

**If formatting fails:**

```bash
npm run format
```

**If type errors:**

```bash
npm run type-check
# Fix manually based on error messages
```

**Before final commit:**

```bash
npm run check-all
```

---

## Test File Exceptions

In `*.test.ts`, `*.spec.ts`, and `__mocks__/**` files, these rules are relaxed:

- ✅ `any` type is allowed
- ✅ `console.log` is allowed
- ✅ Unused variables allowed (no `_` prefix required)
- ✅ `import type` not required for type imports (can mix)

```typescript
// test file - exceptions apply
describe('GoalService', () => {
  it('calculates progress', () => {
    const mockGoal: any = {
      /* ... */
    };
    console.log('Testing:', mockGoal);
    const unused = 'variable';
    expect(true).toBe(true);
  });
});
```
