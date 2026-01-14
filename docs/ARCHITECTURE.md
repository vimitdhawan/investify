# Architecture Guide

This document outlines the architectural principles and patterns for the Investify application, building upon the foundation of Next.js with the App Router.

## 1. Core Philosophy: Server-First

As stated in `GEMINI.md`, we follow a **Server-First** approach.

- **Server Components are the default.** Most components should be Server Components, responsible for data fetching, layout, and composition.
- **Client Components are the exception.** Only use them when client-side interactivity is essential (e.g., state, event handlers, browser-only APIs). Keep them small and push them to the "leaves" of the component tree whenever possible.

## 2. Directory Structure & Organization

We follow a feature-based organization within the `src` directory.

- **`/app`**: Contains all routes, layouts, and pages, organized by URL segments.
  - **`/(dashboard)`**: A route group for all authenticated pages.
  - **`/(public)`**: A route group for public pages like login and signup.
  - **`/api`**: For traditional API endpoints. Prefer Server Actions for mutations unless a specific REST endpoint is required for external services.
- **`/components`**: Home for shared UI components.
  - **`/components/ui`**: Base components from `shadcn/ui`. Do not modify these directly.
  - **`/components/feature`**: Create sub-folders for components tied to a specific feature (e.g., `/components/dashboard`, `/components/schemes`).
- **`/lib`**: Core application logic, decoupled from the UI.
  - **`/lib/actions`**: Server Actions for data mutations (e.g., login, form submissions).
  - **`/lib/repository`**: The data access layer. All communication with Firebase (Firestore, Storage) must go through this layer.
  - **`/lib/schema`**: Zod schemas for validating all data, from API inputs to form submissions.
  - **`/lib/types`**: Shared TypeScript types and interfaces.
- **`/hooks`**: Custom React hooks (client-side logic).

## 3. Data Flow

Data fetching and mutations are handled differently based on the context.

### Data Fetching (Queries)

- **Server Components**: Fetch data directly within the component using functions from the `/lib/repository` layer. This is the preferred method for fetching data required to render a page.
- **Client Components**:
  1.  **Props Drilling**: The parent Server Component should fetch the data and pass it down as props. This is the simplest and most common pattern.
  2.  **Route Handlers + SWR/React Query**: For dynamic data that needs to be re-fetched on the client (e.g., polling, frequent updates), create a Route Handler in `/app/api` and use a client-side data fetching library like SWR or React Query. Avoid this unless necessary to minimize client-side JS.

### Data Mutations (Writes)

- **Server Actions are the preferred method** for all form submissions and data modifications.
  - They run on the server, are secure, and can be called directly from Client or Server Components.
  - Use `revalidatePath` or `revalidateTag` within a Server Action to update the UI after a mutation.
  - All Server Actions must use Zod schemas from `/lib/schema` to validate their inputs.

## 4. State Management

- **Local State**: For simple, component-specific state (e.g., toggles, input values), use React's `useState` or `useReducer` in a Client Component.
- **URL State**: For state that should be bookmarkable and shared via URL (e.g., filters, sorting, tabs), use URL query parameters. The Next.js `useRouter` and `useSearchParams` hooks are ideal for this.
- **Global State**: Avoid complex global state management libraries (like Redux or Zustand) unless absolutely necessary. The combination of Server Components, URL state, and component composition should handle most use cases. If global state is needed (e.g., for cross-cutting concerns like a notification system), use React Context for simple cases or Zustand for more complex scenarios.

## 5. Authentication

- **Session Management**: User session and authentication status are managed via Firebase Auth.
- **Route Protection**: Middleware (`/middleware.ts`) should be used to protect routes in the `(dashboard)` group, redirecting unauthenticated users to the login page.
- **Accessing User Data**:
  - In Server Components, use a helper function that leverages the Firebase Admin SDK to get the current user.
  - In Client Components, use a custom hook that wraps the Firebase Auth SDK's `onAuthStateChanged` listener.
