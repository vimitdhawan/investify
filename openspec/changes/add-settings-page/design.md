## Context

The application needs a way to display user information and portfolio metadata (like the statement period). This information is already fetched as part of the `Portfolio` object but isn't displayed.

## Decisions

- **Route**: Place the settings page under `/dashboard/settings`.
- **Feature Structure**: Group settings-related components in `src/features/settings`.
- **Data Fetching**: Use the existing `getPortfolio` repository function. Since `getPortfolio` is currently in the `portfolio` feature, the settings feature will depend on it.
- **UI**: Use standard `shadcn/ui` components (Card, Input, Label, etc.) for a consistent look.

## Alternatives Considered

- Adding this to the Dashboard: Dismissed to keep the dashboard focused on performance.
- Adding it to the User Profile (NavUser): The NavUser component is for navigation; a dedicated page is better for detailed information.

## Risks / Trade-offs

- None identified; it's a straightforward read-only view of existing data.
