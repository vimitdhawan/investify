# Code Conventions

Code style, naming conventions, and patterns for Investify.

## Code Quality Tools

ESLint 9 and Prettier 3 enforce code quality automatically. Configuration files:

- `.prettierrc.json` - Prettier config
- `eslint.config.mjs` - ESLint rules

### Commands

```bash
npm run lint              # Check for ESLint violations
npm run lint:fix          # Auto-fix ESLint violations
npm run format            # Format code with Prettier
npm run format:check      # Check if formatting is needed
npm run type-check        # Run TypeScript compiler
npm run pre-commit        # Run type-check + lint + format:check
npm run check-all         # Full validation before committing
```

### ESLint Rules (eslint.config.mjs)

**TypeScript:**

- No `any` type (warns) - use `unknown` with type guards
- Type imports required (`import type { X }`)
- Unused variables must prefix with `_` (e.g., `const [_unused, setValue] = useState()`)

**React:**

- React hooks exhaustive-deps validated
- No `target="_blank"` without `rel="noopener noreferrer"`
- Props passed as objects (no PropTypes)

**General:**

- Prefer `const` over `let` or `var`
- No duplicate imports
- Strict equality (`===`) except `null` comparisons
- No console.log (use warn/error/info or logger)

**Tests:** Exception rules for `*.test.ts`, `*.spec.ts`, `__mocks__/**`

- `any` type allowed
- console.log allowed
- Unused variables allowed

### Prettier Config (.prettierrc.json)

- **Print width:** 100 characters
- **Indentation:** 2 spaces (no tabs)
- **Quotes:** Single quotes (JS), double quotes (JSX attributes)
- **Trailing commas:** ES5 style (objects/arrays only, not function params)
- **Semicolons:** Always required
- **Arrow functions:** Always use parentheses `(param) => {}`

## File Naming Conventions

All files use **kebab-case** (lowercase with hyphens). Pattern examples:

| File Type      | Pattern          | Location                         | Example                       |
| -------------- | ---------------- | -------------------------------- | ----------------------------- |
| Components     | `{name}.tsx`     | `features/{feature}/components/` | `goal-card.tsx`               |
| Services       | `service.ts`     | `features/{feature}/`            | `features/goal/service.ts`    |
| Repositories   | `repository.ts`  | `features/{feature}/`            | `features/goal/repository.ts` |
| Server Actions | `action.ts`      | `features/{feature}/`            | `features/goal/action.ts`     |
| Types          | `type.ts`        | `features/{feature}/`            | `features/goal/type.ts`       |
| Schemas        | `schema.ts`      | `features/{feature}/`            | `features/goal/schema.ts`     |
| Tests          | `{name}.test.ts` | Next to source                   | `service.test.ts`             |
| Utilities      | `{name}.ts`      | `src/lib/utils/`                 | `date.ts`                     |

## Component Patterns

### Props Typing

Choose based on complexity:

**Option 1: Inline type (for simple, single prop)**

```typescript
export function GoalCard({ goal }: { goal: GoalView }) {
  return <Card>...</Card>;
}
```

See: `features/goal/components/goal-card.tsx:19`

**Option 2: Interface (for multiple props)**

```typescript
interface SchemeCardProps {
  scheme: SchemeView;
  previousDayChangePercentage: number;
}

export function SchemeCard({ scheme, previousDayChangePercentage }: SchemeCardProps) {
  return <Card>...</Card>;
}
```

See: `features/schemes/components/scheme-card.tsx:20-49`

**Option 3: Extending HTML elements (shadcn/ui pattern)**

```typescript
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('base-styles', className)} {...props} />;
}
```

See: `src/components/ui/card.tsx:5`

### Component Structure

Follow this order in files:

1. **Imports** (auto-sorted by Prettier)
2. **Type/Interface definitions** (if multiple props)
3. **Helper/Private components** (not exported)
4. **Main component** (exported)
5. **Named export** (always use named exports, never default)

Example with helper component:
See: `features/schemes/components/scheme-card.tsx:25-47` (FinancialDetail helper)

### Server Components (Default)

All components are Server Components by default:

```typescript
// No directive needed - this is a Server Component
export function GoalList({ userId }: { userId: string }) {
  // Can use await, access database directly
  const goals = await getGoals(userId);
  return <div>...</div>;
}
```

### Client Components

Add `'use client'` directive **at the very top** of the file:

```typescript
'use client';

import { useState } from 'react';

export function GoalForm() {
  const [name, setName] = useState('');
  return <form>...</form>;
}
```

Use client components only when needed:

- Forms and input handling
- State management (useState, useContext)
- Event listeners
- Browser APIs (window, localStorage)

## Import Patterns

