'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  GoalActionState,
  handleCreateGoal,
  handleUpdateGoal,
} from '@/features/goal/action';
import { goalFormSchema, GoalFormData } from '@/lib/schema/goal'; // Updated import
import { Goal } from '@/lib/types/goal';
import { Scheme } from '@/lib/types/scheme';
import { MultiSelect } from '@/components/ui/multi-select'; // Assuming this component exists or will be created

interface GoalFormProps {
  initialGoal?: Goal; // For editing
  availableSchemes: Scheme[]; // To populate the multi-select dropdown
}

export function GoalForm({ initialGoal, availableSchemes }: GoalFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    initialGoal ? handleUpdateGoal : handleCreateGoal,
    { errors: {} } as GoalActionState
  );

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      id: initialGoal?.id || undefined,
      name: initialGoal?.name || '',
      targetAmount: initialGoal?.targetAmount?.toString() || '', // Convert number to string
      targetDate: initialGoal?.targetDate
        ? format(initialGoal.targetDate, 'yyyy-MM-dd')
        : '', // Format Date to YYYY-MM-DD string
      schemeIds: initialGoal?.schemeIds || [],
    },
    mode: 'onBlur',
  });

  // Effect to handle server-side errors
  useEffect(() => {
    if (state?.errors) {
      Object.entries(state.errors).forEach(([key, messages]) => {
        form.setError(key as keyof GoalFormData, {
          type: 'manual',
          message: Array.isArray(messages) ? messages.join('\n') : messages,
        });
      });
    }
    if (state.errorMessage) {
      toast.error(state.errorMessage);
    }
  }, [state, form]);

  // Handle successful form submission
  useEffect(() => {
    if (state && !state.errors && !state.errorMessage && !isPending) {
      // Form submitted successfully, redirect or show success message
      if (initialGoal) {
        toast.success('Goal updated successfully!');
      } else {
        toast.success('Goal created successfully!');
      }
      router.push('/goals');
    }
  }, [state, isPending, router, initialGoal]);

  const schemeOptions = availableSchemes.map((scheme) => ({
    label: `${scheme.name} (${scheme.folioNumber})`,
    value: scheme.id,
  }));

  // TODO: Implement XIRR display logic based on selected schemes and inputs

  return (
    <Form {...form}>
      <form action={formAction} className="space-y-8">
        {initialGoal && (
          <input type="hidden" name="id" value={initialGoal.id} />
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Goal Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., Retirement Fund"
                  onChange={(e) => {
                    field.onChange(e);
                    form.clearErrors('name');
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Amount</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="1000000"
                  onChange={(e) => {
                    field.onChange(e.target.value); // Keep as string for schema
                    form.clearErrors('targetAmount');
                  }}
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
            <FormItem className="flex flex-col">
              <FormLabel>Target Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) =>
                      field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                    }
                    disabled={(date) => date < new Date('1900-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="schemeIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned Schemes</FormLabel>
              <FormControl>
                <MultiSelect
                  options={schemeOptions}
                  selected={field.value || []}
                  onSelectedChange={field.onChange}
                  placeholder="Select schemes to assign"
                  className="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Placeholder for XIRR display */}
        {/*
          {calculatedXIRR !== undefined && (
            <div className="text-sm font-medium">
              Required XIRR: {calculatedXIRR.toFixed(2)}%
            </div>
          )}
        */}

        <div className="flex gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialGoal ? 'Update Goal' : 'Create Goal'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/goals')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
