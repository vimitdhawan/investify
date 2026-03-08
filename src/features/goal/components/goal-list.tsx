import { GoalView } from '../type';
import { GoalCard } from './goal-card';

export function GoalList({ goals }: { goals: GoalView[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
}
