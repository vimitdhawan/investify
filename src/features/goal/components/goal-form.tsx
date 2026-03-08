'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useActionState, useEffect } from 'react';
import {
  goalFormSchema,
  GoalFormData,
  GoalActionState,
  GoalFormInput,
} from '../schema';
import { handleCreateGoal, handleUpdateGoal } from '../action';
import { Goal } from '../type';
import { Scheme } from '@/features/schemes/type';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MultiSelect, OptionType } from '@/components/ui/multi-select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, Loader2 } from 'lucide-react';

interface GoalFormProps {
  goal?: Goal;
  schemes: Scheme[];
}

/**
 * Calculates the XIRR required to reach the target amount by the target date.
 */
function calculateRequiredXIRR(
  currentAmount: number,
  targetAmount: number,
  targetDate: Date
): number {
  if (currentAmount >= targetAmount) return 0;

  const now = new Date();
  const years =
    (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  if (years <= 0) return Infinity;

  // targetAmount = currentAmount * (1 + r)^years
  // r = (targetAmount / currentAmount)^(1/years) - 1
  const r = Math.pow(targetAmount / currentAmount, 1 / years) - 1;
  return r * 100;
}

export function GoalForm({ goal, schemes }: GoalFormProps) {
  const [state, action, isPending] = useActionState(
    goal ? handleUpdateGoal.bind(null, goal.id) : handleCreateGoal,
    {
      errors: {},
    } as GoalActionState
  );

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: goal?.name || '',
      targetAmount: goal?.targetAmount || 0,
      targetDate:
        goal?.targetDate ||
        new Date(new Date().setFullYear(new Date().getFullYear() + 5)),
      schemeIds: goal?.schemeIds || [],
    },
  });

  // Handle server-side validation errors
  useEffect(() => {
    if (state?.errors) {
      Object.entries(state.errors).forEach(([key, messages]) => {
        if (messages && messages.length > 0) {
          form.setError(key as keyof GoalFormData, {
            type: 'server',
            message: Array.isArray(messages)
              ? messages[0]
              : (messages as string),
          });
        }
      });
    }
  }, [state, form]);

  const schemeOptions: OptionType[] = schemes.map((s) => ({
    label: s.name,
    value: s.id,
  }));

  const { watch } = form;
  const watchedAmount = watch('targetAmount');
  const watchedDate = watch('targetDate');
  const watchedSchemeIds = watch('schemeIds') || [];

  const currentAmount = React.useMemo(() => {
    return schemes
      .filter((s) => watchedSchemeIds.includes(s.id))
      .reduce((sum, s) => sum + (s.marketValue || 0), 0);
  }, [watchedSchemeIds, schemes]);

  const requiredXirr = React.useMemo(() => {
    if (!watchedAmount || !watchedDate || currentAmount <= 0) return null;
    try {
      return calculateRequiredXIRR(
        currentAmount,
        watchedAmount,
        new Date(watchedDate)
      );
    } catch (e) {
      return null;
    }
  }, [watchedAmount, watchedDate, currentAmount]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{goal ? 'Edit Goal' : 'New Goal'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form action={action} className="space-y-6">
            {state.errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{state.errorMessage}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Retirement Fund" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          field.onChange(
                            e.target.value ? new Date(e.target.value) : null
                          )
                        }
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="schemeIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Schemes</FormLabel>
                  <FormControl>
                    <>
                      <MultiSelect
                        options={schemeOptions}
                        selected={field.value}
                        onSelectedChange={field.onChange}
                        placeholder="Select mutual fund schemes"
                      />
                      {field.value.map((id) => (
                        <input
                          key={id}
                          type="hidden"
                          name="schemeIds"
                          value={id}
                        />
                      ))}
                    </>
                  </FormControl>
                  <FormDescription>
                    Choose the investments you want to allocate to this goal.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {requiredXirr !== null && (
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  To reach your target of ₹{watchedAmount.toLocaleString()} from
                  your current ₹{currentAmount.toLocaleString()} by the target
                  date, you need an estimated annual return (XIRR) of{' '}
                  <span className="font-bold text-primary">
                    {requiredXirr === Infinity
                      ? 'N/A'
                      : `${requiredXirr.toFixed(2)}%`}
                  </span>
                  .
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {goal ? 'Update Goal' : 'Create Goal'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
