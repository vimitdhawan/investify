# Styling System Documentation

## Overview

This directory contains the complete styling system for the Investify application. The styles are organized in a **production-grade modular structure** for easy maintenance, scalability, and team collaboration.

## File Structure

```
Project Root:
├── tailwind.config.ts         # Tailwind configuration (NEW - Production-grade)
├── postcss.config.mjs         # PostCSS configuration
└── src/styles/
    ├── globals.css            # Main entry point (42 lines)
    ├── tokens.css             # Design tokens (111 lines)
    ├── themes.css             # Light/dark themes (196 lines)
    ├── base.css               # Base styles (85 lines)
    └── README.md              # This file
```

**Total CSS:** 434 lines across 4 modular files
**Production Build:** ~92KB minified CSS (optimized)

## Architecture

### Production-Grade Setup

**Tailwind CSS v4** with explicit configuration for:

- ✅ Type-safe `tailwind.config.ts`
- ✅ Explicit content paths (no auto-detection risks)
- ✅ Dark mode via `.dark` class
- ✅ Room for future extensions

### Import Order (Critical)

The `globals.css` file imports everything in this specific order:

1. **Tailwind CSS** - Framework base
2. **tw-animate-css** - Animation utilities
3. **Custom dark variant** - `.dark` class support
4. **tokens.css** - Design system tokens
5. **themes.css** - Light/dark color overrides
6. **base.css** - Global element defaults

This order ensures proper CSS cascade and prevents conflicts.

### Content Scanning

`tailwind.config.ts` explicitly defines where Tailwind scans for classes:

- `src/app/**` - Pages, layouts, route handlers
- `src/components/**` - UI components (shadcn/ui + custom)
- `src/features/**` - Feature-specific components

**Note:** `src/hooks/` and `src/lib/` excluded (no JSX/Tailwind classes)

---

## Tailwind Configuration

### `tailwind.config.ts` - Production Setup

**Location:** Project root

**Purpose:** Explicit Tailwind configuration for production-grade applications

**Key Features:**

- ✅ Type-safe configuration (`satisfies Config`)
- ✅ Explicit content paths (prevents missing styles)
- ✅ Dark mode configuration (`class` strategy)
- ✅ Documented and maintainable
- ✅ Room for future extensions

**Why We Added This:**
While Tailwind v4 with `@tailwindcss/postcss` can work without a config file, **production applications benefit from explicit configuration**:

- Clear "source of truth" for what's configured
- No reliance on auto-detection
- Easier team onboarding
- Better for debugging
- Industry best practice

**Content Paths:**

```ts
content: [
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  './src/features/**/*.{js,ts,jsx,tsx,mdx}',
];
```

---

## File Descriptions

### 1. `globals.css` - Entry Point

**Purpose:** Main stylesheet that imports all other styles

**What it does:**

- Imports Tailwind CSS framework
- Defines custom dark mode variant
- Imports all design system files in correct order

**How to use:**

```tsx
// In src/app/layout.tsx
import '@/styles/globals.css';
```

---

### 2. `tokens.css` - Design Tokens

**Purpose:** Core design system values and Tailwind theme configuration

**Contains:**

- `@theme inline` block - Maps CSS variables to Tailwind utilities
- Color token mappings (background, foreground, primary, etc.)
- Typography tokens (font families)
- Radius scale (sm, md, lg, xl)
- Base configuration values

**Key Features:**

- Enables Tailwind utilities like `bg-background`, `text-primary`
- Centralizes all design tokens in one place
- Easy to extend with new tokens

**Example:**

```css
/* Tokens enable these Tailwind classes: */
<div className="bg-background text-foreground" />
<button className="bg-primary text-primary-foreground" />
<div className="rounded-lg" /> /* Uses --radius-lg */
```

---

### 3. `themes.css` - Theme Definitions

**Purpose:** Light and dark mode color definitions using OKLCH color space

**Contains:**

- `:root` - Light mode colors (default)
- `.dark` - Dark mode colors (applied via class)

**Color Categories:**

