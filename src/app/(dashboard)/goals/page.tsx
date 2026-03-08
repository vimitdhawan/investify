import { Suspense } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSessionUserId } from '@/lib/session';
import { fetchGoals } from '@/features/goal/service';
import { GoalList } from '@/features/goal/components/goal-list';
import { Skeleton } from '@/components/ui/skeleton';

export default async function GoalsPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    return <div>Unauthorized</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">
            Track your financial objectives and progress.
          </p>
        </div>
        <Button asChild>
          <Link href="/goals/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Goal
          </Link>
        </Button>
      </div>

      <Suspense fallback={<GoalListSkeleton />}>
        <GoalsContent userId={userId} />
      </Suspense>
    </div>
  );
}

async function GoalsContent({ userId }: { userId: string }) {
  const goals = await fetchGoals(userId);

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
        <div className="text-lg font-semibold">No goals yet</div>
        <p className="text-sm text-muted-foreground">
          Create your first financial goal to start tracking progress.
        </p>
        <Button asChild variant="outline">
          <Link href="/goals/create">Create Goal</Link>
        </Button>
      </div>
    );
  }

  return <GoalList goals={goals} />;
}

function GoalListSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-48 w-full rounded-xl" />
      ))}
    </div>
  );
}
