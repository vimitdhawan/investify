# Styling Guide

This document provides guidelines for styling the Investify application using Tailwind CSS and `shadcn/ui`. Our goal is to create a consistent, visually appealing, and maintainable user interface.

## 1. Core Principles

- **Utility-First**: We use [Tailwind CSS](https://tailwindcss.com/) for all styling. Avoid writing custom CSS files whenever possible. All styles should be applied directly in the JSX using utility classes.
- **Component-Based**: We use [`shadcn/ui`](https://ui.shadcn.com/) for our base component library. These are not traditional library components but rather a collection of pre-built, customizable components that live directly in our codebase under `/src/components/ui`.
- **Consistency**: Adhere to the design tokens (colors, spacing, typography) defined in `tailwind.config.mjs` to maintain a consistent visual language.

## 2. Using `shadcn/ui` Components

- **Find a Component**: Before building a new UI element, always check if a suitable component already exists in `shadcn/ui`.
- **Composition**: Combine and compose `shadcn/ui` components to build more complex UI features. For example, use `Card`, `CardHeader`, and `CardContent` to create a new info panel.
- **Styling**: To style a `shadcn/ui` component, pass Tailwind CSS utility classes directly via the `className` prop.

```tsx
import { Button } from '@/components/ui/button';

// GOOD: Pass utility classes to the component
<Button className="bg-brand-primary hover:bg-brand-secondary">
  Click Me
</Button>

// BAD: Wrapping in a styled div (unless necessary for layout)
<div style={{ backgroundColor: 'blue' }}>
  <Button>Click Me</Button>
</div>
```

## 3. Creating New Components

When you need to create a new component that is not available in `shadcn/ui` or is a custom composition for our application:

1.  **Location**: Place the new component in an appropriate subdirectory within `/src/components`.
    - If it's a globally reusable component, it can live in `/src/components`.
    - If it's specific to a feature, place it in a feature-specific folder like `/src/components/dashboard/`.
2.  **Build with `cva`**: For components with multiple visual variants (e.g., different colors, sizes), use `class-variance-authority (cva)` to manage the class names. This is the same pattern `shadcn/ui` uses and ensures consistency.

### Example: Creating a new `StatusBadge` component

```tsx
// src/components/ui/status-badge.tsx
import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// Your utility for merging class names

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        success: 'border-transparent bg-green-500 text-white',
        warning: 'border-transparent bg-yellow-500 text-white',
        danger: 'border-transparent bg-red-500 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function StatusBadge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { StatusBadge, badgeVariants };
```

## 4. Theming & Design Tokens

- **Colors**: All color definitions are located in `tailwind.config.mjs` under `theme.extend.colors`. Use the semantic color names (e.g., `primary`, `destructive`, `card`, `card-foreground`) instead of raw hex codes.
- **Spacing**: Use Tailwind's default spacing scale (`p-4`, `m-8`, `gap-2`). These are based on a `rem` scale that ensures consistency.
- **Typography**: Use the text utilities for font sizes, weights, and colors (e.g., `text-lg`, `font-semibold`, `text-muted-foreground`).

## 5. Responsive Design

- **Mobile-First**: Design for mobile screens first, then use Tailwind's responsive modifiers to adapt the layout for larger screens.
- **Breakpoints**: Use the standard Tailwind breakpoints:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px

```tsx
// This will be a single column on mobile, and a two-column grid on medium screens and up.
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```
