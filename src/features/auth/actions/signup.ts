'use server';

import { redirect } from 'next/navigation';
import { SignupActionState, signupFormSchema } from '@/lib/schema/signup';
import { createSession } from '@/lib/session';
import { auth } from '@/lib/firebase';

export async function handleSignup(
  _prev: SignupActionState,
  formData: FormData
): Promise<SignupActionState> {
  const form = Object.fromEntries(formData);
  const validationResult = signupFormSchema.safeParse(form);

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
    };
  }
  const { email, password } = validationResult.data;

  try {
    // Use Firebase Admin SDK to create the user
    const userRecord = await auth.createUser({
      email,
      password,
    });

    if (!userRecord.uid) {
      return {
        errorMessage: 'An error occurred while creating your account.',
      };
    }
    // Create a new session for the user
    await createSession(userRecord.uid);
    // Redirect to dashboard after successful signup and sign-in
  } catch (error: any) {
    // Handle potential errors, e.g., email already exists
    return {
      errorMessage: error.message || 'An unexpected error occurred.',
    };
  }
  redirect('/dashboard');
}