Prettier automatically sorts imports in this order:

1. `react`
2. `next`
3. `@radix-ui`
4. `@tanstack`
5. `@tabler/icons-react`
6. `lucide-react`
7. `firebase`
8. `@/components`
9. `@/features`
10. `@/lib`
11. `@/utils`
12. `@/hooks`
13. `@/types`
14. `@/` (other project imports)
15. Relative imports (`./`, `../`)

### Type Imports

Always use `type` keyword for type-only imports:

```typescript
import { useState } from 'react';

// Components and functions - no type keyword
import { Card } from '@/components/ui/card';

import type { GoalView } from '../type';
```

## Zod Validation Patterns

### Schema Location

- **Feature-specific:** `features/{feature}/schema.ts`
- **Shared across features:** `src/types/` (if used in multiple features)

### Pattern with Type Inference

```typescript
import { z } from 'zod';

export const goalFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  targetAmount: z.coerce.number().positive('Must be positive'),
  targetDate: z.coerce.date(),
  schemeIds: z.array(z.string()),
});

// Automatically infer TypeScript type from schema
export type GoalFormData = z.infer<typeof goalFormSchema>;
```

See: `features/goal/schema.ts`

### In Server Actions

```typescript
'use server';

export async function handleCreateGoal(
  _prev: GoalActionState,
  formData: FormData
): Promise<GoalActionState> {
  const validationResult = goalFormSchema.safeParse({
    name: formData.get('name'),
    targetAmount: formData.get('targetAmount'),
    targetDate: formData.get('targetDate'),
    schemeIds: formData.getAll('schemeIds'),
  });

  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  // Use validationResult.data - it's type-safe now
  return { success: true };
}
```

See: `features/goal/action.ts:27-32`

## Type Safety

### No `any` Type

Never use `any`. Use `unknown` with type guards:

```typescript
// ❌ Wrong
function process(data: any) {
  return data.value;
}

// ✅ Correct
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value;
  }
  throw new Error('Invalid data');
}
```

### Unused Variables

Prefix intentionally unused variables with `_`:

```typescript
const [_unused, setValue] = useState();
const [_data, setData] = useState();

// In function parameters
function handler(_event: Event, value: string) {
  return value;
}
```

### Type Definitions Location

- **Feature types:** `features/{feature}/type.ts`
- **Shared types:** `src/types/`
- **Component-specific:** Inline in component file if not reused

### Type Naming

Use **PascalCase** for all types, interfaces, enums:

```typescript
// ✅ Correct
export type GoalView = {};
export interface SchemeCardProps {}
export enum SchemeNavStatus {}

// ❌ Wrong
export type goalView = {};
export interface schemeCardProps {}
```

## Console & Logging

### Allowed Console Methods

```typescript
console.warn('Warning message'); // ✅ Allowed
console.error('Error message'); // ✅ Allowed
console.info('Info message'); // ✅ Allowed
```

### Forbidden

```typescript
console.log('Debug message'); // ❌ Forbidden in production code
```

### Preferred: Structured Logging

Use the logger from `@/lib/logger`:

```typescript
import { logger } from '@/lib/logger';

logger.error({ error, goalId }, 'Failed to create goal');
logger.info({ userId, action: 'login' }, 'User logged in');
```

## CI/CD Integration

All code conventions are automatically enforced in the CI pipeline:

1. **TypeScript Type Check** (~15-30s)

   ```bash
   npm run type-check
   ```

2. **ESLint Code Quality** (~10-20s)

   ```bash
   npm run lint
   ```

3. **Prettier Format Check** (~5-10s)
   ```bash
   npm run format:check
   ```

### Before Pushing Code

Run locally to catch issues early:

```bash
npm run check-all
```

This runs: type-check + lint + format:check + test coverage

## Comments & Documentation

### Self-Documenting Code

Code should be clear without comments. Avoid obvious comments:

```typescript
// ❌ Obvious comment - don't do this
const count = 0; // Initialize count to 0

// ✅ Better - self-documenting code
const initialRetryCount = 0;
```

### Explain "Why" Not "What"

```typescript
// ❌ Explains what, not why
// Get the user ID
const userId = getUserId();

// ✅ Explains why this is needed
// User ID is required before we can fetch their portfolio data
const userId = getUserId();
```

### TODO Comments with Context

```typescript
// TODO: Replace with native API once browser support improves (issue #123)
const data = workaroundFunction();

// TODO: Optimize this query after we add database indexing (issue #456)
const schemes = await getAllSchemes(userId);
```

## Related Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Project structure and data flow
- [SERVICE_ARCHITECTURE.md](SERVICE_ARCHITECTURE.md) - Service patterns and communication
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Firestore structure
