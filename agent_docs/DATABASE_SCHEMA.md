# Database Schema

Firestore structure, collections, and data access patterns.

## Firestore Structure

### Collection Hierarchy

```
users (collection)
└── {userId} (document - Investor)
    ├── statements (subcollection)
    │   └── {statementId}
    │       └── period: { from, to }
    │
    ├── schemes (subcollection)
    │   └── {schemeId}
    │       ├── name, amfi, amc, isin, folioNumber
    │       ├── units, type, investedAmount, marketValue
    │       ├── goalId (optional back-reference)
    │       │
    │       └── transactions (nested subcollection)
    │           └── {transactionId}
    │               ├── date, type, nav, units, amount
    │               └── stampDuty, sttTax, capitalGainTax
    │
    └── goals (subcollection)
        └── {goalId}
            ├── name, targetAmount, targetDate
            └── schemeIds[] (references to schemes)
```

### Document ID Patterns

| Document    | ID Format                         | Example             |
| ----------- | --------------------------------- | ------------------- |
| User        | Firebase Auth UID                 | `user_abc123xyz`    |
| Scheme      | `{amc}-{isin}-{amfi}` (sanitized) | `sbi-inf123-ABC123` |
| Goal        | Firestore auto-generated          | `goal_doc_id`       |
| Transaction | Firestore auto-generated          | `txn_doc_id`        |
| Statement   | Firestore auto-generated          | `stmt_doc_id`       |

## Collections

### users

Root collection storing user/investor information.

**Fields:**

| Field   | Type   | Description        | Required |
| ------- | ------ | ------------------ | -------- |
| name    | string | Investor full name | Yes      |
| email   | string | Email address      | Yes      |
| mobile  | string | Mobile number      | Yes      |
| address | string | Address (from CAS) | Yes      |
| pan     | string | PAN card number    | Yes      |

**Type Definition:**
See: `features/portfolio/type.ts:16-22` (Investor interface)

**Repository:**
See: `features/portfolio/repository.ts:12` (getDocument)

---

### users/{userId}/statements

CAS (Consolidated Account Statement) records uploaded by user.

**Fields:**

| Field       | Type   | Description     | Example      |
| ----------- | ------ | --------------- | ------------ |
| period.from | string | Statement start | "2023-01-01" |
| period.to   | string | Statement end   | "2023-12-31" |

**Type Definition:**
See: `features/portfolio/type.ts:11-14` (Statement interface)

**Usage:**

- Stores reference information from uploaded CAS files
- Does not contain transaction details (those go in scheme.transactions)

---

### users/{userId}/schemes

Mutual fund schemes in user's portfolio. One document per scheme.

**Fields:**

| Field          | Type      | Description                           | Notes                      |
| -------------- | --------- | ------------------------------------- | -------------------------- |
| name           | string    | Scheme name                           | e.g., "SBI Blue Chip Fund" |
| amfi           | string    | AMFI registration number              | Unique identifier          |
| amc            | string    | Asset Management Company name         | e.g., "SBI AMC"            |
| isin           | string    | ISIN code                             | International standard     |
| folioNumber    | string    | Folio number from CAS                 | User-specific per AMC      |
| units          | number    | Current units held                    | Updated from transactions  |
| type           | enum      | Scheme type: EQUITY/DEBT/HYBRID/OTHER | SchemeType enum            |
| investedAmount | number    | Total amount invested                 | Sum of purchases           |
| marketValue    | number    | Current market value                  | units × NAV                |
| isClosed       | boolean   | Fully redeemed flag                   | true if units = 0          |
| latestNavDate  | Timestamp | Last NAV update date                  | Auto-converted to Date     |
| nav            | number    | Latest NAV                            | Updated from NAV service   |
| goalId         | string?   | Linked goal ID (optional)             | Back-reference to goals    |

**Type Definition:**
See: `features/schemes/type.ts:40-65` (Scheme interface)

**Enums:**

- `SchemeType`: EQUITY, DEBT, HYBRID, OTHER
- `SchemeNavStatus`: AVAILABLE, MISSING, STALE, Pending

**Repository:**
See: `features/schemes/repository.ts:6-8` (getSchemes)

**Relationships:**

- Each scheme can be linked to one goal via `goalId`
- Back-reference from goal's `schemeIds[]` array
- See: Bidirectional Goal ↔ Scheme Pattern below

---

### users/{userId}/schemes/{schemeId}/transactions

Transaction history for each scheme (nested subcollection). Includes purchases, redemptions, switches, dividends, taxes, etc.

**Fields:**

| Field          | Type      | Description                | Notes                               |
| -------------- | --------- | -------------------------- | ----------------------------------- |
| date           | Timestamp | Transaction date           | Auto-converted to Date              |
| schemeId       | string    | Parent scheme ID           | Foreign key reference               |
| description    | string    | Transaction description    | From CAS file                       |
| type           | enum      | Transaction type           | See TransactionType enum            |
| nav            | number    | NAV at transaction date    | Price per unit                      |
| units          | number    | Units transacted           | Positive for buy, negative for sell |
| amount         | number    | Transaction amount (₹)     | Absolute value                      |
| stampDuty      | number?   | Stamp duty paid            | Optional, tax-related               |
| sttTax         | number?   | STT (securities) tax       | Optional, tax-related               |
| capitalGainTax | number?   | Capital gains tax withheld | Optional, tax-related               |

