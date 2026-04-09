---
name: investify-testing
description: Investify unit testing patterns with Jest, ts-jest, Testing Library, and Firebase mocks. Use whenever writing .test.ts or .test.tsx files, adding test coverage to services/components/actions/repositories, or asked to write unit tests. This is THE reference for test structure in this project.
user-invocable: false
---

# Investify Testing Skill

Write unit tests that follow Investify conventions for all layers: UI components, service functions, repository queries, and pure utilities.

## Quick Reference

| Layer                  | File Pattern                            | Key Libraries                                      | Firebase Mock?             |
| ---------------------- | --------------------------------------- | -------------------------------------------------- | -------------------------- |
| **UI Components**      | `component.test.tsx`                    | `@testing-library/react`, `user-event`, `jest-dom` | No                         |
| **Service Functions**  | `service.test.ts`                       | Jest, `jest.mock('./repository')`                  | No (repo mock prevents it) |
| **Repository Queries** | `repository.test.ts`                    | Jest, `jest.mock('@/lib/db')`                      | **Yes**                    |
| **Pure Functions**     | `utils.test.ts`, `calculations.test.ts` | Jest only, no mocks                                | No                         |

---

## File Colocation

Tests **must** live next to source files with no `__tests__/` directories:

```
src/features/goal/
  goal.ts              # ❌ not here
  __tests__/goal.test.ts
```

**Correct:**

```
src/features/goal/
  service.ts
  service.test.ts      # ✅ next to source
  utils.ts
  utils.test.ts        # ✅ next to source
```

---

## What to Test vs What NOT to Test

### ✅ Test These

- Service layer functions (business logic that calculates, filters, transforms data)
- Utility/helper functions (pure functions, date formatting, currency formatting)
- Custom React hooks
- Repository query logic (how data is fetched from Firestore)
- Component rendering and user interactions

### ❌ Skip These

- `type.ts` files — these are type definitions, not testable logic
- `schema.ts` files — Zod schemas are framework code, not business logic
- `src/app/**` pages — too high-level, fragile to test directly; test underlying services instead
- `action.ts` Server Actions — complex to test due to FormData/auth; focus on testing the services they call instead

### Clear Examples

```ts
// ❌ Don't test the action directly
export async function createGoal(formData: FormData) { ... }

// ✅ Test the service the action calls
export async function saveGoal(data: GoalInput, userId: string) { ... }
```

---

## Layer 1: UI Component Tests

**File:** `component.test.tsx`

Use `@testing-library/react`, `user-event`, and `jest-dom` matchers.

### Basic Rendering

```tsx
import { render, screen } from '@testing-library/react';

import { GoalCard } from './goal-card';

describe('GoalCard', () => {
  it('displays goal name and target amount', () => {
    render(<GoalCard name="Retirement" targetAmount={1000000} />);

    expect(screen.getByText('Retirement')).toBeInTheDocument();
    expect(screen.getByText('₹10,00,000')).toBeInTheDocument();
  });
});
```

### User Interactions

Always use `userEvent.setup()` for realistic user interactions:

```tsx
import userEvent from '@testing-library/user-event';

describe('GoalCard', () => {
  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();

    render(<GoalCard name="Retirement" onDelete={onDelete} />);
    await user.click(screen.getByRole('button', { name: /delete/i }));

    expect(onDelete).toHaveBeenCalledOnce();
  });
});
```

### Query Priority

Use in this order for finding elements:

1. `getByRole()` — most resilient, semantically correct (button, link, dialog, etc.)
2. `getByText()` — when role queries don't work
3. `getByTestId()` — last resort, use only when the above two don't work

### Async Content

Use `findBy*` (async) when content appears after an operation:

```tsx
it('displays goal after loading', async () => {
  render(<GoalForm />);
  // findBy polls until found or timeout
  expect(await screen.findByText('Retirement')).toBeInTheDocument();
});
```

### Mocking Next.js Features

