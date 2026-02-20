import xirr from 'xirr';
import {
  Transaction,
  TransactionType,
  investmentTypes,
  withdrawTypes,
} from '@/features/transactions/type';

// Helper to parse YYYY-MM-DD date strings
function parseYYYYMMDDString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Helper to format Date object to YYYY-MM-DD string
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates the XIRR for a given set of transactions, current market value, and valuation date.
 * Returns the XIRR as a percentage (e.g., 10 for 10%). Returns 0 if XIRR cannot be calculated.
 */
export function calculateXIRRForTransactions(
  transactions: Transaction[],
  marketValue: number,
  valuationDate: Date
): number {
  const cashFlows: { amount: number; when: Date }[] = transactions
    .map((tx) => {
      if (investmentTypes.includes(tx.type)) {
        return {
          amount: -Math.abs(tx.amount), // Negative for investments
          when: parseYYYYMMDDString(tx.date),
        };
      } else if (withdrawTypes.includes(tx.type)) {
        return {
          amount: tx.amount, // Positive for withdrawals
          when: parseYYYYMMDDString(tx.date),
        };
      }
      return null;
    })
    .filter((cf): cf is { amount: number; when: Date } => cf !== null);

  // Add current market value as the final cash flow if there are any units
  if (marketValue > 0) {
    cashFlows.push({
      amount: marketValue,
      when: valuationDate,
    });
  }

  if (cashFlows.length < 2) {
    return 0; // Not enough data points for XIRR
  }

  try {
    // The xirr library requires at least one positive and one negative cash flow.
    const hasPositive = cashFlows.some((cf) => cf.amount > 0);
    const hasNegative = cashFlows.some((cf) => cf.amount < 0);

    if (!hasPositive || !hasNegative) {
      return 0;
    }

    const result = xirr(cashFlows);
    return result * 100; // Return as a percentage
  } catch (e) {
    // It's common for XIRR to fail to converge, especially with unusual cash flows.
    // console.error(`Could not calculate XIRR: ${e}`);
    return 0;
  }
}

/**
 * Projects the completion date for a goal based on current investment, target amount,
 * current date, and an assumed annual rate of return (XIRR).
 * Returns a Date object for the projected completion, or null if unachievable.
 */
export function projectCompletionDate(
  currentAmount: number,
  targetAmount: number,
  currentDate: Date,
  annualXIRR: number
): Date | null {
  if (currentAmount <= 0 || targetAmount <= currentAmount || annualXIRR <= 0) {
    // If current amount is zero or negative, target is already met or less than current, or XIRR is non-positive,
    // we cannot project a future date.
    return null;
  }

  // Convert annual XIRR to a decimal rate
  const rate = annualXIRR / 100;

  // Future Value (FV) = Present Value (PV) * (1 + Rate)^N
  // where N is the number of years.
  // We need to solve for N:
  // (1 + Rate)^N = FV / PV
  // N * log(1 + Rate) = log(FV / PV)
  // N = log(FV / PV) / log(1 + Rate)

  const yearsToTarget =
    Math.log(targetAmount / currentAmount) / Math.log(1 + rate);

  if (!isFinite(yearsToTarget) || yearsToTarget < 0) {
    return null; // Should not happen with above checks, but good for safety
  }

  const projectedDate = new Date(currentDate);
  projectedDate.setFullYear(
    currentDate.getFullYear() + Math.floor(yearsToTarget)
  );
  projectedDate.setMonth(
    currentDate.getMonth() +
      Math.round((yearsToTarget - Math.floor(yearsToTarget)) * 12)
  );

  return projectedDate;
}
