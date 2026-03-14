import Link from 'next/link';

import { Calendar, Target } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import { formatDateToYYYYMMDD } from '@/lib/utils/date';

import type { GoalView } from '../type';

export function GoalCard({ goal }: { goal: GoalView }) {
  return (
    <Link href={`/goals/${goal.id}`}>
      <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{goal.name}</CardTitle>
            <Target className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardDescription>
            Target: ₹{goal.targetAmount.toLocaleString()} by {formatDateToYYYYMMDD(goal.targetDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{goal.progressPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={goal.progressPercentage} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
              <div>
                <p className="text-muted-foreground">Current Value</p>
                <p className="font-bold text-primary">₹{goal.currentAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Remaining</p>
                <p className="font-bold text-destructive">
                  ₹{goal.remainingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 px-6 py-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              Projected: {goal.projectedDate ? formatDateToYYYYMMDD(goal.projectedDate) : 'N/A'}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