Pre-mocked globally in `jest.setup.js`:

- `useRouter`, `usePathname`, `useSearchParams`, `useParams` from `next/navigation`
- `next/image` module
- `window.matchMedia`

**Example:**

```tsx
// useRouter is already mocked, so this works:
const router = useRouter();
expect(router.push).toHaveBeenCalledWith('/dashboard');
```

---

## Layer 2: Service Layer Tests

**File:** `service.test.ts`

Mock the repository so Firebase is never imported. This is the key insight: when you mock `./repository`, the service can't import firebase transitively.

### Basic Pattern

```ts
// suppress log output
// 2. Get typed mocks
import * as repo from './repository';
// 3. Import the service to test
import { calculateGoalProgress } from './service';

// 1. Mock BEFORE any imports of the service
jest.mock('./repository');
jest.mock('@/features/schemes/service'); // if this service calls other services
jest.mock('@/lib/logger');

const mockGetGoals = jest.mocked(repo.getGoals);

describe('calculateGoalProgress', () => {
  // 4. Clear mocks between tests
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 0 when no goals exist', async () => {
    mockGetGoals.mockResolvedValue([]);

    const result = await calculateGoalProgress('user-123', 'goal-456');

    expect(result).toBe(0);
  });

  it('calculates progress from goal transactions', async () => {
    mockGetGoals.mockResolvedValue([{ id: 'g1', name: 'Retirement', targetAmount: 1000000 }]);
    // ... set up more mocks, call function, assert
  });
});
```

### Mocking Async Repository Functions

```ts
// Repository function returns a Promise
mockGetGoals.mockResolvedValue([...data]);

// Service can now call it
const goals = await getGoals('user-id');
```

### Mocking Other Services

When your service calls another feature's service:

```ts
import * as schemesService from '@/features/schemes/service';

jest.mock('@/features/schemes/service');

const mockGetSchemeDetails = jest.mocked(schemesService.getSchemeDetails);

mockGetSchemeDetails.mockResolvedValue({ name: 'ICICI Value Fund' });
```

### Accessing Mock Call Arguments

Verify that mocked functions were called correctly:

```ts
it('passes correct userId to repository', async () => {
  mockGetGoals.mockResolvedValue([]);

  await calculateGoalProgress('user-123', 'goal-456');

  expect(mockGetGoals).toHaveBeenCalledWith('user-123');
});
```

---

## Layer 3: Repository Layer Tests

**File:** `repository.test.ts`

Mock **both** `@/lib/firebase` **and** `@/lib/db`. Firebase mock **must come first** because `db.ts` imports firebase internally.

### Firebase Mock First

```ts
import * as db from '@/lib/db';

import { getUserGoals } from './repository';

// ⚠️ CRITICAL: Firebase mock MUST be first — db.ts imports it
jest.mock('@/lib/firebase', () => ({
  firestore: jest.fn(),
  auth: jest.fn(),
  bucket: jest.fn(),
}));

// Then mock db
jest.mock('@/lib/db');

const mockGetDocs = jest.mocked(db.getDocs);

describe('getUserGoals', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches goals from Firestore for a user', async () => {
    const mockGoals = [
      { id: 'g1', name: 'Retirement', targetAmount: 1000000 },
      { id: 'g2', name: 'Vacation', targetAmount: 200000 },
    ];
    mockGetDocs.mockResolvedValue(mockGoals as any);

    const result = await getUserGoals('user-123');

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Retirement');
  });

  it('calls db.getDocs with correct collection and filter', async () => {
    mockGetDocs.mockResolvedValue([]);

    await getUserGoals('user-123');

    expect(mockGetDocs).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'goals',
        userId: 'user-123',
      })
    );
  });
});
```

### Using jest-mock-extended for Firestore Types

For more complex Firestore mocks, use `jest-mock-extended`:

```ts
import { mock } from 'jest-mock-extended';

import type { DocumentReference } from 'firebase/firestore';

const mockDocRef = mock<DocumentReference>();
mockDocRef.id = 'goal-123';
```

