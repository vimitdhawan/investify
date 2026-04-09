---
name: investify-zod-forms
description: Investify form patterns with Zod validation, react-hook-form, and Server Actions. Use when building forms, adding validation schemas, creating Server Actions, or implementing form/schema pairs. This captures the exact patterns tested in production.
user-invocable: false
---

# Investify Zod Forms Skill

Build validated forms using Zod + react-hook-form + Server Actions following Investify's proven patterns.

---

## Schema Definition Patterns

### 1. Basic Schema with Type Coercion

FormData from HTML forms are always strings. Use `z.coerce` to convert to the correct type:

```typescript
// src/features/goal/schema.ts
import { z } from 'zod';

export const goalFormSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  targetAmount: z.coerce.number().positive('Target amount must be positive'),
  targetDate: z.coerce.date().min(new Date(), 'Target date must be in the future'),
  schemeIds: z.array(z.string()).min(1, 'Please select at least one scheme'),
});

export type GoalFormData = z.infer<typeof goalFormSchema>;
export type GoalFormInput = z.input<typeof goalFormSchema>;
```

**Key points:**

- `z.coerce.number()` — converts FormData string "1000" to number 1000
- `z.coerce.date()` — converts string "2025-12-31" to Date object
- `z.infer` — the validated output type (with correct types)
- `z.input` — the raw input type (all strings from FormData)
- Always export both schema and types

### 2. Custom Validation with `.refine()`

Use `.refine()` for single-field or simple multi-condition validation:

```typescript
export const goalFormSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  targetDate: z.coerce.date().refine(
    (date) => {
      if (isNaN(date.getTime())) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    },
    { message: 'Target date must be in the future' }
  ),
});
```

### 3. Complex Multi-Rule Validation with `.superRefine()`

Use `.superRefine()` when you need **multiple error messages** or **complex logic**:

```typescript
// src/features/auth/schema/password.ts
export const PasswordInputValidation = z.string().superRefine((value, ctx) => {
  const errors: string[] = [];

  if (value.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(value)) {
    errors.push('Password must contain one uppercase letter');
  }
  if (!/[0-9]/.test(value)) {
    errors.push('Password must contain one number');
  }
  if (!/[!@#$%^&*]/.test(value)) {
    errors.push('Password must contain one special character (!@#$%^&*)');
  }

  if (errors.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: errors.join('\n'), // Join with newline for multiline display
    });
  }
});
```

**Key points:**

- Accumulate multiple errors in an array
- Use `ctx.addIssue()` to add custom validation issues
- Join multiline errors with `'\n'` for proper form field display
- `z.ZodIssueCode.custom` for custom validation codes

### 4. Cross-Field Validation with `.refine()` on Schema

When validating **relationships between fields**, add `.refine()` to the entire schema and use `path` to target the error:

```typescript
// src/features/auth/schema/signup.ts
const signupFormBaseSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: PasswordInputValidation,
  confirmPassword: z.string().min(1, "Confirm password can't be empty"),
});

export const signupFormSchema = signupFormBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'], // Error appears on confirmPassword field
  }
);
```

### 5. Shared Validation Rules

Extract reusable validation into constants:

```typescript
// src/features/auth/schema/password.ts
export const PasswordInputValidation = z.string().superRefine(/* ... */);
export const EmailValidation = z.string().email({ message: 'Invalid email' });

// src/features/auth/schema/login.ts
export const loginFormSchema = z.object({
  email: EmailValidation,
  password: PasswordInputValidation,
});
```

---

## ActionState Type Pattern

Every feature's schema file must export a consistent ActionState type:

```typescript
// src/features/goal/schema.ts
export type GoalActionState = {
  errors?: Record<string, string[]>;
  errorMessage?: string;
  success?: boolean;
};
```

**What each field represents:**

- **`errors`** — field-level validation errors from Zod. Each field maps to an array of error messages.
- **`errorMessage`** — server-side error (unauthorized, database failure, etc.). Single string shown in an Alert.
- **`success`** — optional flag for successful submission (used for redirect or toast).

**Real-world example:**

```typescript
// Validation error from Zod
{
  errors: {
    name: ['Goal name is required'];
  }
}

// Server error (unauthorized, duplicate, etc.)
{
  errorMessage: "You don't have permission to edit this goal";
}

// Success
{
  success: true;
}
```

---

## Server Action Validation Pattern

All Server Actions follow this **5-step flow**:

