# Tasks: Manage Goals

1.  **Backend: Feature Structure**
    - [x] Initialize `src/features/goal/` directory.
    - [x] Define `Goal` interface in `src/features/goal/type.ts`.
    - [x] Define Zod schemas in `src/features/goal/schema.ts`.
    - [x] Implement repository functions in `src/features/goal/repository.ts`.
    - [x] Implement business logic in `src/features/goal/service.ts`.
    - [x] Implement Server Actions in `src/features/goal/action.ts`.

2.  **Backend: Scheme Integration**
    - [x] Update `src/features/schemes/type.ts` to include `goalId`.
    - [x] Implement logic in `src/features/goal/repository.ts` to update schemes when goal assignments change.

3.  **Frontend: Pages and Routing**
    - [x] Create dashboard pages in `src/app/(dashboard)/goals/`.
    - [x] Add "Goals" link to the sidebar in `src/features/side-bar/`.

4.  **Frontend: Components**
    - [x] Create goal list components in `src/features/goal/components/`.
    - [x] Implement goal form with multi-select scheme picker.
    - [x] Implement progress visualization.

5.  **Documentation**
    - [x] Update `DATA_MODEL.md` with the new `Goal` model.
