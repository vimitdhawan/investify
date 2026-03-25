# Design: Realized Gains Grouping Architecture

## Context

The current tax report system calculates realized gains at the unit level using FIFO logic, which produces accurate but overly detailed results. For a user with frequent transactions, the tax report table can contain hundreds of rows, making it difficult to review and analyze.

This change introduces a grouping layer in the service to consolidate unit-level gains into meaningful aggregated entries before passing data to the UI layer.

## Goals / Non-Goals

**Goals:**

- Aggregate unit-level realized gains into grouped entries for better readability
- Centralize grouping logic in the service layer
- Use the same grouped data for both table display and summary calculations
- Maintain accuracy of tax calculations and categorization

**Non-Goals:**

- Changing the underlying FIFO calculation logic
- Modifying how gains are categorized (LTCG/STCG/Debt)
- Adding new tax rules or rebate calculations
- Providing drill-down to unit-level details (future enhancement)

## Decisions

### Decision 1: Grouping Key Composition

**What:** Group realized gains by the composite key: `${schemeName}-${folioNumber}-${saleDateYYYYMMDD}-${taxType}`

**Why:**

- **Scheme Name**: Different schemes should never be combined
- **Folio Number**: Same scheme in different folios represents different holdings
- **Sale Date**: Each sale date represents a distinct transaction event
- **Tax Type**: LTCG, STCG, and Debt have different tax treatment and must be separated

**Alternatives Considered:**

- Grouping only by scheme name - Rejected: Would mix different folios and tax types
- Including purchase date in key - Rejected: A single sale can match multiple purchase dates via FIFO; grouping by sale characteristics is more intuitive

### Decision 2: Service Layer Placement

**What:** Implement grouping logic in the tax report service immediately after FIFO calculation

**Why:**

- Service layer is responsible for business logic and data transformation
- Components should receive presentation-ready data
- Enables reuse of grouped data for both UI and summary calculations
- Separates concerns: service handles calculation, component handles display

**Implementation Pattern:**

```typescript
function calculateTaxReport(transactions, fiscalYear) {
  // 1. Calculate unit-level realized gains using FIFO
  const unitLevelGains = calculateFIFOGains(transactions, fiscalYear);

  // 2. Group gains by scheme/folio/date/taxType
  const groupedGains = groupRealizedGains(unitLevelGains);

  // 3. Calculate summary from grouped data
  const summary = calculateSummary(groupedGains);

  return { groupedGains, summary };
}
```

### Decision 3: Data Structure - RealizedGainLoss Interface

**What:** Define a new `RealizedGainLoss` type with aggregated amounts:

```typescript
interface RealizedGainLoss {
  schemeName: string;
  folioNumber: string;
  saleDate: Date;
  buyAmount: number; // Sum of (purchasePrice × units)
  sellAmount: number; // Sum of (salePrice × units)
  gainLoss: number; // Sum of individual gains/losses
  taxPaid: number; // Sum of tax paid
  isLTCG: boolean;
  isSTCG: boolean;
  isDebt: boolean;
}
```

**Why:**

- Clear separation from unit-level data structures
- All necessary fields for display and summary calculation
- Aggregated monetary amounts (buyAmount, sellAmount) provide context
- Tax type flags enable filtering for summary calculations

**Alternatives Considered:**

- Reusing unit-level interface with optional fields - Rejected: Creates confusion and type safety issues
- Adding a count of units - Rejected: Aggregated units across different purchase prices are not meaningful

### Decision 4: Aggregation Algorithm

**What:** Use Map-based aggregation with composite string key

```typescript
function groupRealizedGains(gains: UnitLevelGain[]): RealizedGainLoss[] {
  const groupedMap = new Map<string, RealizedGainLoss>();

  gains.forEach((gain) => {
    const saleDateStr = formatDateToYYYYMMDD(gain.saleDate);
    const taxType = gain.isLTCG ? 'LTCG' : gain.isSTCG ? 'STCG' : 'Debt';
    const key = `${gain.schemeName.trim()}-${gain.folioNumber}-${saleDateStr}-${taxType}`;

    const buyAmount = gain.purchasePrice * gain.units;
    const sellAmount = gain.salePrice * gain.units;

    if (groupedMap.has(key)) {
      const existing = groupedMap.get(key)!;
      existing.buyAmount += buyAmount;
      existing.sellAmount += sellAmount;
      existing.gainLoss += gain.gainLoss;
      existing.taxPaid += gain.taxPaid;
    } else {
      groupedMap.set(key, {
        schemeName: gain.schemeName,
        folioNumber: gain.folioNumber,
        saleDate: gain.saleDate,
        buyAmount,
        sellAmount,
        gainLoss: gain.gainLoss,
        taxPaid: gain.taxPaid,
        isLTCG: gain.isLTCG,
        isSTCG: gain.isSTCG,
        isDebt: gain.isDebt,
      });
    }
  });

  return Array.from(groupedMap.values());
}
```

**Why:**

- Map provides O(1) lookup for grouping
- String key is simple and deterministic
- Trimming scheme name handles whitespace variations
- Date formatting (YYYY-MM-DD) ensures consistent key generation

## Risks / Trade-offs

### Risk: Loss of Unit-Level Detail

**Impact:** Users cannot see individual unit transactions that contributed to a grouped entry

**Mitigation:**

- Current phase focuses on grouped view for usability
- Future enhancement: Add drill-down or expandable rows if users need unit-level details
- Grouped view is the primary use case for tax filing

### Risk: Numerical Precision

**Impact:** Floating point addition may introduce small rounding errors

**Mitigation:**

- Use proper decimal handling for currency (consider using libraries like decimal.js if needed)
- All monetary calculations should round to 2 decimal places for display
- Tax calculations are already approximate (actual filing may differ)

### Trade-off: Memory vs Performance

**Decision:** Calculate grouped data in-memory rather than storing separately

**Rationale:**

- Tax reports are generated on-demand, not stored
- Dataset size is manageable (typically < 1000 unit-level transactions per year)
- Simpler architecture without additional storage layer

## Migration Plan

### Phase 1: Implementation

1. Create `RealizedGainLoss` type definition
2. Implement `groupRealizedGains` function in service layer
3. Update service to return grouped data
4. Modify `RealizedGainsTable` component to use new data type
5. Update summary calculation to use grouped data

### Phase 2: Testing

1. Test with existing tax report data
2. Verify grouped totals match unit-level totals
3. Validate summary calculations unchanged
4. Test edge cases (single transaction, no transactions, multiple groups)

### Phase 3: Deployment

1. Deploy changes
2. Monitor for calculation discrepancies
3. Verify user experience improvement

### Rollback Plan

If issues are found:

1. Revert component changes to use unit-level data
2. Service can temporarily return ungrouped data
3. No database changes required (read-only feature)

## Open Questions

None - requirements are clear and implementation is straightforward.