---

## Layer 4: Pure Function Tests (Highest ROI)

**File:** `calculations.test.ts` or in `service.test.ts`

No mocks needed. These are pure functions with clear inputs and outputs.

### Simple Arithmetic

```ts
import { calculateXIRR } from './service';

describe('calculateXIRR', () => {
  it('calculates XIRR for simple cash flows', () => {
    const cashFlows = [
      { date: new Date('2024-01-01'), amount: -10000 },
      { date: new Date('2024-06-01'), amount: -5000 },
      { date: new Date('2024-12-31'), amount: 16000 },
    ];

    const result = calculateXIRR(cashFlows);

    expect(result).toBeCloseTo(0.15, 2); // 15% ± 0.01
  });
});
```

### Array Transformations

```ts
import { aggregateTransactions } from './service';

describe('aggregateTransactions', () => {
  it('groups transactions by scheme', () => {
    const transactions = [
      { schemeId: 'sch1', amount: 1000, date: new Date() },
      { schemeId: 'sch1', amount: 500, date: new Date() },
      { schemeId: 'sch2', amount: 2000, date: new Date() },
    ];

    const result = aggregateTransactions(transactions);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ schemeId: 'sch1', totalAmount: 1500 });
  });
});
```

### ⚠️ Note on Typos

The function `exludeReverseTransactions` has an intentional typo in its name. **Do not rename it** — the typo is in production code and tests must match:

```ts
import { exludeReverseTransactions } from './service';

// ✅ Use the misspelled name as-is

describe('exludeReverseTransactions', () => {
  it('removes reverse transactions', () => {
    // ...
  });
});
```

---

## High-Value Test Targets

These functions have zero test coverage and are pure/easily testable. **Prioritize these:**

| File                                   | Functions                                                             | Why                                 |
| -------------------------------------- | --------------------------------------------------------------------- | ----------------------------------- |
| `src/features/transactions/service.ts` | `calculateXIRR`, `aggregateTransactions`, `exludeReverseTransactions` | Core portfolio math; pure functions |
| `src/features/goal/utils.ts`           | `calculateRequiredXIRR`                                               | Goal calculation; pure function     |
| `src/lib/utils.ts`                     | ✅ Already tested                                                     | —                                   |
| `src/lib/utils/date.ts`                | ✅ Already tested                                                     | —                                   |

---

## Complete Example: Service Test with Pure Functions

Here's a realistic complete test file that combines repository mocking and pure function testing:

```ts
import * as repo from './repository';
import {
  aggregateTransactions,
  calculateXIRR,
  exludeReverseTransactions,
  getPortfolioPerformance,
} from './service';

// src/features/transactions/service.test.ts

jest.mock('./repository');
jest.mock('@/lib/logger');

const mockGetTransactions = jest.mocked(repo.getTransactions);
const mockGetSchemeInfo = jest.mocked(repo.getSchemeInfo);

describe('Transaction Service', () => {
  beforeEach(() => jest.clearAllMocks());

  // ===== Pure Function Tests =====
  describe('calculateXIRR', () => {
    it('returns 0 for single cash flow', () => {
      const result = calculateXIRR([{ date: new Date('2024-01-01'), amount: -10000 }]);
      expect(result).toBe(0);
    });

    it('calculates positive XIRR for gain', () => {
      const result = calculateXIRR([
        { date: new Date('2024-01-01'), amount: -10000 },
        { date: new Date('2024-12-31'), amount: 11000 },
      ]);
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('aggregateTransactions', () => {
    it('groups by scheme and sums amounts', () => {
      const transactions = [
        { schemeId: 's1', amount: 1000 },
        { schemeId: 's1', amount: 500 },
        { schemeId: 's2', amount: 2000 },
      ];

      const result = aggregateTransactions(transactions);

      expect(result).toEqual({
        s1: 1500,
        s2: 2000,
      });
    });
  });

  // ===== Service Function Tests =====
  describe('getPortfolioPerformance', () => {
    it('calculates performance from transactions', async () => {
      mockGetTransactions.mockResolvedValue([
        { schemeId: 's1', amount: -10000, date: new Date('2024-01-01') },
        { schemeId: 's1', amount: 11000, date: new Date('2024-12-31') },
      ]);

      const result = await getPortfolioPerformance('user-123');

      expect(result.xirr).toBeGreaterThan(0);
      expect(mockGetTransactions).toHaveBeenCalledWith('user-123');
    });

    it('handles empty transaction list', async () => {
      mockGetTransactions.mockResolvedValue([]);

      const result = await getPortfolioPerformance('user-123');

      expect(result.xirr).toBe(0);
    });
  });
});
```

