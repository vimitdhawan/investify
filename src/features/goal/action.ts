'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getSessionUserId } from '@/lib/session';

import { createGoal, deleteGoal as deleteGoalFromRepo, updateGoal } from './repository';
import { type GoalActionState, goalFormSchema } from './schema';

export async function handleCreateGoal(
  _prev: GoalActionState,
  formData: FormData
): Promise<GoalActionState> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { errorMessage: 'Unauthorized' };
  }

  const rawData = {
    name: formData.get('name'),
    targetAmount: formData.get('targetAmount'),
    targetDate: formData.get('targetDate'),
    schemeIds: formData.getAll('schemeIds'),
  };

  const validationResult = goalFormSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    await createGoal(userId, {
      ...validationResult.data,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create goal';
    return { errorMessage };
  }

  revalidatePath('/goals');
  redirect('/goals');
}

export async function handleUpdateGoal(
  goalId: string,
  _prev: GoalActionState,
  formData: FormData
): Promise<GoalActionState> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { errorMessage: 'Unauthorized' };
  }

  const rawData = {
    name: formData.get('name'),
    targetAmount: formData.get('targetAmount'),
    targetDate: formData.get('targetDate'),
    schemeIds: formData.getAll('schemeIds'),
  };

  const validationResult = goalFormSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  try {
    await updateGoal(userId, goalId, validationResult.data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update goal';
    return { errorMessage };
  }

  revalidatePath('/goals');
  revalidatePath(`/goals/${goalId}`);
  redirect('/goals');
}

export async function handleDeleteGoal(goalId: string): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  await deleteGoalFromRepo(userId, goalId);
  revalidatePath('/goals');
  redirect('/goals');
}
