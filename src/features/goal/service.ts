import { getSchemes } from '@/features/schemes/service';
import type { Scheme } from '@/features/schemes/type';

import { getGoal as getGoalFromRepo, getGoals } from './repository';
import type { Goal, GoalView } from './type';

export async function fetchGoals(userId: string): Promise<GoalView[]> {
  const [goals, schemes] = await Promise.all([getGoals(userId), getSchemes(userId)]);

  return goals.map((goal) => {
    const assignedSchemes = schemes.filter((s) => goal.schemeIds.includes(s.id));
    return processGoal(goal, assignedSchemes);
  });
}

export async function getGoalView(userId: string, goalId: string): Promise<GoalView | null> {
  const [goal, schemes] = await Promise.all([getGoalFromRepo(userId, goalId), getSchemes(userId)]);

  if (!goal) return null;

  const assignedSchemes = schemes.filter((s) => goal.schemeIds.includes(s.id));
  return processGoal(goal, assignedSchemes);
}

function processGoal(goal: Goal, assignedSchemes: Scheme[]): GoalView {
  const currentAmount = assignedSchemes.reduce((sum, s) => sum + (s.marketValue || 0), 0);

  const progressPercentage = goal.targetAmount > 0 ? (currentAmount / goal.targetAmount) * 100 : 0;

  const remainingAmount = Math.max(0, goal.targetAmount - currentAmount);

  // Projection logic
  const projectedDate = calculateProjectedDate(goal, assignedSchemes, currentAmount);

  return {
    ...goal,
    currentAmount,
    progressPercentage,
    remainingAmount,
    projectedDate,
  };
}

function calculateProjectedDate(
  goal: Goal,
  assignedSchemes: Scheme[],
  currentAmount: number
): Date | undefined {
  if (currentAmount >= goal.targetAmount) return new Date();

  // 1. Calculate aggregated XIRR of assigned schemes (excluding negative ones as per design)
  const positiveXirrSchemes = assignedSchemes.filter((s) => (s.xirrGainLoss || 0) > 0);

  if (positiveXirrSchemes.length === 0) return undefined;

  // Use weighted average XIRR or just mean? Design says combined transactions XIRR.
  // For simplicity here, let's use the average XIRR of assigned schemes.
  const avgXirr =
    positiveXirrSchemes.reduce((sum, s) => sum + (s.xirrGainLoss || 0), 0) /
    positiveXirrSchemes.length;

  if (avgXirr <= 0) return undefined;

  // FV = PV * (1 + r)^n => n = ln(FV/PV) / ln(1 + r)
  const r = avgXirr / 100;
  const n = Math.log(goal.targetAmount / currentAmount) / Math.log(1 + r);

  const projectedDate = new Date();
  projectedDate.setFullYear(projectedDate.getFullYear() + Math.floor(n));
  const remainingMonths = (n - Math.floor(n)) * 12;
  projectedDate.setMonth(projectedDate.getMonth() + Math.round(remainingMonths));

  return projectedDate;
}
