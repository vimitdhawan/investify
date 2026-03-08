export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: Date;
  currentAmount: number;
  schemeIds: string[];
  projectedDate?: Date;
}

export interface GoalView extends Goal {
  progressPercentage: number;
  remainingAmount: number;
}
