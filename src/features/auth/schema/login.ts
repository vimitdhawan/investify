import * as z from 'zod';

import { PasswordInputValidation } from '@/features/auth/schema/pasword';

export const loginFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: PasswordInputValidation,
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

export type LoginActionState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
  errorMessage?: string;
  success?: boolean;
};
