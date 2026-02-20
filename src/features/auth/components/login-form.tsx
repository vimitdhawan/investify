'use client';
import { useActionState, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { handleLogin } from '@/features/auth/actions/login';
import { useRouter } from 'next/navigation';
import {
  LoginActionState,
  loginFormSchema,
  LoginFormData,
} from '@/features/auth/schema/login';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(handleLogin, {
    errors: {},
  } as LoginActionState);
  const [callbackUrl, setCallbackUrl] = useState('/dashboard');

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get('callbackUrl') || '/dashboard';
    setCallbackUrl(value);
  }, []);

  useEffect(() => {
    if (!state) return;
    if (state?.errors) {
      Object.entries(state.errors).forEach(([key, messages]) => {
        form.setError(key as keyof LoginFormData, {
          type: 'manual',
          message: Array.isArray(messages) ? messages.join('\n') : messages,
        });
      });
    }
    if (state.errorMessage) {
      toast.error(state.errorMessage);
    }
    if (state.success) {
      console.log(callbackUrl);
      router.push(callbackUrl);
    }
  }, [state, form]);

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="m@example.com"
                  onChange={(e) => {
                    field.onChange(e);
                    form.clearErrors('email');
                  }}
                />
              </FormControl>
              <FormMessage className="whitespace-pre-line" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center">
                <FormLabel>Password</FormLabel>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  onChange={(e) => {
                    field.onChange(e);
                    form.clearErrors('password');
                  }}
                />
              </FormControl>
              <FormMessage className="whitespace-pre-line" />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-3">
          <input type="hidden" name="redirectTo" value={callbackUrl} />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            Login
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
}
