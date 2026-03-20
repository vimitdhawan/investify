export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: Date;
  schemeIds: string[];
}

export interface GoalView extends Goal {
  currentAmount: number;
  progressPercentage: number;
  remainingAmount: number;
  projectedDate?: Date;
  requiredXirr: number;
  currentXirr: number;
}
