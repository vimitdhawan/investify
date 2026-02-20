'use client';

import { Goal } from '@/lib/types/goal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { handleDeleteGoal } from '@/features/goal/action';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface GoalListProps {
  goals: Goal[];
}

export function GoalList({ goals }: GoalListProps) {
  const router = useRouter();
  const handleDelete = async (goalId: string) => {
    const result = await handleDeleteGoal(goalId);
    if (result?.errorMessage) {
      toast.error(result.errorMessage);
    } else {
      toast.success('Goal deleted successfully!');
      router.refresh(); // Refresh the page to show updated list
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Financial Goals</h1>
        <Button asChild>
          <Link href="/goals/create">
            <Award className="mr-2 h-4 w-4" /> Create New Goal
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length === 0 ? (
          <p className="col-span-full text-center text-muted-foreground">
            No goals defined yet. Start by creating one!
          </p>
        ) : (
          goals.map((goal) => (
            <Card key={goal.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {goal.name}
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/goals/${goal.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your
                            {/* TODO: Add goal name here */}
                            goal and unlink all associated schemes.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(goal.id)}
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Target: ₹{goal.targetAmount.toLocaleString()}
                </p>
                <p className="text-sm">
                  Current: ₹{goal.currentAmount.toLocaleString()}
                </p>
                <p className="text-sm">
                  Projected Date:{' '}
                  {goal.projectedDate
                    ? new Date(goal.projectedDate).toLocaleDateString()
                    : 'N/A'}
                </p>
                {/* More details to be added later */}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
