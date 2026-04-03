# Service Communication Patterns

Server Actions, validation, form handling, and error patterns for client-server communication.

## Server Actions Pattern

### What are Server Actions?

Server Actions are async functions in Next.js that run on the server and are called from the client. They handle mutations (creates, updates, deletes) with built-in security and type safety.

### Action File Structure

Location: `features/{feature}/action.ts`

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getSessionUserId } from '@/lib/session';

import { createGoal } from './repository';
import { type GoalActionState, goalFormSchema } from './schema';

export async function handleCreateGoal(
  _prev: GoalActionState,
  formData: FormData
): Promise<GoalActionState> {
  // 1. Auth check
  const userId = await getSessionUserId();
  if (!userId) {
    return { errorMessage: 'Unauthorized' };
  }

  // 2. Parse form data
  const rawData = {
    name: formData.get('name'),
    targetAmount: formData.get('targetAmount'),
    targetDate: formData.get('targetDate'),
    schemeIds: formData.getAll('schemeIds'),
  };

  // 3. Validate with Zod
  const validationResult = goalFormSchema.safeParse(rawData);
  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  // 4. Execute business logic
  try {
    await createGoal(userId, validationResult.data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create goal';
    return { errorMessage };
  }

  // 5. Invalidate cache and navigate
  revalidatePath('/goals');
  redirect('/goals');
}
```

See: `features/goal/action.ts:11-46`

### Action State Type

Define a typed state object for the action's return value:

```typescript
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
```

This type is shared between the action and the form component.

See: `features/goal/schema.ts:23-32`

## Zod Validation Pattern

### Schema Definition

Define validation schemas in `features/{feature}/schema.ts`:

```typescript
import { z } from 'zod';

export const goalFormSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  targetAmount: z.coerce.number().positive('Target amount must be positive'),
  targetDate: z.coerce.date().refine(
    (date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    },
    { message: 'Target date must be in the future' }
  ),
  schemeIds: z.array(z.string()).min(1, 'Please select at least one scheme'),
});

// Export typed form data
export type GoalFormData = z.infer<typeof goalFormSchema>;

// For form data before coercion
export type GoalFormInput = z.input<typeof goalFormSchema>;
```

See: `features/goal/schema.ts:3-21`

### Key Features

- **z.coerce** - Automatically converts form strings to numbers/dates
- **z.refine()** - Custom validation logic (e.g., future date check)
- **z.infer** - Extracts TypeScript type from schema
- **min/max** - Array validation for multi-select fields

## Form-to-Action Connection

### Client Component with useActionState

```typescript
'use client';

import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { handleCreateGoal } from '../action';
import { type GoalActionState, type GoalFormData, goalFormSchema } from '../schema';

export function GoalForm() {
  // 1. Connect action with initial state
  const [state, action, isPending] = useActionState(
    handleCreateGoal,
    { errors: {} } as GoalActionState
  );

  // 2. Setup form with Zod validation
  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: '',
      targetAmount: 0,
      targetDate: new Date(),
      schemeIds: [],
    },
  });

  // 3. Reflect server errors back to form
  useEffect(() => {
    if (state?.errors) {
      Object.entries(state.errors).forEach(([key, messages]) => {
        if (messages && messages.length > 0) {
          form.setError(key as keyof GoalFormData, {
            type: 'server',
            message: messages[0],
          });
        }
      });
    }
  }, [state, form]);

  return (
    <form action={action} className="space-y-6">
      {/* General error message */}
      {state?.errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{state.errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Form fields with react-hook-form */}
      <FormField control={form.control} name="name" render={...} />

      {/* Submit button with loading state */}
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 animate-spin" />}
        Create Goal
      </Button>
    </form>
  );
}
```

See: `features/goal/components/goal-form.tsx:39-69`

### How It Works

1. `useActionState()` - Connects form to Server Action, manages state and loading
2. `form.setError()` - Reflects validation errors from server back to form fields
3. `action={action}` - Progressive enhancement: form works without JavaScript
4. `isPending` - Show loading state while action executes

## Authentication Pattern

### Session Check in Actions

```typescript
import { getSessionUserId } from '@/lib/session';

export async function handleCreateGoal(
  _prev: GoalActionState,
  formData: FormData
): Promise<GoalActionState> {
  const userId = await getSessionUserId();

  if (!userId) {
    return { errorMessage: 'Unauthorized' };
    // OR throw new Error('Unauthorized');
  }

  // Continue with userId
  await createGoal(userId, data);
}
```

### Session Utilities

Located at: `src/lib/session.ts`

```typescript
// Get current user ID from session cookie
const userId = await getSessionUserId();

