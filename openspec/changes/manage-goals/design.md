# Design: Manage Goals

## 1. Data Model

We will introduce a new sub-collection in Firestore to store user-specific goals.

### `Goal` Document

A `Goal` document will represent a single financial goal for a user.

- **Collection:** `users/{userId}/goals`
- **Document ID:** Auto-generated

**Schema:**

```typescript
interface Goal {
  id: string; // Document ID
  name: string; // e.g., "Retirement Fund"
  targetAmount: number; // Target monetary value
  targetDate: Date; // Target date to achieve the goal
  currentAmount: number; // Calculated field: sum of current value of assigned schemes
  schemeIds: string[]; // List of assigned scheme IDs
  projectedDate?: Date; // Calculated date to reach the goal based on XIRR
}
```

### Updates to `Scheme` Document

To associate a scheme with a goal, we will add a `goalId` to the `Scheme` document. A user's schemes are stored under `users/{userId}/schemes`.

**Updated Schema:**

```typescript
interface Scheme {
  // ... existing fields
  goalId?: string; // Optional reference to a Goal ID
}
```

## 2. Feature Structure

Following the project's architecture, all goal-related logic will be centralized in `src/features/goal/`:

- `src/features/goal/type.ts`: TypeScript interfaces for Goals.
- `src/features/goal/schema.ts`: Zod schemas for form validation.
- `src/features/goal/repository.ts`: Data access logic for Firestore.
- `src/features/goal/service.ts`: Business logic and calculation utilities.
- `src/features/goal/action.ts`: Next.js Server Actions for CRUD operations.
- `src/features/goal/components/`: Reusable UI components for goals.

## 3. API and Server Logic

- **Next.js Server Actions** will be used for all CRUD operations, located in `src/features/goal/action.ts`.
- Repository functions in `src/features/goal/repository.ts` will handle Firestore interactions.
- **Business Logic**: All calculations, projections (e.g., goal completion based on combined XIRR), and data transformations will be implemented directly in `src/features/goal/service.ts`.

## 4. User Interface

- **Navigation**: A new "Goals" item will be added to the sidebar (`src/features/side-bar/`).
- **Pages**:
  - `src/app/(dashboard)/goals/page.tsx`: List of all goals.
  - `src/app/(dashboard)/goals/create/page.tsx`: Form to create a new goal.
  - `src/app/(dashboard)/goals/[id]/page.tsx`: Goal details and progress tracking.
  - `src/app/(dashboard)/goals/[id]/edit/page.tsx`: Form to edit an existing goal.
- **Components**:
  - Goal cards for the list view.
  - Progress visualization (current vs. target).
  - Multi-select scheme picker for goal assignment.
