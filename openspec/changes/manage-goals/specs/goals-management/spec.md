## ADDED Requirements

### Requirement: Create a Goal

A user SHALL be able to create a new financial goal by providing a name, target amount, target date, and assigning one or more schemes. The system SHALL calculate and display the XIRR required to achieve this goal.

#### Scenario: Successful Goal Creation

- Given the user is on the "Goals" page and has existing investment schemes.
- When the user clicks "Add Goal".
- And fills in "Retirement Fund" for the name, "1000000" for the target amount, and a future date for the target date.
- And selects their "Quant Small Cap" and "Parag Parikh Flexi Cap" schemes from a list to assign to the goal.
- Then the system calculates and displays the required XIRR (e.g., "12.5%") needed to reach the target amount by the target date.
- And the user clicks "Save".
- Then a new goal named "Retirement Fund" appears in the goals list, associated with the selected schemes.

### Requirement: View Goals

A user SHALL be able to view a list of all their created goals.

#### Scenario: Viewing Existing Goals

- Given the user has two goals: "Retirement Fund" and "Dream Car".
- When the user navigates to the "Goals" page.
- Then both "Retirement Fund" and "Dream Car" are visible in the list.

### Requirement: Update a Goal

A user SHALL be able to edit the details of an existing goal, including adding or removing assigned schemes. When schemes are modified, the system SHALL recalculate and display the required XIRR to achieve the goal.

#### Scenario: Successful Goal Update

- Given the user has a goal named "Retirement Fund" with "Quant Small Cap" assigned.
- When the user edits the goal, changes the target amount to "1500000", and also adds "Parag Parikh Flexi Cap" scheme.
- Then the system recalculates and displays the new required XIRR (e.g., "10.0%").
- And clicks "Save".
- Then the "Retirement Fund" goal in the list shows a target amount of "1,500,000" and is associated with both "Quant Small Cap" and "Parag Parikh Flexi Cap" schemes.

#### Scenario: Removing Schemes from a Goal

- Given the user has a goal named "Dream Car" with "Parag Parikh Flexi Cap" assigned.
- When the user edits the goal and removes "Parag Parikh Flexi Cap" scheme.
- Then the system recalculates and displays the new required XIRR (e.g., "14.0%").
- And clicks "Save".
- Then the "Dream Car" goal in the list is no longer associated with "Parag Parikh Flexi Cap" scheme.

### Requirement: Delete a Goal

A user SHALL be able to delete a goal. This will also unlink any associated schemes.

#### Scenario: Successful Goal Deletion

- Given the user has a goal named "House Down Payment".
- When the user deletes the "House Down Payment" goal.
- Then the goal is removed from the list.
- And any schemes previously assigned to this goal no longer show this assignment.
