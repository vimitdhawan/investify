import { getGoals } from '@/features/goal/repository';
import { GoalList } from '@/features/goal/components/goal-list';
import { getSessionUserId } from '@/lib/session';
import { redirect } from 'next/navigation';

// Server Component to fetch data
export default async function GoalsPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect('/login');
  }
  const goals = await getGoals(userId);

  return <GoalList goals={goals} />;
}
