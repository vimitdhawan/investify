import { notFound } from 'next/navigation';

import { GoalForm } from '@/features/goal/components/goal-form';
import { getGoal } from '@/features/goal/repository';
import { getSchemes } from '@/features/schemes/service';

import { getSessionUserId } from '@/lib/session';

export default async function EditGoalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getSessionUserId();

  if (!userId) {
    return <div>Unauthorized</div>;
  }

  const [goal, allSchemes] = await Promise.all([getGoal(userId, id), getSchemes(userId)]);

  if (!goal) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="mx-auto w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight">Edit Goal</h1>
        <p className="text-muted-foreground">Update your financial objective.</p>
      </div>

      <div className="mx-auto w-full max-w-2xl">
        <GoalForm goal={goal} schemes={allSchemes} />
      </div>
    </div>
  );
}
