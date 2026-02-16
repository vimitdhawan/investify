# Design: Manage Goals

## 1. Data Model

We will introduce a new collection in Firestore to store user-specific goals.

### `Goal` Document

A `Goal` document will represent a single financial goal for a user.

*   **Collection:** `users/{userId}/goals`
*   **Document ID:** Auto-generated

**Schema:**

```typescript
interface Goal {
  id: string;        // Document ID
  name: string;      // e.g., "Retirement Fund"
  targetAmount: number; // Target monetary value
  targetDate: Date;    // Target date to achieve the goal
  currentAmount: number; // Calculated field: sum of current value of assigned schemes
  userId: string;      // Owning user
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

This approach establishes a clear relationship: a goal can encompass multiple schemes, while each scheme is linked to a single goal. This simplifies data management and querying.

## 2. API and Server Logic

*   Instead of traditional API endpoints, we will use **Next.js Server Actions** for all CRUD operations (Create, Read, Update, Delete) related to goals. This keeps data mutations co-located with the components that use them.
*   Server-side logic will be implemented in `lib/actions/goal.ts`.
*   We will refer to the existing `signup` implementation (`src/lib/actions/signup.ts`) for patterns on how to structure server actions, handle form state, and manage validation.
*   A new calculation service will be implemented to project goal completion. It will use the **XIRR (Extended Internal Rate of Return)** of the combined transactions from all schemes assigned to a goal.
*   **Calculation Rules:**
    *   Schemes with a negative XIRR (indicating a loss) will be **excluded** from the projection calculation.
    *   If all schemes assigned to a goal have a negative XIRR, the `projectedDate` will be considered "Not Applicable" (N/A), as the target is unreachable. This status will be clearly indicated in the UI.
    *   Based on the aggregated positive rate of return, the service will forecast how long it will take for the current investment to reach the `targetAmount`.

## 3. User Interface

*   A new **"Goals"** item will be added to the main sidebar navigation to provide users with easy access to the feature.
*   A new route ` /goals` will be added to the dashboard to list and manage goals. Adding or removing scheme assignments will be handled exclusively on this page.
*   The goal creation and editing forms will include a multi-select dropdown, allowing users to choose from their available schemes to assign to the goal.
*   The **/schemes/[id] page will not be modified.** All goal-related interactions will be centralized on the new ` /goals` page.
*   A new component will be created to display goal progress. It will visualize the `currentAmount` against the `targetAmount` and display the **projected time to completion** based on the XIRR calculation, or "N/A" if a projection is not possible.
