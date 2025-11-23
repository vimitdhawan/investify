"use client";
import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { handleSignup } from "@/lib/actions/signup";
import {
  SignupActionState,
  signupFormSchema,
  SignupFormData,
} from "@/lib/schema/signup";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(handleSignup, {
    errors: {},
  } as SignupActionState);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (state?.errors) {
      Object.entries(state.errors).forEach(([key, messages]) => {
        form.setError(key as keyof SignupFormData, {
          type: "manual",
          message: Array.isArray(messages) ? messages.join("\n") : messages,
        });
      });
    }
    if (state.errorMessage) {
      toast.error(state.errorMessage);
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
                    form.clearErrors("email");
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  onChange={(e) => {
                    field.onChange(e);
                    form.clearErrors("password");
                  }}
                />
              </FormControl>
              <FormMessage className="whitespace-pre-line" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  onChange={(e) => {
                    field.onChange(e);
                    form.clearErrors("confirmPassword");
                  }}
                />
              </FormControl>
              <FormMessage className="whitespace-pre-line" />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            Signup
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4">
            Login
          </Link>
        </div>
      </form>
    </Form>
  );
}
