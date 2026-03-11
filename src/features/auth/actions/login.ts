'use server';

import {
  LoginActionState,
  loginFormSchema,
} from '@/features/auth/schema/login';
import { createSession } from '@/lib/session';

export async function handleLogin(
  _prev: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const form = Object.fromEntries(formData);
  const validationResult = loginFormSchema.safeParse(form);
  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validationResult.data;

  try {
    // 2. Verify password using Firebase Auth REST API
    const apiKey = process.env.FIREBASE_WEB_API_KEY;
    if (!apiKey) {
      throw new Error('Firebase Web API Key is not configured.');
    }

    const isEmulator = process.env.FIREBASE_EMULATOR_MODE === 'true';
    const authEmulatorHost =
      process.env.FIREBASE_AUTH_EMULATOR_HOST || 'localhost:9099';

    const firebaseLoginUrl = isEmulator
      ? `http://${authEmulatorHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`
      : `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

    const response = await fetch(firebaseLoginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    const result = await response.json();
    console.log(result);

    // 3. Check for errors and create session
    if (!response.ok) {
      const errorCode = result?.error?.message;

      if (errorCode == 'INVALID_LOGIN_CREDENTIALS') {
        return {
          errors: {
            password: ['Invalid email or password.'],
          },
        };
      }
      return {
        errorMessage: 'Authentication failed. Please try again.',
      };
    }
    await createSession(result.localId);
    return {
      success: true,
    };
  } catch (error: any) {
    console.log(error);
    return {
      errorMessage: 'Unexpected error occurred. Please try again later.',
    };
  }
}