**Type Definition:**
See: `features/transactions/type.ts:49-61` (Transaction interface)

**TransactionType Enum:**

- **Investments:** PURCHASE, PURCHASE_SIP, SWITCH_IN, SWITCH_IN_MERGER, DIVIDEND_REINVESTMENT
- **Withdrawals:** REDEMPTION, SWITCH_OUT, SWITCH_OUT_MERGER, DIVIDEND_PAYOUT
- **Other:** SEGREGATION, STAMP_DUTY_TAX, TDS_TAX, STT_TAX, MISC, REVERSAL

**Repository:**
See: `features/transactions/repository.ts:10` (getNestedSubCollection)

**Aggregation:**
Transactions are aggregated to compute:

- Current units held
- Average cost basis
- Realized gains/losses
- Tax paid

---

### users/{userId}/goals

Investment goals with target amounts and dates, linked to schemes.

**Fields:**

| Field        | Type      | Description       | Notes                       |
| ------------ | --------- | ----------------- | --------------------------- |
| name         | string    | Goal name         | e.g., "Retirement", "House" |
| targetAmount | number    | Target amount (₹) | Positive number             |
| targetDate   | Timestamp | Target date       | Auto-converted to Date      |
| schemeIds    | string[]  | Linked scheme IDs | Array of scheme IDs         |

**Type Definition:**
See: `features/goal/type.ts:1-7` (Goal interface)

**Relationships:**

- Each goal links to multiple schemes via `schemeIds[]` array
- Each scheme links back to at most one goal via `goalId` field
- See: Bidirectional Goal ↔ Scheme Pattern below

**Repository:**
See: `features/goal/repository.ts:6-8` (getGoals)

---

## Data Access Patterns

### Helper Functions (src/lib/db.ts)

| Function               | Signature                                                           | Usage                       | Example                                                                        |
| ---------------------- | ------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------ |
| getDocument            | `<T>(collection, docId)`                                            | Single document by ID       | Get user by userId                                                             |
| getCollection          | `<T>(collection)`                                                   | All documents in collection | Get all users (rare)                                                           |
| getSubCollection       | `<T>(collection, docId, subCollection)`                             | Subcollection docs          | `getSubCollection('users', userId, 'schemes')`                                 |
| getNestedSubCollection | `<T>(collection, docId, subCollection, subDocId, nestedCollection)` | 3-level nested docs         | `getNestedSubCollection('users', userId, 'schemes', schemeId, 'transactions')` |

### Timestamp Handling

Firestore Timestamps are **automatically converted to JavaScript Date objects** by the `convertTimestamps()` function in `src/lib/db.ts`.

This happens for all document data returned from the helper functions above.

### Batch Operations

Use `firestore.batch()` for atomic multi-document updates (all-or-nothing).

**Example:** When a user creates a goal, batch operation:

1. Creates goal document
2. Updates scheme documents with goalId back-reference

See: `features/goal/repository.ts:19-28` (createGoal with batch)

---

## Relationships

### Data Model

| Relationship          | Type | Implementation                 | Notes                            |
| --------------------- | ---- | ------------------------------ | -------------------------------- |
| User → Schemes        | 1:N  | Subcollection                  | One user has many schemes        |
| User → Goals          | 1:N  | Subcollection                  | One user has many goals          |
| User → Statements     | 1:N  | Subcollection                  | One user has many CAS records    |
| Scheme → Transactions | 1:N  | Nested subcollection           | One scheme has many transactions |
| Goal ↔ Scheme         | N:M  | Bidirectional array + back-ref | See pattern below                |

### Bidirectional Goal ↔ Scheme Pattern

Goals and schemes have a many-to-many relationship implemented with:

1. **Forward reference:** Goal's `schemeIds[]` array

   ```
   goals/{goalId}
   └── schemeIds: ["scheme1", "scheme2", "scheme3"]
   ```

2. **Back-reference:** Scheme's `goalId` field (single goal per scheme)
   ```
   schemes/{schemeId}
   └── goalId: "goal1"
   ```

**Why?**

- Forward ref allows querying schemes linked to a goal
- Back-ref allows querying goal for a scheme
- One scheme per goal (not multi-goal per scheme currently)

**Maintenance:**
When creating/updating/deleting goals, batch operations update both references.

See: `features/goal/repository.ts:14-104` (createGoal, updateGoal, deleteGoal)

---

## Data Validation

All data written to Firestore is validated using Zod schemas before mutation.

**Schema Location:** `features/{feature}/schema.ts`

**Example:** Goal validation
See: `features/goal/schema.ts` (goalFormSchema with z.object)

Validation happens in:

1. Server Actions (`features/{feature}/action.ts`)
2. Services before repository calls

---

## Related Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Data flow and how data moves through layers
- [CODE_CONVENTIONS.md](CODE_CONVENTIONS.md) - Type definition patterns and naming
- [SERVICE_ARCHITECTURE.md](SERVICE_ARCHITECTURE.md) - Service layer patterns above database
