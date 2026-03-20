/**
 * Calculates the XIRR required to reach the target amount by the target date.
 */
export function calculateRequiredXIRR(
  currentAmount: number,
  targetAmount: number,
  targetDate: Date
): number {
  if (currentAmount <= 0) return Infinity;
  if (currentAmount >= targetAmount) return 0;

  const now = new Date();
  const years = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  if (years <= 0) return Infinity;

  // targetAmount = currentAmount * (1 + r)^years
  // r = (targetAmount / currentAmount)^(1/years) - 1
  const r = Math.pow(targetAmount / currentAmount, 1 / years) - 1;
  return r * 100;
}