// Create session after login
await createSession(userId);

// Update session expiration
await updateSession();

// Delete session on logout
await deleteSession();
```

Session is stored as JWT in HttpOnly, Secure cookies.

See: `lib/session.ts:95-111` (getSessionUserId)

## Error Handling Patterns

### Validation Errors

Return field-level validation errors to the form:

```typescript
const validationResult = goalFormSchema.safeParse(rawData);
if (!validationResult.success) {
  return {
    errors: validationResult.error.flatten().fieldErrors,
  };
}
```

Format: `{ errors: { fieldName: ['error message'] } }`

The form component receives this and calls `form.setError()` to display errors.

### General Errors

Return a general error message (e.g., server error, network error):

```typescript
try {
  await createGoal(userId, data);
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Failed to create goal';
  return { errorMessage: message };
}
```

Format: `{ errorMessage: string }`

Displayed at the top of the form as an alert.

### Success State

Return success flag for programmatic handling:

```typescript
return { success: true };
```

Though typically you'll redirect instead:

```typescript
revalidatePath('/goals');
redirect('/goals');
```

### External API Errors

Transform external API errors to user-friendly messages:

```typescript
try {
  const response = await fetch(firebaseLoginUrl, {
    method: 'POST',
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  const result = await response.json();

  if (!response.ok) {
    const errorCode = result?.error?.message;

    // Firebase-specific error
    if (errorCode === 'INVALID_LOGIN_CREDENTIALS') {
      return {
        errors: {
          password: ['Invalid email or password.'],
        },
      };
    }

    // Generic API error
    return {
      errorMessage: 'Authentication failed. Please try again.',
    };
  }

  // Success - create session
  await createSession(result.localId);
  return { success: true };
} catch (error: any) {
  // Network or unexpected error
  return {
    errorMessage: 'Unexpected error occurred. Please try again later.',
  };
}
```

See: `features/auth/actions/login.ts:35-74`

## Cache Invalidation & Navigation

After a successful mutation, invalidate the cache and navigate:

```typescript
// Invalidate specific paths
revalidatePath('/goals');
revalidatePath(`/goals/${goalId}`);

// Redirect user
redirect('/goals');
```

**Important:** Call these **after** successful mutation, before returning.

Validation errors don't redirect - they return errors instead so the form can be corrected.

## Server-Only Utilities

Some utilities must only run on the server (e.g., session, auth):

```typescript
'server-only';

import { cookies } from 'next/headers';

export async function getSessionUserId(): Promise<string | null> {
  const session = (await cookies()).get('session')?.value;
  // ... verify and return userId
}
```

The `'server-only'` directive prevents accidental client imports at build time.

See: `lib/session.ts:1`

## Best Practices

### 1. Always Validate Input

```typescript
// ✅ Good
const result = goalFormSchema.safeParse(rawData);
if (!result.success) return { errors: result.error.flatten().fieldErrors };

// ❌ Bad - don't skip validation
const data = rawData as GoalFormData; // Type assertion is not validation
```

### 2. Check Authentication Early

```typescript
// ✅ Good - check auth first
const userId = await getSessionUserId();
if (!userId) return { errorMessage: 'Unauthorized' };

// ❌ Bad - might call repository before checking auth
const data = await getData();
const userId = await getSessionUserId();
```

### 3. Distinguish Error Types

```typescript
// ✅ Good - field errors vs general errors
if (validation fails) return { errors: {...} };
if (auth fails) return { errorMessage: 'Unauthorized' };
if (db fails) return { errorMessage: 'Server error' };

// ❌ Bad - mixing error types
return { error: 'Something failed' };
```

### 4. Use Type-Safe Forms

```typescript
// ✅ Good - type-safe with Zod + react-hook-form
const form = useForm<GoalFormData>({
  resolver: zodResolver(goalFormSchema),
});

// ❌ Bad - no type safety
const [formData, setFormData] = useState({});
```

### 5. Show Loading States

```typescript
// ✅ Good
<Button disabled={isPending}>
  {isPending && <Loader2 className="animate-spin" />}
  Submit
</Button>

// ❌ Bad - no feedback to user
<Button type="submit">Submit</Button>
```

## Related Documentation

- [SERVICE_ARCHITECTURE.md](SERVICE_ARCHITECTURE.md) - Service organization and data flow
- [CODE_CONVENTIONS.md](CODE_CONVENTIONS.md) - Code style and patterns
- [BUILDING_THE_PROJECT.md](BUILDING_THE_PROJECT.md) - Development and deployment
