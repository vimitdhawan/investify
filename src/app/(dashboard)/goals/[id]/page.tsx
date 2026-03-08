import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Edit, ArrowLeft } from 'lucide-react';
import { getSessionUserId } from '@/lib/session';
import { getGoalView } from '@/features/goal/service';
import { getSchemes } from '@/features/schemes/service';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatDateToYYYYMMDD } from '@/lib/utils/date';
import { DeleteGoalButton } from '@/features/goal/components/delete-goal-button';

export default async function GoalDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await getSessionUserId();

  if (!userId) {
    return <div>Unauthorized</div>;
  }

  const goal = await getGoalView(userId, id);

  if (!goal) {
    notFound();
  }

  const allSchemes = await getSchemes(userId);
  const assignedSchemes = allSchemes.filter((s) =>
    goal.schemeIds.includes(s.id)
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/goals">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{goal.name}</h1>
            <p className="text-muted-foreground">Goal Details and Progress</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/goals/${goal.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteGoalButton goalId={goal.id} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>
              Your journey towards ₹{goal.targetAmount.toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">
                  {goal.progressPercentage.toFixed(1)}% Completed
                </span>
                <span className="text-muted-foreground">
                  ₹{goal.currentAmount.toLocaleString()} / ₹
                  {goal.targetAmount.toLocaleString()}
                </span>
              </div>
              <Progress value={goal.progressPercentage} className="h-4" />
            </div>

            <div className="grid gap-4 pt-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Target Date
                </p>
                <p className="mt-1 text-lg font-bold">
                  {formatDateToYYYYMMDD(goal.targetDate)}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Projected Date
                </p>
                <p className="mt-1 text-lg font-bold text-primary">
                  {goal.projectedDate
                    ? formatDateToYYYYMMDD(goal.projectedDate)
                    : 'N/A'}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Remaining
                </p>
                <p className="mt-1 text-lg font-bold text-destructive">
                  ₹{goal.remainingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Schemes</CardTitle>
            <CardDescription>
              Mutual funds contributing to this goal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignedSchemes.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No schemes assigned to this goal.
                </p>
              ) : (
                assignedSchemes.map((scheme) => (
                  <div
                    key={scheme.id}
                    className="flex flex-col gap-1 rounded-md border p-3 text-sm"
                  >
                    <div className="font-medium truncate">{scheme.name}</div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>
                        Value: ₹{scheme.marketValue?.toLocaleString()}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {scheme.amc}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
