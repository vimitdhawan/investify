# Change: Add Portfolio Analysis with Holdings Integration

## Why

Users need comprehensive insights into their portfolio's underlying holdings, sector exposure, and potential overlaps across multiple schemes. Currently, the app lacks visibility into what stocks they actually own and how their schemes compare. Integrating ingested holdings data from Moneycontrol with user portfolios enables advanced analytics like:

- Identifying their top stock and sector exposures
- Understanding concentration risk through portfolio overlap analysis
- Making informed diversification decisions

This transforms the app from a basic portfolio tracker into an intelligent portfolio advisor.

## What Changes

- New page `src/app/(dashboard)/analysis/page.tsx` for portfolio analysis
- New feature module `src/features/portfolio-analysis/` with:
  - `service.ts` - Core data aggregation and calculation logic
  - `type.ts` - TypeScript types for analysis
  - `components/` - D3.js visualization components (bar charts, heatmap matrix)
- D3.js dependency added to `package.json`
- Visx library integration for React-first D3 components
- New capability: `portfolio-analysis` (spec details in `specs/portfolio-analysis/`)

## Impact

- **User-facing**: New `/analysis` page with holdings deep-dive, risk analysis, and overlap detection
- **Affected specs**: New `portfolio-analysis` capability
- **Affected code**:
  - New files: `src/app/(dashboard)/analysis/page.tsx`, `src/features/portfolio-analysis/*`
  - Modified: `package.json` (add dependencies)
- **Database**: Reads from existing `holdings/{ISIN}` collection and user `schemes/{schemeId}`
- **Performance**: Real-time aggregation on page load (no caching initially)
