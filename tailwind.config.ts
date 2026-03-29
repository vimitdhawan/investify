import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS Configuration
 * Production-grade setup for Investify application
 *
 * This configuration explicitly defines:
 * - Content paths for Tailwind class scanning
 * - Theme extensions (currently using CSS variables)
 * - Plugin integrations
 *
 * @see https://tailwindcss.com/docs/configuration
 */
const config = {
  /**
   * Content Paths
   * Defines where Tailwind should scan for class names
   * Includes all directories where Tailwind utilities might be used
   */
  content: [
    // App Router pages, layouts, and components
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',

    // Reusable UI components (shadcn/ui and custom)
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',

    // Feature-specific components and pages
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',

    // Note: hooks/ and lib/ excluded as they don't contain JSX/Tailwind classes
    // Add them here if they start using Tailwind in the future
  ],

  /**
   * Dark Mode Configuration
   * Using 'class' strategy with .dark class on <html> element
   * Controlled by next-themes ThemeProvider
   */
  darkMode: 'class',

  /**
   * Theme Configuration
   * Currently using CSS variables defined in src/styles/
   * See: src/styles/tokens.css and src/styles/themes.css
   *
   * All colors, spacing, and typography are managed via:
   * - @theme inline in tokens.css (Tailwind v4 approach)
   * - CSS custom properties in themes.css (OKLCH colors)
   */
  theme: {
    extend: {
      // Future: Add custom Tailwind extensions here if needed
      // Currently all customization is handled via CSS variables
      // This approach gives us:
      // - Better theming (light/dark mode via CSS variables)
      // - OKLCH color support (modern, perceptually uniform)
      // - shadcn/ui compatibility
    },
  },

  /**
   * Plugins
   * Add Tailwind plugins here as needed
   */
  plugins: [
    // Future: Add plugins like @tailwindcss/typography, @tailwindcss/forms, etc.
  ],
} satisfies Config;

export default config;