1. **Background & Text** - Foundation colors
2. **Surfaces** - Cards, popovers
3. **Interactive** - Primary, secondary, accent
4. **Muted** - Subtle backgrounds, disabled states
5. **Feedback** - Destructive, gain, loss, info
6. **Form Elements** - Borders, inputs, focus rings
7. **Charts** - 5 distinct colors for data visualization
8. **Sidebar** - Navigation component colors

**OKLCH Color Format:**

```css
--primary: oklch(L C H);
/* L = Lightness (0-1) */
/* C = Chroma/saturation (0+) */
/* H = Hue angle (0-360°) */
```

**Example Color Values:**

```css
/* Light mode */
--background: oklch(1 0 0); /* Pure white */
--foreground: oklch(0.145 0 0); /* Near black */
--gain: oklch(0.6 0.15 140); /* Green for profits */

/* Dark mode */
--background: oklch(0.25 0 0); /* Very dark gray */
--foreground: oklch(0.98 0 0); /* Near white */
--gain: oklch(0.7 0.15 140); /* Lighter green */
```

**Theme Switching:**

```tsx
// Add/remove .dark class on <html> or <body>
<html className="dark">
```

---

### 4. `base.css` - Base Layer Styles

**Purpose:** Global element defaults and resets

**Contains:**

- Universal element styles (borders, focus rings)
- Body defaults (background, text, font smoothing)
- Optional typography defaults (commented out)
- Optional link styles (commented out)
- Optional focus-visible styles (commented out)

**What it does:**

```css
* {
  border-color: theme('colors.border');
  outline-color: theme('colors.ring');
}

body {
  background-color: theme('colors.background');
  color: theme('colors.foreground');
  -webkit-font-smoothing: antialiased;
}
```

**Extending:**
Uncomment optional sections in `base.css` to enable:

- Global heading styles
- Link underlines
- Enhanced focus indicators

---

## Color System

### Semantic Color Tokens

| Token         | Purpose                   | Example Usage                                |
| ------------- | ------------------------- | -------------------------------------------- |
| `background`  | Page/app background       | `bg-background`                              |
| `foreground`  | Default text color        | `text-foreground`                            |
| `primary`     | Primary actions (buttons) | `bg-primary text-primary-foreground`         |
| `secondary`   | Secondary actions         | `bg-secondary text-secondary-foreground`     |
| `destructive` | Errors, deletion          | `bg-destructive text-destructive-foreground` |
| `muted`       | Subtle backgrounds        | `bg-muted text-muted-foreground`             |
| `accent`      | Hover states, highlights  | `bg-accent text-accent-foreground`           |
| `border`      | Borders, dividers         | `border-border`                              |
| `ring`        | Focus rings               | `ring-ring`                                  |
| `gain`        | Positive returns          | `text-gain`                                  |
| `loss`        | Negative returns          | `text-loss`                                  |
| `info`        | Informational messages    | `bg-info text-info-foreground`               |

### Chart Colors

5 distinct colors for data visualization:

```tsx
<div className="bg-chart-1" /> {/* Orange */}
<div className="bg-chart-2" /> {/* Teal */}
<div className="bg-chart-3" /> {/* Blue */}
<div className="bg-chart-4" /> {/* Yellow */}
<div className="bg-chart-5" /> {/* Lime */}
```

### Sidebar Colors

Dedicated tokens for navigation sidebar:

```tsx
<aside className="bg-sidebar text-sidebar-foreground">
  <button className="bg-sidebar-primary text-sidebar-primary-foreground">Active</button>
  <button className="bg-sidebar-accent text-sidebar-accent-foreground">Hover</button>
</aside>
```

---

## Radius Scale

Border radius tokens for consistent roundness:

| Token       | Value | Usage           |
| ----------- | ----- | --------------- |
| `radius-sm` | 6px   | Small elements  |
| `radius-md` | 8px   | Medium elements |
| `radius-lg` | 10px  | Default (large) |
| `radius-xl` | 14px  | Extra large     |

**Example:**

```tsx
<div className="rounded-sm" />  {/* 6px */}
<div className="rounded-md" />  {/* 8px */}
<div className="rounded-lg" />  {/* 10px - default */}
<div className="rounded-xl" />  {/* 14px */}
```

---

## Extending the System

### Adding New Colors

1. **Define in `themes.css`:**

