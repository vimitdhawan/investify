import { GoalForm } from '@/features/goal/components/goal-form';
import { getActiveSchemes } from '@/features/schemes/service';

import { getSessionUserId } from '@/lib/session';

export default async function CreateGoalPage() {
  const userId = await getSessionUserId();

  if (!userId) {
    return <div>Unauthorized</div>;
  }

  const schemes = await getActiveSchemes(userId);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="mx-auto w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight">Create Goal</h1>
        <p className="text-muted-foreground">
          Define a new financial objective and assign schemes to it.
        </p>
      </div>

      <div className="mx-auto w-full max-w-2xl">
        <GoalForm schemes={schemes} />
      </div>
    </div>
  );
}
