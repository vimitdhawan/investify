# Running Tests

Unit testing strategy, test organization, and how to verify code quality.

## Testing Strategy

### Unit Tests Only

Investify currently focuses on **unit tests** using:

- **Jest 29** - Test runner and assertion library
- **ts-jest** - TypeScript support for Jest
- **Testing Library** - React component testing utilities
- **jsdom** - Browser environment simulation

### What to Test

Write unit tests for:

- **Utility functions** - formatCurrency, date parsing, string manipulation
- **Service layer** - Business logic, calculations, data transformation
- **Custom hooks** - React hooks behavior and side effects
- **Pure functions** - Any function with deterministic input/output

See: `src/lib/utils.test.ts:3-41` (utility function tests)

### What NOT to Test (Currently Excluded)

Coverage excludes:

- **App router pages** - `src/app/**/*` (Next.js routes)
- **Type definitions** - `src/**/*.d.ts`
- **Type files** - `src/types/**/*`
- **Storybook stories** - `src/**/*.stories.{ts,tsx}`

These can be tested later as integration/E2E tests.

## Test Configuration

### Jest Configuration (jest.config.js)

Key settings:

| Setting            | Value                 | Purpose                    |
| ------------------ | --------------------- | -------------------------- |
| Preset             | ts-jest               | TypeScript support         |
| Environment        | jsdom                 | Browser-like environment   |
| Coverage Dir       | coverage              | Generated reports location |
| Module Mapper      | @/ → src/             | Path alias resolution      |
| Test Match         | \*\*/\*.test.{ts,tsx} | Find test files            |
| Clear Mocks        | true                  | Isolation between tests    |
| Coverage Threshold | 0                     | No minimum thresholds yet  |

See: `jest.config.js`

### Global Setup (jest.setup.js)

Pre-configured mocks in `jest.setup.js`:

1. **Next.js Navigation**
   - `useRouter()` - Mocked with push, replace, refresh, etc.
   - `usePathname()` - Returns '/'
   - `useSearchParams()` - Returns empty URLSearchParams
   - `useParams()` - Returns empty object

2. **Next.js Image**
   - `next/image` - Mocked to pass through props as-is

3. **Browser APIs**
   - `window.matchMedia()` - Media query mock
   - `IntersectionObserver` - Visibility detection mock

4. **Console Filters**
   - Suppresses ReactDOM.render warnings

See: `jest.setup.js`

### Module Name Mapping

Path aliases resolved in jest.config.js:

```
@/components → src/components
@/features → src/features
@/lib → src/lib
@/utils → src/utils
etc.
```

## Test Commands

### Basic Commands

| Command                 | Purpose            | Output                        |
| ----------------------- | ------------------ | ----------------------------- |
| `npm test`              | Run all tests once | Summary + results             |
| `npm run test:watch`    | Watch mode (TDD)   | Re-run on file change         |
| `npm run test:coverage` | Coverage report    | HTML report in coverage/      |
| `npm run test:ci`       | CI mode            | Coverage + coverage artifacts |
| `npm run test:debug`    | Debug mode         | Attach Node inspector         |

### Running Specific Tests

**Single test file:**

```bash
npm test -- src/lib/utils.test.ts
```

**Pattern matching (test name):**

```bash
npm test -- --testNamePattern="formatCurrency"
```

**Pattern matching (file path):**

```bash
npm test -- --testPathPattern="lib/utils"
```

**Verbose output:**

```bash
npm test -- --verbose
```

## Test Organization

### File Location Pattern

Tests go in the same directory as source files with `.test.ts` suffix:

```
src/lib/utils.ts
└── src/lib/utils.test.ts

src/lib/utils/date.ts
└── src/lib/utils/date.test.ts

src/features/portfolio/service.ts
└── src/features/portfolio/service.test.ts
```

Colocating tests with source:

- Easy to find tests for a file
- Easy to update both together
- Tests ship with feature code

### Naming Convention

- Test files: `{name}.test.ts` or `{name}.spec.ts`
- Match source file name exactly (except suffix)

## Writing Unit Tests

### Test Structure

```typescript
describe('ModuleName', () => {
  describe('functionName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = myFunction(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

**Structure:**

1. `describe()` - Group related tests by module/function
2. `it()` - Individual test case
3. Arrange-Act-Assert pattern

### Example: Utility Function Test

See: `src/lib/utils.test.ts`

```typescript
describe('formatCurrency', () => {
  it('should format number as Indian currency', () => {
    expect(formatCurrency(1000)).toBe('₹1,000.00');
  });

  it('should handle large numbers with Indian numbering', () => {
    expect(formatCurrency(100000)).toBe('₹1,00,000.00');
  });

  it('should handle null', () => {
    expect(formatCurrency(null)).toBe('');
  });
});
```

See: `src/lib/utils/date.test.ts` (date utility tests)

### Mocking Patterns

#### Mock Firebase (For Service Tests)

Always mock Firebase before importing service:

```typescript
jest.mock('@/lib/firebase', () => ({
  firestore: jest.fn(),
  auth: jest.fn(),
  bucket: jest.fn(),
}));

