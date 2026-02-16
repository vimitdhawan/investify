import { getGoals } from '@/lib/repository/goal';
import { GoalList } from './components/goal-list';

// Server Component to fetch data
export default async function GoalsPage() {
  const userId = 'OHo9Mhp3K63nZrs6arMMizh0tXe3'; // TODO: Replace with actual user ID
  const goals = await getGoals(userId);

  return <GoalList goals={goals} />;
}