```typescript
// src/features/goal/action.ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getSessionUserId } from '@/lib/session';

import { GoalActionState, goalFormSchema } from './schema';
import { createGoal } from './service';

export async function handleCreateGoal(
  _prev: GoalActionState,
  formData: FormData
): Promise<GoalActionState> {
  // Step 1: Auth check
  const userId = await getSessionUserId();
  if (!userId) {
    return { errorMessage: 'Unauthorized' };
  }

  // Step 2: Extract and structure form data
  const rawData = {
    name: formData.get('name'),
    targetAmount: formData.get('targetAmount'),
    targetDate: formData.get('targetDate'),
    schemeIds: formData.getAll('schemeIds'), // array fields
  };

  // Step 3: Validate with safeParse (never throws)
  const validationResult = goalFormSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  // Step 4: Call service and handle server errors
  try {
    await createGoal(userId, validationResult.data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create goal';
    return { errorMessage };
  }

  // Step 5: Revalidate and redirect on success
  revalidatePath('/goals');
  redirect('/goals');
}
```

**Why this pattern:**

- **Auth first** — fail fast if user is unauthorized
- **safeParse() not parse()** — doesn't throw, returns `{ success, data, error }`
- **flatten().fieldErrors** — converts Zod errors to `Record<string, string[]>`
- **Try/catch for service** — catches database, business logic, and runtime errors
- **Separate error types** — validation (form field level) vs server (general error)

### Update Actions

When updating, validate both form data AND check ownership/permissions:

```typescript
export async function handleUpdateGoal(
  goalId: string,
  _prev: GoalActionState,
  formData: FormData
): Promise<GoalActionState> {
  const userId = await getSessionUserId();
  if (!userId) return { errorMessage: 'Unauthorized' };

  // Verify ownership before validating form
  const existingGoal = await getGoal(goalId, userId);
  if (!existingGoal) {
    return { errorMessage: 'Goal not found or you do not have permission' };
  }

  // Validate form
  const validationResult = goalFormSchema.safeParse({
    name: formData.get('name'),
    // ... rest of form data
  });

  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  try {
    await updateGoal(goalId, userId, validationResult.data);
  } catch (error: unknown) {
    return { errorMessage: error instanceof Error ? error.message : 'Update failed' };
  }

  revalidatePath('/goals');
  redirect('/goals');
}
```

---

## Client Form Setup

### Basic Form with react-hook-form + zodResolver

```typescript
// src/features/goal/components/goal-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { goalFormSchema, type GoalFormData, type GoalActionState } from '../schema';
import { handleCreateGoal, handleUpdateGoal } from '../action';

export function GoalForm({ goal }: GoalFormProps) {
  // useActionState links form to Server Action
  const [state, action, isPending] = useActionState(
    goal
      ? handleUpdateGoal.bind(null, goal.id)
      : handleCreateGoal,
    { errors: {} } as GoalActionState
  );

  // useForm with zodResolver for client-side validation
  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: goal?.name || '',
      targetAmount: goal?.targetAmount || 0,
      targetDate: goal?.targetDate || new Date(),
      schemeIds: goal?.schemeIds || [],
    },
  });

  // Map server validation errors back to form fields
  useEffect(() => {
    if (state?.errors) {
      Object.entries(state.errors).forEach(([fieldKey, messages]) => {
        if (messages && messages.length > 0) {
          form.setError(fieldKey as keyof GoalFormData, {
            type: 'server',
            message: Array.isArray(messages) ? messages[0] : messages,
          });
        }
      });
    }

    if (state?.errorMessage) {
      // Show general server error in toast or alert
      console.error(state.errorMessage);
    }
  }, [state, form]);

  return (
    <Form {...form}>
      <form action={action} className="space-y-6">
        {/* Show server-side general error */}
        {state.errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{state.errorMessage}</AlertDescription>
          </Alert>
        )}

        {/* String field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Retirement Fund" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Number field - requires manual type conversion */}
        <FormField
          control={form.control}
          name="targetAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Amount (₹)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  disabled={field.disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date field - requires manual conversion to ISO string for input */}
        <FormField
          control={form.control}
          name="targetDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  name={field.name}
                  value={
                    field.value instanceof Date
                      ? field.value.toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) =>
                    field.onChange(e.target.value ? new Date(e.target.value) : null)
                  }
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save Goal'}
        </Button>
      </form>
    </Form>
  );
}
```

### Handling Array Fields (Multi-Select)

For array fields, you need **both** a UI component AND hidden inputs for FormData:

