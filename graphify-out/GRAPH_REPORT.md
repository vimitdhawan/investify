# Graph Report - src/ (2026-04-08)

## Corpus Check

- Corpus is ~28,348 words - fits in a single context window. You may not need a graph.

## Summary

- 325 nodes · 468 edges · 40 communities detected
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.51)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)

1. `getSchemes()` - 6 edges
2. `useFormField()` - 4 edges
3. `saveToCache()` - 4 edges
4. `resolveAmfiCode()` - 3 edges
5. `calculateXIRR()` - 3 edges
6. `getGoal()` - 3 edges
7. `processGoal()` - 3 edges
8. `decrypt()` - 3 edges
9. `SchemeCard` - 3 edges
10. `getSchemes()` - 2 edges

## Surprising Connections (you probably didn't know these)

- `SchemeCard` --calls--> `WithdrawalCalculatorModal` [EXTRACTED]
  src/components/schemes/scheme-card.tsx → src/components/schemes/withdrawal-calculator.tsx
- `SchemeList` --calls--> `SchemeCard` [EXTRACTED]
  src/components/schemes/scheme-list.tsx → src/components/schemes/scheme-card.tsx

## Hyperedges (group relationships)

- **Goal Creation Workflow** — goal-form.tsx, Scheme, Goal [EXTRACTED 0.90]
- **Scheme Display Pipeline** — scheme-list.tsx, scheme-card.tsx, withdrawal-calculator.tsx [EXTRACTED 0.90]
- **Portfolio Dashboard** — portfolio-overview-card.tsx, portfolio-chart.tsx, PortfolioSummary [EXTRACTED 0.90]

## Communities

### Community 0 - "UI Components (Card)"

Cohesion: 0.06
Nodes (2): getCurrentFiscalYear(), getFiscalYear()

### Community 1 - "Chart & Calendar UI"

Cohesion: 0.08
Nodes (0):

### Community 2 - "Dropdown & Menu"

Cohesion: 0.07
Nodes (2): SidebarMenuButton(), useSidebar()

### Community 3 - "Form Inputs"

Cohesion: 0.1
Nodes (17): buildCashFlows(), calculateProjectedDate(), calculateRealizedGainsDetailed(), calculateXIRR(), fetchSchemeNAVByDate(), getActiveSchemes(), getGoalView(), getSchemes() (+9 more)

### Community 4 - "Button & Badge UI"

Cohesion: 0.09
Nodes (0):

### Community 5 - "Table Components"

Cohesion: 0.13
Nodes (0):

### Community 6 - "Modal & Dialog"

Cohesion: 0.13
Nodes (7): convertTimestamps(), getDocument(), deleteGoal(), getGoal(), getSchemes(), getSchemesWithTransactions(), updateGoal()

### Community 7 - "Sidebar Navigation"

Cohesion: 0.12
Nodes (0):

### Community 8 - "Data Grid"

Cohesion: 0.2
Nodes (4): FormControl(), FormDescription(), FormMessage(), useFormField()

### Community 9 - "Input Fields"

Cohesion: 0.16
Nodes (5): createSession(), decrypt(), encrypt(), getSessionUserId(), updateSession()

### Community 10 - "Dropdown Menu UI"

Cohesion: 0.14
Nodes (0):

### Community 11 - "Fiscal Year Select"

Cohesion: 0.18
Nodes (0):

### Community 12 - "Config & NAV API"

Cohesion: 0.31
Nodes (4): getAmficCodeByIsin(), getHistoricalNavBySchemeId(), getLatestNavBySchemeId(), saveToCache()

### Community 13 - "Goal & Scheme Domain"

Cohesion: 0.5
Nodes (4): Goal, Scheme, GoalForm, LoginForm

### Community 14 - "Scheme Display"

Cohesion: 0.67
Nodes (4): SchemeView, SchemeCard, SchemeList, WithdrawalCalculatorModal

### Community 15 - "Test Utilities"

Cohesion: 0.67
Nodes (0):

### Community 16 - "Portfolio Analytics"

Cohesion: 0.67
Nodes (3): PortfolioSummary, PortfolioChart, PortfolioOverviewCard

### Community 17 - "Database & Session"

Cohesion: 0.67
Nodes (0):

### Community 18 - "Hooks & State"

Cohesion: 1.0
Nodes (0):

### Community 19 - "Layout Components"

Cohesion: 1.0
Nodes (0):

