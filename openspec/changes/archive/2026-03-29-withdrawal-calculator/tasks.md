# Tasks: Withdrawal Calculator

- [x] **Phase 1: Service Layer Integration**
  - [x] Implement `simulateWithdrawal` in `src/features/tax-report/service.ts`.
  - [x] Add unit tests for `simulateWithdrawal` to ensure correct FIFO calculation for mock redemptions.

- [x] **Phase 2: UI Implementation**
  - [x] Create the `WithdrawalCalculatorModal` component in `src/features/schemes/components/withdrawal-calculator.tsx`.
    - [x] Include a scheme selector dropdown.
    - [x] Add dual-sync inputs for units and amount.
    - [x] Display estimated LTCG/STCG/Debt gains.
    - [x] Add basic validation (e.g., cannot withdraw more than current holdings).

- [x] **Phase 3: Integration & Polish**
  - [x] Add the "Withdrawal Calculator" button to the `SchemeList` toolbar in `src/features/schemes/components/scheme-list.tsx`.
  - [x] Ensure the modal is visually consistent with the rest of the application (using `shadcn/ui` components).
  - [x] Verify that simulations handle all scheme types (Equity, Debt, etc.) correctly.