```css
/* Light mode */
:root {
  --new-color: oklch(0.5 0.1 200);
}

/* Dark mode */
.dark {
  --new-color: oklch(0.6 0.12 200);
}
```

2. **Map in `tokens.css`:**

```css
@theme inline {
  --color-new-color: var(--new-color);
}
```

3. **Use in components:**

```tsx
<div className="bg-new-color" />
```

### Adding Typography Tokens

1. **Define in `tokens.css`:**

```css
:root {
  --font-heading: 'Your Font', sans-serif;
}

@theme inline {
  --font-heading: var(--font-heading);
}
```

2. **Use in Tailwind:**

```tsx
<h1 className="font-heading" />
```

### Adding Spacing Tokens

Keep using Tailwind's default spacing scale unless you need custom values:

```css
/* If needed, add to tokens.css */
:root {
  --spacing-custom: 3.5rem;
}
```

---

## Best Practices

### ✅ Do

- Use semantic color tokens (`bg-primary`, not `bg-[oklch(...)]`)
- Maintain light/dark parity (both themes should have all tokens)
- Document new tokens with comments
- Test colors for accessibility (contrast ratios)
- Use OKLCH for perceptually uniform colors

### ❌ Don't

- Hardcode colors in components
- Use arbitrary values unless absolutely necessary
- Mix color spaces (stick to OKLCH)
- Create duplicate tokens with different names
- Override theme colors in component styles

---

## Troubleshooting

### Styles not applying?

1. **Check import order** in `globals.css`
2. **Verify CSS file paths** are correct
3. **Clear Next.js cache:** `rm -rf .next && npm run dev`
4. **Check browser DevTools** for CSS errors

### Dark mode not working?

1. **Verify `.dark` class** is on `<html>` or `<body>`
2. **Check ThemeProvider** in `layout.tsx`
3. **Ensure dark variant** is defined in `globals.css`
4. **Test with browser DevTools** by adding class manually

### Colors look different than expected?

1. **Verify OKLCH values** in `themes.css`
2. **Check browser support** for OKLCH (modern browsers only)
3. **Use fallback colors** if needed for older browsers
4. **Test in different browsers** (Chrome, Firefox, Safari)

---

## Migration from Old System

### What Changed

**Before:**

- Single `src/app/globals.css` file (145 lines)
- All concerns mixed together
- Redundant `--color-*` token mappings
- Hard to navigate and extend

**After:**

- Modular structure (4 files, 434 lines)
- Clear separation of concerns
- Removed redundant mappings
- Well-documented and scalable

### Breaking Changes

**None!** All existing code works without changes:

- Same token names (`--background`, `--primary`, etc.)
- Same Tailwind utilities (`bg-background`, `text-primary`)
- Same theme switching (`.dark` class)
- Same shadcn/ui integration

### What Was Improved

1. ✅ **Organization** - Modular file structure
2. ✅ **Documentation** - Comprehensive comments
3. ✅ **Maintainability** - Easy to find and update tokens
4. ✅ **Scalability** - Simple to add new tokens/themes
5. ✅ **Readability** - Clear sections and purpose
6. ✅ **Consistency** - Normalized OKLCH values
7. ✅ **Performance** - Removed redundant CSS

---

## shadcn/ui Compatibility

All shadcn/ui components work seamlessly with this styling system:

```tsx
import { Button } from '@/components/ui/button';

// Uses --primary and --primary-foreground
<Button variant="default">Click me</Button>

// Uses --destructive
<Button variant="destructive">Delete</Button>

// Uses --secondary
<Button variant="secondary">Cancel</Button>
```

The token structure matches shadcn/ui expectations, so all components render correctly in both light and dark modes.

---

## Performance

**CSS Size:**

- Before: 145 lines
- After: 434 lines (but better organized)
- Compiled: ~Same size (CSS is minified)

**Benefits:**

- Easier to maintain (reduces long-term bugs)
- Faster development (find tokens quickly)
- Better DX (clear documentation)
- No runtime cost (static CSS)

---

## Resources

- [OKLCH Color Picker](https://oklch.com/)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [CSS @layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer)

---

## Questions?

If you have questions or need to extend the system, refer to this documentation or check the comments in each CSS file.

**Happy styling! 🎨**
