import { GoalForm } from '@/features/goal/components/goal-form';
import { getSchemesByUserId } from '@/lib/clients/scheme';
import { getSessionUserId } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function CreateGoalPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/login');
  }

  const availableSchemes = await getSchemesByUserId(userId);

  return (
    <div className="flex w-full items-start justify-center px-6 md:px-10 py-6 md:py-10">
      <div className="w-full max-w-2xl mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <GoalForm availableSchemes={availableSchemes} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
