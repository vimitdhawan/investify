'use server';

import { redirect } from 'next/navigation';
import {
  createGoal,
  updateGoal,
  deleteGoal as deleteGoalRepo,
} from '@/features/goal/repository';
import { getSessionUserId } from '@/lib/session';
import { goalFormSchema, GoalFormData } from '@/lib/schema/goal';

export interface GoalActionState {
  errors?: {
    name?: string[];
    targetAmount?: string[];
    targetDate?: string[];
    schemeIds?: string[];
    _form?: string[];
  };
  errorMessage?: string;
}

export async function handleCreateGoal(
  _prev: GoalActionState,
  formData: FormData
): Promise<GoalActionState> {
  const userId = await getSessionUserId();
  if (!userId) {
    return {
      errorMessage: 'You must be logged in to create a goal.',
    };
  }
  const form = Object.fromEntries(formData);
  // Remove preprocessing logic as schema now expects strings
  const processedForm = {
    ...form,
    schemeIds: formData.getAll('schemeIds'),
  };

  const validationResult = goalFormSchema.safeParse(processedForm);

  if (!validationResult.success) {
    const fieldErrors = validationResult.error.flatten().fieldErrors;
    return {
      errors: {
        name: fieldErrors.name,
        targetAmount: fieldErrors.targetAmount,
        targetDate: fieldErrors.targetDate,
        schemeIds: fieldErrors.schemeIds,
      },
    };
  }

  const { name, targetAmount, targetDate, schemeIds } = validationResult.data;

  try {
    // Manually parse targetAmount and targetDate
    const parsedTargetAmount = parseFloat(targetAmount);
    const parsedTargetDate = new Date(targetDate);

    if (isNaN(parsedTargetAmount) || parsedTargetAmount <= 0) {
      return {
        errors: { targetAmount: ['Target amount must be a positive number'] },
      };
    }
    if (isNaN(parsedTargetDate.getTime())) {
      return {
        errors: { targetDate: ['Invalid target date format'] },
      };
    }

    await createGoal(userId, {
      name,
      targetAmount: parsedTargetAmount,
      targetDate: parsedTargetDate,
      schemeIds: schemeIds || [],
    });
  } catch (error: any) {
    return {
      errorMessage:
        error.message ||
        'An unexpected error occurred while creating the goal.',
    };
  }
  redirect('/goals');
}

export async function handleUpdateGoal(
  _prev: GoalActionState,
  formData: FormData
): Promise<GoalActionState> {
  const userId = await getSessionUserId();
  if (!userId) {
    return {
      errorMessage: 'You must be logged in to update a goal.',
    };
  }
  const form = Object.fromEntries(formData);
  // Remove preprocessing logic as schema now expects strings
  const processedForm = {
    ...form,
    schemeIds: formData.getAll('schemeIds'),
  };

  const validationResult = goalFormSchema.safeParse(processedForm);

  if (!validationResult.success) {
    const fieldErrors = validationResult.error.flatten().fieldErrors;
    return {
      errors: {
        name: fieldErrors.name,
        targetAmount: fieldErrors.targetAmount,
        targetDate: fieldErrors.targetDate,
        schemeIds: fieldErrors.schemeIds,
      },
    };
  }

  const { id, name, targetAmount, targetDate, schemeIds } =
    validationResult.data;

  if (!id) {
    return {
      errorMessage: 'Goal ID is missing for update operation.',
    };
  }

  try {
    // Manually parse targetAmount and targetDate
    const parsedTargetAmount = parseFloat(targetAmount);
    const parsedTargetDate = new Date(targetDate);

    if (isNaN(parsedTargetAmount) || parsedTargetAmount <= 0) {
      return {
        errors: { targetAmount: ['Target amount must be a positive number'] },
      };
    }
    if (isNaN(parsedTargetDate.getTime())) {
      return {
        errors: { targetDate: ['Invalid target date format'] },
      };
    }

    await updateGoal(userId, id, {
      name,
      targetAmount: parsedTargetAmount,
      targetDate: parsedTargetDate,
      schemeIds: schemeIds || [],
    });
  } catch (error: any) {
    return {
      errorMessage:
        error.message ||
        'An unexpected error occurred while updating the goal.',
    };
  }
  redirect('/goals');
}

export async function handleDeleteGoal(
  goalId: string
): Promise<GoalActionState> {
  const userId = await getSessionUserId();
  if (!userId) {
    return {
      errorMessage: 'You must be logged in to delete a goal.',
    };
  }

  if (!goalId) {
    return {
      errorMessage: 'Goal ID is missing for delete operation.',
    };
  }

  try {
    await deleteGoalRepo(userId, goalId);
  } catch (error: any) {
    return {
      errorMessage:
        error.message ||
        'An unexpected error occurred while deleting the goal.',
    };
  }
  redirect('/goals');
}