jest.mock('./repository');
jest.mock('@/features/schemes/service');

describe('Portfolio Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Your tests here
});
```

See: `src/features/portfolio/service.test.ts:1-15`

#### Manual Module Mocks

For files (images, CSS), manually create mock:

```typescript
// __mocks__/fileMock.js
module.exports = 'test-file-stub';
```

Reference in jest.config.js:

```
'\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js'
```

See: `__mocks__/fileMock.js`

#### Use Existing Mocks

Next.js mocks already configured in `jest.setup.js`, no need to mock again:

```typescript
import { useRouter } from 'next/navigation';

describe('Component using useRouter', () => {
  it('should use mocked router', () => {
    const router = useRouter();
    expect(router.push).toBeDefined();
  });
});
```

## Test Coverage

### Generate Coverage Report

```bash
npm run test:coverage
```

Creates HTML report in `coverage/lcov-report/`

### View in Browser

1. Run: `npm run test:coverage`
2. Open: `coverage/lcov-report/index.html` in browser
3. Click files to see line-by-line coverage

### Coverage Metrics

Report shows:

- **Lines**: Percentage of code lines executed
- **Statements**: Percentage of statements executed
- **Functions**: Percentage of functions called
- **Branches**: Percentage of conditional branches tested

### Current Thresholds

No minimum thresholds currently set (all 0):

```javascript
coverageThreshold: {
  global: {
    branches: 0,
    functions: 0,
    lines: 0,
    statements: 0,
  },
}
```

Can be increased as coverage improves.

## Debugging Tests

### Chrome DevTools Debugging

```bash
npm run test:debug
```

Then:

1. Open: `chrome://inspect`
2. Click "Inspect" next to Node process
3. Set breakpoints
4. Step through test code

### Verbose Mode

See detailed output:

```bash
npm test -- --verbose
```

### Common Jest Matchers

```typescript
expect(value).toBe(exact); // Exact match
expect(value).toEqual(object); // Deep equality
expect(value).toBeTruthy(); // Truthy check
expect(value).toBeFalsy(); // Falsy check
expect(value).toBeNull(); // null check
expect(value).toContain(item); // Array/string contains
expect(value).toMatch(/regex/); // Regex match
expect(fn).toHaveBeenCalled(); // Function called
expect(fn).toHaveBeenCalledWith(arg); // Called with args
```

### Debugging Async Tests

```typescript
it('should handle async operations', async () => {
  const result = await myAsyncFunction();
  expect(result).toBe('expected');
});
```

Jest automatically waits for promises.

## Common Issues and Solutions

### Issue 1: Module not found error

**Error:** `Cannot find module '@/lib/utils'`

**Solution:** Check `jest.config.js` `moduleNameMapper` for correct path mapping

```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',  // @ should map to src/
}
```

### Issue 2: Firebase errors in tests

**Error:** `Error: firebase is not defined`

**Solution:** Mock Firebase at top of test file BEFORE importing service

```typescript
// NOW import the service
import { someService } from './service';

// Put this BEFORE any imports from services
jest.mock('@/lib/firebase', () => ({
  firestore: jest.fn(),
  auth: jest.fn(),
  bucket: jest.fn(),
}));
```

### Issue 3: Next.js hook errors

**Error:** `Error: useRouter must be used in a client component`

**Solution:** Jest setup already mocks Next.js hooks. No action needed.

The mocks in `jest.setup.js` handle useRouter, usePathname, etc.

### Issue 4: Tests hanging/timing out

**Solution:** Increase timeout for long tests

```typescript
jest.setTimeout(10000); // 10 seconds instead of default 5

it('should complete slow operation', async () => {
  // test code
});
```

### Issue 5: Flaky tests (intermittent failures)

**Common causes:**

- Async code not properly awaited
- Mock data not reset between tests
- Timing-dependent assertions

**Solution:**

- Use `beforeEach()` to reset state
- Properly await async functions
- Avoid time-dependent tests

```typescript
describe('MyTest', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks between tests
  });

  it('should handle async', async () => {
    const result = await myFunction(); // Await is important
    expect(result).toBe('expected');
  });
});
```

## Best Practices

1. **One assertion per test** - Test one behavior per test case
2. **Descriptive names** - `it('should format amount as ₹1,000.00 for 1000')`
3. **DRY test code** - Use `beforeEach()` for setup
4. **Mock dependencies** - Don't call real Firebase/APIs
5. **Test edge cases** - null, empty, large numbers, etc.
6. **Keep tests fast** - Unit tests should run in milliseconds

## Related Documentation

- [CODE_CONVENTIONS.md](CODE_CONVENTIONS.md) - Test code style and patterns
- [BUILDING_THE_PROJECT.md](BUILDING_THE_PROJECT.md) - CI testing and npm test:ci
- [ARCHITECTURE.md](ARCHITECTURE.md) - Testing within architecture context
