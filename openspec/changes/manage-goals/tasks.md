# Tasks: Manage Goals

1.  **Backend: Goal Data Model**
    *   [ ] Define and implement the `Goal` data model in Firestore.
    *   [ ] Create repository functions for CRUD operations on goals.

2.  **Backend: Scheme-Goal Association**
    *   [ ] Update the `Scheme` data model to include a `goalId` field.
    *   [ ] Implement logic to assign/unassign `goalId` to schemes when goals are created/updated/deleted.

3.  **Frontend: Goal Management UI**
    *   [ ] Create a new page for listing and managing goals.
    *   [ ] Implement a form for creating and editing a goal, including a multi-select dropdown for assigning schemes.
    *   [ ] Add functionality to delete a goal.

4.  **Testing**
    *   [ ] Write unit tests for the new repository functions.
    *   [ ] Write integration tests for the new UI components.

5.  **Documentation**
    *   [ ] Update `DATA_MODEL.md` with the new `Goal` model.
    *   [ ] Update `DATA_MODEL.md` with the updated `Scheme` model.
