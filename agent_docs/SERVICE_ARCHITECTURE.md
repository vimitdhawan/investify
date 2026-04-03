# Service Architecture

Service organization, communication patterns, and data layer design.

## Service Overview

Services contain **all business logic** and sit between the data layer (repositories) and presentation layer (pages/components).

Each feature has a `service.ts` file: `features/{feature}/service.ts`

### Feature Services

| Feature      | Service    | Lines | Responsibilities                                      |
| ------------ | ---------- | ----- | ----------------------------------------------------- |
| schemes      | service.ts | 185   | NAV fetching, scheme processing, view models          |
| transactions | service.ts | 223   | XIRR calculation, transaction aggregation, FIFO logic |
| portfolio    | service.ts | 75    | Portfolio summary, cross-scheme aggregation           |
| goal         | service.ts | 104   | Goal tracking, projections, required XIRR             |
| fund-houses  | service.ts | 69    | AMC-level aggregation, fund grouping                  |
| tax-report   | service.ts | 342   | Tax calculation, realized gains, capital gains logic  |

Additional services:

- **goal.utils.ts** - Helper calculations
- **transactions.repository.ts** - Pure aggregation functions (no Firestore)

## Service Responsibilities

### What Services Do

- **Business Logic** - Calculations, aggregations, transformations
- **Data Transformation** - Convert domain types → view models
- **External API Communication** - NAV fetching, external service calls
- **Service Orchestration** - Coordinate multiple services
- **Complex Queries** - Assemble data from multiple repositories

Example: `features/schemes/service.ts:45-83` (getSchemes with NAV processing)

### What Services DON'T Do

- **Direct Firestore Access** - Use repositories for that
- **Input Validation** - Handled by Server Actions
- **Cache Invalidation** - Handled by Server Actions
- **Authentication Checks** - Handled by Server Actions
- **View Concerns** - Keep presentation logic in components

## Service-to-Service Communication

Services can call other feature services for aggregation and orchestration. **Never call other feature's repositories directly.**

### Dependency Graph

```
portfolio/service
├── schemes/service
└── transactions/service

goal/service
└── schemes/service

fund-houses/service
├── schemes/service
└── transactions/service

schemes/service
└── transactions/service

tax-report/service
└── (pure functions, no service dependencies)
```

### Import Pattern

```typescript
import { getSchemes } from '@/features/schemes/service';
import { calculateXIRR } from '@/features/transactions/service';

export async function getLatestPortfolio(userId: string) {
  const schemes = await getSchemes(userId);
  const xirr = calculateXIRR(transactions, marketValue, date);
  // ...
}
```

See: `features/portfolio/service.ts:3-4`

### Avoiding Circular Dependencies

- Keep services focused on single feature
- If two services need same logic, extract to utility: `@/lib/utils/`
- Use types and data, not services, for cross-feature communication

## Data Layer (Repository Pattern)

### Repository Responsibilities

- **Firestore CRUD only** - Create, Read, Update, Delete
- **Use db.ts helpers** - `getSubCollection()`, `getNestedSubCollection()`, etc.
- **Return typed data** - Use feature types from `type.ts`
- **No business logic** - Just data access

### Repository Location

Each feature has: `features/{feature}/repository.ts`

Example:

```typescript
export async function getSchemes(userId: string): Promise<Scheme[]> {
  return getSubCollection<Scheme>('users', userId, 'schemes');
}
```

See: `features/schemes/repository.ts:6-8`

### db.ts Helper Functions

Located at: `src/lib/db.ts`

| Function                    | Purpose                            | Example               |
| --------------------------- | ---------------------------------- | --------------------- |
| `getDocument<T>`            | Fetch single document by ID        | User profile          |
| `getCollection<T>`          | Fetch all documents in collection  | All users (rare)      |
| `getSubCollection<T>`       | Fetch subcollection                | User's schemes        |
| `getNestedSubCollection<T>` | Fetch 3-level nested subcollection | Scheme's transactions |

All helpers **automatically convert Firestore Timestamps to JavaScript Date objects**.

### Complex Repositories

Some repositories contain data access logic beyond simple queries:

**Example:** `features/goal/repository.ts:14-31` (createGoal with batch operations)

```typescript
export async function createGoal(userId: string, goal: Omit<Goal, 'id'>): Promise<string> {
  const docRef = await firestore.collection('users').doc(userId).collection('goals').add(goal);

  // Update assigned schemes with goalId back-reference (batch operation)
  if (goal.schemeIds && goal.schemeIds.length > 0) {
    const batch = firestore.batch();
    goal.schemeIds.forEach((schemeId) => {
      batch.update(schemeRef, { goalId: docRef.id });
    });
    await batch.commit();
  }

  return docRef.id;
}
```

This maintains data consistency across documents.

## Server Actions

Server Actions handle mutations and validations. Located at: `features/{feature}/action.ts`

**Note:** For detailed Server Actions, validation, and form patterns, see [SERVICE_COMMUNICATION_PATTERNS.md](SERVICE_COMMUNICATION_PATTERNS.md).

### Action Responsibilities