### Community 20 - "Page Routes"

Cohesion: 1.0
Nodes (1): test-utils

### Community 21 - "Authentication"

Cohesion: 1.0
Nodes (1): xirr type declaration

### Community 22 - "Investor Profile"

Cohesion: 1.0
Nodes (1): RootLayout

### Community 23 - "Fund Houses"

Cohesion: 1.0
Nodes (1): NotFound

### Community 24 - "Date Utilities"

Cohesion: 1.0
Nodes (1): PublicLayout

### Community 25 - "Format Utils"

Cohesion: 1.0
Nodes (1): Home

### Community 26 - "Type Definitions"

Cohesion: 1.0
Nodes (1): SignupPage

### Community 27 - "Export Features"

Cohesion: 1.0
Nodes (1): LoginPage

### Community 28 - "Settings Pages"

Cohesion: 1.0
Nodes (1): DashboardLayout

### Community 29 - "Dashboard"

Cohesion: 1.0
Nodes (1): SchemesPage

### Community 30 - "Landing Pages"

Cohesion: 1.0
Nodes (1): SchemeTransactionsPage

### Community 31 - "Goal Management"

Cohesion: 1.0
Nodes (1): GoalsPage

### Community 32 - "Transaction History"

Cohesion: 1.0
Nodes (1): GoalDetailsPage

### Community 33 - "Holdings Display"

Cohesion: 1.0
Nodes (1): EditGoalPage

### Community 34 - "Scheme Search"

Cohesion: 1.0
Nodes (1): CreateGoalPage

### Community 35 - "Portfolio Display"

Cohesion: 1.0
Nodes (1): FundHousesPage

### Community 36 - "Currency Formatting"

Cohesion: 1.0
Nodes (1): DashboardPage

### Community 37 - "Notification System"

Cohesion: 1.0
Nodes (1): SignupForm

### Community 38 - "Miscellaneous UI"

Cohesion: 1.0
Nodes (1): GoalFormData

### Community 39 - "Error Handling"

Cohesion: 1.0
Nodes (0):

## Knowledge Gaps

- **5 isolated node(s):** `WithdrawalCalculatorModal`, `PortfolioOverviewCard`, `PortfolioChart`, `LoginForm`, `SignupForm`
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Hooks & State`** (1 nodes): `xirr.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Layout Components`** (1 nodes): `service.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Page Routes`** (1 nodes): `test-utils`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Authentication`** (1 nodes): `xirr type declaration`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Investor Profile`** (1 nodes): `RootLayout`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Fund Houses`** (1 nodes): `NotFound`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Date Utilities`** (1 nodes): `PublicLayout`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Format Utils`** (1 nodes): `Home`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Type Definitions`** (1 nodes): `SignupPage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Export Features`** (1 nodes): `LoginPage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Settings Pages`** (1 nodes): `DashboardLayout`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard`** (1 nodes): `SchemesPage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Landing Pages`** (1 nodes): `SchemeTransactionsPage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Goal Management`** (1 nodes): `GoalsPage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Transaction History`** (1 nodes): `GoalDetailsPage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Holdings Display`** (1 nodes): `EditGoalPage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Scheme Search`** (1 nodes): `CreateGoalPage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Portfolio Display`** (1 nodes): `FundHousesPage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Currency Formatting`** (1 nodes): `DashboardPage`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Notification System`** (1 nodes): `SignupForm`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Miscellaneous UI`** (1 nodes): `GoalFormData`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Error Handling`** (1 nodes): `utils.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Are the 5 inferred relationships involving `getSchemes()` (e.g. with `getSchemeViews()` and `processSchemeWithAggregateTransactions()`) actually correct?**
  _`getSchemes()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `useFormField()` (e.g. with `FormControl()` and `FormDescription()`) actually correct?**
  _`useFormField()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `saveToCache()` (e.g. with `getLatestNavBySchemeId()` and `getHistoricalNavBySchemeId()`) actually correct?**
  _`saveToCache()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `resolveAmfiCode()` (e.g. with `fetchSchemeNAVByDate()` and `getSchemes()`) actually correct?**
  _`resolveAmfiCode()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `calculateXIRR()` (e.g. with `buildCashFlows()` and `isValidForXirr()`) actually correct?**
  _`calculateXIRR()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `WithdrawalCalculatorModal`, `PortfolioOverviewCard`, `PortfolioChart` to the rest of the system?**
  _5 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Components (Card)` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
