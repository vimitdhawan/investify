# Change: Add Settings Page

## Why

Users need a central place to view their personal details (investor profile) and the statement period covered by their current portfolio import. This information is currently available in the data model but not exposed in the UI.

## What Changes

- New Settings page at `/dashboard/settings`.
- Display of Investor profile: Name, Email, Mobile, PAN, and Address.
- Display of Portfolio Statement Period (start and end dates).
- Update sidebar navigation to link "Account" to the new Settings page.

## Impact

- Affected specs: `settings-management` (new)
- Affected code:
  - `src/features/side-bar/components/nav-user.tsx`: Link "Account" to settings.
  - `src/app/(dashboard)/settings/page.tsx`: New route.
  - `src/features/settings/components/settings-view.tsx`: New component.