1. **Authentication Check** - Verify user is logged in
2. **Input Validation** - Validate with Zod schema
3. **Call Service/Repository** - Execute business logic
4. **Cache Invalidation** - `revalidatePath()` to regenerate
5. **Navigation** - `redirect()` after success

### When to Call Service vs Repository

**Call Repository directly (simple CRUD):**

- Create: `createGoal(userId, goalData)`
- Read: `getGoal(userId, goalId)`
- Update: `updateGoal(userId, goalId, updates)`
- Delete: `deleteGoal(userId, goalId)`

**Call Service (complex reads):**

- Aggregations: `getLatestPortfolio(userId)`
- Calculations: `fetchGoals(userId)` (with projections)
- Multiple data sources: `getFundHouses(userId)`

## Layer Communication

### Data Flow for Read Operations

```
Server Component (page.tsx)
    ↓ fetches data
Service (business logic, view models)
    ↓ calls
Repository (Firestore CRUD)
    ↓ queries
@/lib/db.ts (helper functions)
    ↓ calls
Firestore
```

Example: `features/schemes/service.ts:18-21`

```typescript
export async function getSchemeViews(userId: string): Promise<SchemeView[]> {
  const schemes = await getSchemes(userId); // Call repository
  return schemes.map((scheme) => toSchemeView(scheme)); // Transform to view
}
```

### Data Flow for Write Operations

```
Form (Client Component)
    ↓ submits
Server Action (validation, auth)
    ↓ calls
Service OR Repository (business logic)
    ↓ mutates
Firestore
    ↓
revalidatePath() + redirect()
    ↓
Cache cleared, user navigated
```

Example: `features/goal/action.ts:35-45`

## External Services

Services communicate with external APIs for non-Firestore data.

### NAV Service (`@/lib/clients/mf.ts`)

Mutual Fund NAV data service:

```typescript
import { getHistoricalNavBySchemeId, getLatestNavBySchemeId } from '@/lib/clients/mf';

// Get latest NAV for a scheme
const nav = await getLatestNavBySchemeId(amfiCode);

// Get historical NAV by date
const navs = await getHistoricalNavBySchemeId(amfiCode);
```

Used by: `features/schemes/service.ts:68` (getLatestNavBySchemeId)

### Logger Service (`@/lib/logger`)

Structured logging:

```typescript
import { logger } from '@/lib/logger';

logger.debug({ cashFlows }, 'XIRR calculation details');
logger.warn({ error }, 'XIRR calculation failed');
```

## Best Practices

### 1. Single Responsibility

Each service handles one feature domain:

```typescript
// ✅ Good: schemes/service.ts handles all scheme logic
export async function getSchemes(userId: string): Promise<Scheme[]>;
export async function getSchemesByDate(userId: string, date: Date): Promise<Scheme[]>;

// ❌ Bad: Don't mix portfolio logic into schemes/service
// Keep portfolio aggregation in portfolio/service.ts
```

### 2. Services Call Services

Cross-feature logic through service calls, not repositories:

```typescript
// ✅ Good: portfolio/service calls schemes/service
// ❌ Bad: don't call another feature's repository directly
import { getSchemes as getSchemesFromRepo } from '@/features/schemes/repository';
import { getSchemes } from '@/features/schemes/service';
```

### 3. Pure Calculation Functions

Keep calculation logic testable with pure functions:

```typescript
// ✅ Good: pure function, no dependencies
export function calculateXIRR(transactions: Transaction[], marketValue: number): number | null {
  const cashFlows = buildCashFlows(transactions, marketValue);
  return xirr(cashFlows) * 100;
}

// ❌ Bad: async function with side effects
export async function calculateXIRR(schemeId: string): number {
  const scheme = await getScheme(schemeId); // Don't mix data fetching with calculation
}
```

### 4. View Models

Transform domain types to view models in services:

```typescript
// Domain type (from database)
interface Scheme {
  id: string;
  units: number;
  marketValue: number;
  // ... more fields
}

// View type (for UI)
interface SchemeView {
  id: string;
  units: number;
  marketValue: number;
  // ... same fields, UI-ready format
}

// Service transforms
export function toSchemeView(scheme: Scheme): SchemeView {
  return {
    ...scheme,
    // transform if needed
  };
}
```

See: `features/schemes/service.ts:126-151` (toSchemeView)

### 5. Error Handling

Throw errors with context in services:

```typescript
// ✅ Good: contextual error messages
export async function getSchemes(userId: string): Promise<Scheme[]> {
  const schemes = await getSchemesWithTransactions(userId);
  if (!schemes.length) {
    logger.debug({ userId }, 'No schemes found');
    return [];
  }
  return schemes;
}

// ❌ Bad: generic errors
if (!schemes) throw new Error('Failed');
```

## Related Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Overall project structure and data flow
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Firestore collections and relationships
- [CODE_CONVENTIONS.md](CODE_CONVENTIONS.md) - Code patterns and naming conventions
- [SERVICE_COMMUNICATION_PATTERNS.md](SERVICE_COMMUNICATION_PATTERNS.md) - Detailed communication patterns and examples
