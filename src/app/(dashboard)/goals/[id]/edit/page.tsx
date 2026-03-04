import { GoalForm } from '@/features/goal/components/goal-form';
import { getGoal } from '@/features/goal/repository';
import { getSchemesByUserId } from '@/lib/clients/scheme';
import { getSessionUserId } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function EditGoalPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/login');
  }

  const goalId = params.id;
  const initialGoal = await getGoal(userId, goalId);

  if (!initialGoal) {
    redirect('/goals'); // Redirect if goal not found
  }

  const availableSchemes = await getSchemesByUserId(userId);

  return (
    <div className="flex w-full items-start justify-center px-6 md:px-10 py-6 md:py-10">
      <div className="w-full max-w-2xl mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Goal: {initialGoal.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <GoalForm
              initialGoal={initialGoal}
              availableSchemes={availableSchemes}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
