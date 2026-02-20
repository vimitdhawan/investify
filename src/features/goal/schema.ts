import { z } from 'zod';

export const goalFormSchema = z.object({
  id: z.string().optional(), // For editing
  name: z.string().min(1, 'Goal name is required'),
  targetAmount: z.string().min(1, 'Target amount is required'), // Will be parsed in action
  targetDate: z.string().min(1, 'Target date is required'), // Will be parsed in action
  schemeIds: z.array(z.string()).optional(),
});

export type GoalFormData = z.infer<typeof goalFormSchema>;