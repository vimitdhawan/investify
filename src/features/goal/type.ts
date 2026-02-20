export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: Date;
  currentAmount: number;
  userId: string;
  schemeIds: string[];
  projectedDate?: Date;
}
