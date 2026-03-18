# settings-management Specification

## Purpose

TBD - created by archiving change add-settings-page. Update Purpose after archive.

## Requirements

### Requirement: Display Investor Profile

The system SHALL provide a settings page that displays the investor's profile information.

#### Scenario: View investor details

- **WHEN** user navigates to `/dashboard/settings`
- **THEN** the system displays the investor's Name, Email, Mobile, PAN, and Address.

### Requirement: Display Statement Period

The settings page SHALL display the date range of the transactions covered by the portfolio.

#### Scenario: View statement period

- **WHEN** user navigates to `/dashboard/settings`
- **THEN** the system shows the "From" and "To" dates from the portfolio metadata.

### Requirement: Access Settings from Sidebar

The application SHALL allow the user to navigate to the settings page from the sidebar.

#### Scenario: Navigate from NavUser

- **WHEN** user clicks the "Account" item in the `NavUser` component
- **THEN** the system redirects the user to `/dashboard/settings`.
