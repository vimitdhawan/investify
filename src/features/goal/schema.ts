import { z } from 'zod';

export const goalFormSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  targetAmount: z.coerce.number().positive('Target amount must be positive'),
  targetDate: z.coerce.date().refine(
    (date) => {
      if (isNaN(date.getTime())) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    },
    {
      message: 'Target date must be in the future',
    }
  ),
  schemeIds: z.array(z.string()).min(1, 'Please select at least one scheme'),
});

export type GoalFormData = z.infer<typeof goalFormSchema>;
export type GoalFormInput = z.input<typeof goalFormSchema>;

export type GoalActionState = {
  errors?: {
    name?: string[];
    targetAmount?: string[];
    targetDate?: string[];
    schemeIds?: string[];
  };
  errorMessage?: string;
  success?: boolean;
};