---

## Key Conventions

### beforeEach + jest.clearAllMocks()

Every `describe` block must have this:

```ts
describe('MyFunction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  // ... tests
});
```

This prevents test contamination — mocks from one test affecting another.

### Arrange-Act-Assert Pattern

Structure every test as:

1. **Arrange** — set up data and mocks
2. **Act** — call the function
3. **Assert** — verify the result

```ts
it('description', async () => {
  // Arrange
  mockGetGoals.mockResolvedValue([...])

  // Act
  const result = await calculateProgress('user-1', 'goal-1')

  // Assert
  expect(result).toBe(0.5)
})
```

### Use of `toBeDefined()` vs `toEqual()`

- `toBeDefined()` — value is not `undefined` (use for optional returns)
- `toEqual()` — deep equality (use for objects/arrays)
- `toHaveBeenCalledWith()` — verify function was called with these args

```ts
expect(result).toBeDefined(); // ok
expect(result).toEqual({ id: '123' }); // specific value
expect(mock).toHaveBeenCalledWith('arg-1'); // function call
```

---

## Commands

```bash
# Run all tests
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Run single test file
npx jest src/features/goal/service.test.ts

# Run tests matching pattern
npx jest --testNamePattern="calculateXIRR"

# Full CI check before pushing
npm run check-all
```

---

## Testing Checklist Before Committing

- [ ] All test files use correct mock order (firebase before db, before service import)
- [ ] Mock library imports are mocked BEFORE service import
- [ ] `beforeEach(() => jest.clearAllMocks())` present in each `describe` block
- [ ] No `console.log` in service files being tested (ok in `.test.ts`)
- [ ] Service tests mock own `repository`, not firebase
- [ ] Repository tests mock both firebase AND db
- [ ] Pure function tests have no mocks
- [ ] Component tests use `userEvent.setup()` for interactions
- [ ] Run `npm run check-all` passes
- [ ] `npm test` passes locally before pushing

---

## Troubleshooting

### "Cannot find module '@/lib/firebase'"

**Cause:** Firebase mock not defined or import order wrong.

**Fix:** Put firebase mock FIRST:

```ts
jest.mock('@/lib/firebase', () => ({
  firestore: jest.fn(),
  auth: jest.fn(),
  bucket: jest.fn(),
}))
jest.mock('@/lib/db')
import { ... } // imports come AFTER
```

### Mock not being used

**Cause:** Import the actual module instead of using the mock.

**Wrong:**

```ts
import { getGoals } from './repository';
// ❌ this imports the real thing

// Correct:
import * as repo from './repository';

jest.mock('./repository');

const mockGetGoals = jest.mocked(repo.getGoals);
```

### Test passes in isolation but fails when run with others

**Cause:** Mocks not being cleared between tests.

**Fix:** Add `beforeEach(() => jest.clearAllMocks())` to your describe block.

### Component test: "useRouter is not a function"

**Cause:** Next.js router mock not initialized.

**Fix:** It's already global in `jest.setup.js` — just use it:

```ts
import { useRouter } from 'next/navigation';

const router = useRouter();
```
