# Testing Guide

Quality and correctness are critical for the Investify application. This document outlines our testing strategy and provides practical guidance on how to write effective tests.

## 1. Testing Philosophy

We employ a multi-layered testing strategy to ensure the application is reliable, correct, and bug-free.

-   **Unit Tests**: Form the foundation of our testing pyramid. They are fast, isolated, and verify the smallest parts of our application (e.g., a single React component or a utility function).
-   **Integration Tests**: Verify the interaction between several units. For example, testing a page that fetches data from the repository and displays it.
-   **End-to-End (E2E) Tests**: Simulate real user journeys through the entire application in a browser, verifying critical user flows from start to finish.

## 2. Tools

-   **[Jest](https://jestjs.io/)**: Our primary testing framework for running tests.
-   **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)**: For testing React components. It encourages writing tests that resemble how users interact with the application.
-   **[msw (Mock Service Worker)](https://mswjs.io/)**: For mocking API requests and Firebase interactions during testing.
-   **[Playwright](https://playwright.dev/)** (Future): For end-to-end tests.

## 3. Unit Tests

Unit tests should cover all critical business logic and UI components.

### Where to Place Tests

Test files should be co-located with the source files they are testing, using the `*.test.ts` or `*.test.tsx` naming convention.

```
/src
├── lib/
│   ├── utils.ts
│   └── utils.test.ts   <-- Test for utils.ts
└── components/
    └── ui/
        ├── button.tsx
        └── button.test.tsx <-- Test for button.tsx
```

### Writing a Component Test

When testing a component, focus on what the user sees and interacts with, not on implementation details.

-   Use `render` from React Testing Library to render your component.
-   Use queries like `getByRole`, `getByText`, `getByLabelText` to find elements.
-   Use `@testing-library/user-event` to simulate user interactions like clicking buttons or typing in inputs.

**Example: Testing a simple counter button**

```tsx
// src/components/counter.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './counter';

describe('Counter', () => {
  it('should render with initial count of 0', () => {
    render(<Counter />);
    // Check if the initial count is displayed
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });

  it('should increment the count when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<Counter />);

    const button = screen.getByRole('button', { name: /increment/i });
    await user.click(button);

    // Verify the count has updated in the document
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });
});
```

### Writing a Function Test

Testing pure functions (like those in `/lib/utils.ts` or repository helpers) is straightforward with Jest.

**Example: Testing a currency formatting utility**

```ts
// src/lib/utils.test.ts
import { formatCurrency } from './utils';

describe('formatCurrency', () => {
  it('should format a positive number correctly', () => {
    expect(formatCurrency(1234.56)).toBe('₹1,234.56');
  });

  it('should format zero correctly', () => {
    expect(formatCurrency(0)).toBe('₹0.00');
  });

  it('should handle negative numbers', () => {
    expect(formatCurrency(-500)).toBe('-₹500.00');
  });
});
```

## 4. How to Run Tests

To run all tests in the project, use the following command:

```bash
npm test
```

To run tests in watch mode, which automatically re-runs tests when you save a file, use:

```bash
npm test -- --watch
```

This is highly useful during development to get instant feedback on your changes.