```typescript
<FormField
  control={form.control}
  name="schemeIds"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Assign Schemes</FormLabel>
      <FormControl>
        <>
          {/* UI component for user interaction */}
          <MultiSelect
            options={schemeOptions}
            selected={field.value}
            onSelectedChange={field.onChange}
            placeholder="Select schemes"
          />
          {/* Hidden inputs for FormData submission */}
          {field.value.map((id) => (
            <input key={id} type="hidden" name="schemeIds" value={id} />
          ))}
        </>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Why both?**

- The MultiSelect updates React state (form.control)
- The hidden inputs ensure FormData contains the array when form submits
- FormData has no native array support; multiple hidden inputs with the same name become an array via `formData.getAll('schemeIds')`

---

## Error Handling & Display

### Field Errors (Validation)

Displayed next to each form field via `<FormMessage />`:

```typescript
// Single error message (most fields)
message: 'Goal name is required'

// Multiple errors (password complexity)
message: 'Password must be at least 8 characters\nPassword must contain uppercase'

// Display with whitespace-pre-line to preserve newlines
<FormMessage className="whitespace-pre-line" />
```

### General Server Error

Displayed in an Alert component:

```typescript
{state?.errorMessage && (
  <Alert variant="destructive">
    <AlertDescription>{state.errorMessage}</AlertDescription>
  </Alert>
)}
```

---

## Complete Real-World Example

**Schema file:**

```typescript
// src/features/auth/schema/login.ts
import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

export type LoginActionState = {
  errors?: Record<string, string[]>;
  errorMessage?: string;
  success?: boolean;
};
```

**Action file:**

```typescript
// src/features/auth/action.ts
'use server';

import { LoginActionState, loginFormSchema } from './schema/login';
import { authenticateUser } from './service';

export async function handleLogin(
  _prev: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const validationResult = loginFormSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validationResult.success) {
    return { errors: validationResult.error.flatten().fieldErrors };
  }

  try {
    const user = await authenticateUser(validationResult.data);
    // Set session, redirect, etc.
  } catch (error: unknown) {
    return {
      errorMessage: error instanceof Error ? error.message : 'Login failed',
    };
  }
}
```

**Component:**

```typescript
// src/features/auth/components/login-form.tsx
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { loginFormSchema, type LoginFormData } from '../schema/login';
import { handleLogin } from '../action';

export function LoginForm() {
  const [state, action, isPending] = useActionState(handleLogin, {});

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (!state || !state.errors) return;
    Object.entries(state.errors).forEach(([key, messages]) => {
      form.setError(key as keyof LoginFormData, {
        type: 'server',
        message: Array.isArray(messages) ? messages[0] : messages,
      });
    });
  }, [state, form]);

  return (
    <form action={action}>
      {/* fields... */}
    </form>
  );
}
```

---

## Common Patterns & Gotchas

### Number Fields

FormData converts to string. Use `z.coerce.number()` in schema + manual onChange handler:

```typescript
<Input
  type="number"
  value={field.value}
  onChange={(e) => field.onChange(Number(e.target.value))}
/>
```

### Date Fields

Convert Date to ISO string for HTML input, and string back to Date on change:

```typescript
<Input
  type="date"
  value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
  onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
/>
```

### Array Fields

Always include hidden inputs alongside the UI component:

```typescript
<MultiSelect {...} />
{field.value.map((id) => (
  <input key={id} type="hidden" name="fieldName" value={id} />
))}
```

### Multiline Errors

Join with `'\n'` in superRefine, display with `whitespace-pre-line` CSS class:

```typescript
// Schema
message: errors.join('\n')

// Component
<FormMessage className="whitespace-pre-line" />
```

### Server vs Client Validation Error

- **Client validation** — errors from `zodResolver` (form.formState.errors)
- **Server validation** — errors from `form.setError()` in useEffect (state.errors)
- **Server error** — general errors in `state.errorMessage`

---

## Checklist Before Committing

- [ ] Schema exports `zodSchema`, `ZodData`, `ZodInput`, and `ActionState`
- [ ] Action uses `safeParse()` not `parse()`
- [ ] Action returns `.flatten().fieldErrors` for validation errors
- [ ] Form uses `zodResolver(schema)`
- [ ] Form uses `useActionState` with the action
- [ ] useEffect maps `state.errors` back to form fields
- [ ] Array fields have both UI component AND hidden inputs
- [ ] Number/date fields have manual onChange type conversion
- [ ] Multiline errors use `'\n'` and display with `whitespace-pre-line`
- [ ] General errors shown in Alert component
- [ ] `isPending` disables submit button
