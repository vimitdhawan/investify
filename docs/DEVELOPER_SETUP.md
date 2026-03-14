# Developer Setup Guide

Welcome to the Investify project! This guide will help you set up your development environment for contributing to our mutual fund portfolio analysis application.

## Prerequisites

- **Node.js** 18+ (check with `node --version`)
- **npm** 8+ (check with `npm --version`)
- **Git** (check with `git --version`)
- **VS Code** (recommended) or your preferred editor

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd investify
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Git Hooks

This will install pre-commit hooks that automatically check your code quality before each commit:

```bash
npm run setup:hooks
```

You should see a success message confirming the hooks are installed.

### 4. Set Up Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your Firebase credentials and other configuration
```

### 5. Install VS Code Extensions (Recommended)

If you're using VS Code:

1. Open the project in VS Code
2. When prompted, click "Install" to install recommended extensions
3. Or manually install from the Extensions panel (Cmd/Ctrl + Shift + X):
   - Prettier - Code formatter
   - ESLint
   - Tailwind CSS IntelliSense
   - Auto Rename Tag
   - Error Lens
   - EditorConfig

## Development Workflow

### Before Starting Work

1. **Pull latest changes:**

   ```bash
   git pull origin main
   ```

2. **Install any new dependencies:**
   ```bash
   npm install
   ```

### While Developing

- **Start development server:**

  ```bash
  npm run dev
  ```

  Open http://localhost:3000 in your browser

- **Code auto-formatting:** Your code will automatically format on save (if using VS Code with Prettier extension)

- **Check TypeScript types:**

  ```bash
  npm run type-check
  ```

- **Check linting issues:**
  ```bash
  npm run lint
  ```

### Before Committing

The pre-commit hook will **automatically run** when you commit:

1. **TypeScript type checking** - Ensures no type errors
2. **ESLint checks** - Validates code quality and style
3. **Prettier formatting checks** - Ensures consistent formatting

If any checks fail, the commit will be blocked and you'll see helpful error messages.

#### Fixing Issues Before Commit

**For TypeScript errors:**

- Fix manually based on the error messages
- Run `npm run type-check` to verify fixes

**For ESLint issues:**

```bash
npm run lint:fix  # Auto-fix what's possible
```

**For Prettier formatting:**

```bash
npm run format  # Auto-format all files
```

**Run all checks manually:**

```bash
npm run check-all  # Runs type-check, lint, format:check, and tests
```

### Bypassing Hooks (Emergency Only)

In rare cases where you need to commit without passing checks:

```bash
git commit --no-verify -m "Emergency commit: description"
```

⚠️ **Use sparingly!** Always fix issues in the next commit.

## Code Style Guidelines

### Import Order

Imports are automatically sorted by Prettier in this order:

1. React imports (`react`, `react-dom`)
2. Next.js imports (`next`, `next/*`)
3. UI library imports (`@radix-ui`, `@tanstack`, etc.)
4. Icon imports (`@tabler/icons-react`, `lucide-react`)
5. Firebase imports
6. Internal components (`@/components/*`)
7. Internal features (`@/features/*`)
8. Internal utilities (`@/lib/*`, `@/utils/*`, `@/hooks/*`, `@/types/*`)
9. Other internal imports (`@/*`)
10. Relative imports (`./`, `../`)

### File Naming Conventions

- **Components:** PascalCase (e.g., `SchemeList.tsx`, `PortfolioCard.tsx`)
- **Utilities/Hooks:** camelCase (e.g., `useAuth.ts`, `formatCurrency.ts`)
- **Types:** PascalCase with `.types.ts` extension (e.g., `Portfolio.types.ts`)
- **Constants:** UPPER_SNAKE_CASE in files (e.g., `API_ENDPOINTS`)

### TypeScript Best Practices

- ✅ Prefer `type` over `interface` for type definitions
- ✅ Use type imports: `import type { User } from '@/types'`
- ✅ Avoid `any` - use `unknown` if type is truly unknown
- ✅ Define return types for functions when not obvious
- ✅ Use proper typing for React components:

  ```typescript
  type Props = {
    name: string;
    age: number;
  };

  export function UserProfile({ name, age }: Props) {
    // component code
  }
  ```

### React/Next.js Best Practices

- ✅ Use functional components with hooks
- ✅ Follow the "use client" directive for client components in Next.js
- ✅ Keep components small and focused
- ✅ Use Server Components by default, Client Components when needed
- ✅ Proper error boundaries for production code

### Styling with Tailwind CSS

- ✅ Use Tailwind utility classes
- ✅ Use `clsx` or `cn` for conditional classes
- ✅ Extract common patterns to components or use `cva` (class-variance-authority)
- ✅ Follow mobile-first approach (`sm:`, `md:`, `lg:`, etc.)

## Project Structure

```
investify/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── (dashboard)/  # Dashboard routes
│   │   ├── (public)/     # Public routes
│   │   └── api/          # API routes
│   ├── components/       # Shared components
│   ├── features/         # Feature-specific code
│   │   ├── auth/
│   │   ├── portfolio/
│   │   ├── schemes/
│   │   └── ...
│   ├── lib/              # Utility libraries
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── public/               # Static assets
├── scripts/              # Build/deployment scripts
├── docs/                 # Documentation
└── ...config files
```

## Available Scripts

| Command                | Description                        |
| ---------------------- | ---------------------------------- |
| `npm run dev`          | Start development server           |
| `npm run build`        | Build for production               |
| `npm run start`        | Start production server            |
| `npm run lint`         | Check for linting issues           |
| `npm run lint:fix`     | Auto-fix linting issues            |
| `npm run format`       | Format all files with Prettier     |
| `npm run format:check` | Check formatting without writing   |
| `npm run type-check`   | Check TypeScript types             |
| `npm run pre-commit`   | Run all pre-commit checks manually |
| `npm run check-all`    | Run all checks including tests     |
| `npm run test`         | Run tests                          |
| `npm run setup:hooks`  | Install Git hooks                  |

## Firebase Development

### Start Firebase Emulators

```bash
npm run emulators:start
```

This starts local Firebase emulators for testing authentication and Firestore.

### Data Ingestion Scripts

```bash
# Ingest mutual fund schemes data
npm run ingest:schemes

# Ingest portfolio data
npm run ingest:portfolio
```

## Troubleshooting

### Git Hook Not Running

```bash
# Re-run setup
npm run setup:hooks

# Verify hook is executable
ls -la .git/hooks/pre-commit
```

### Format/Lint Errors After Pull

```bash
# Auto-fix what's possible
npm run lint:fix
npm run format

# Check remaining issues
npm run check-all
```

### VS Code Not Formatting on Save

1. Ensure Prettier extension is installed and enabled
2. Check workspace settings are being used
3. Reload VS Code: Cmd/Ctrl + Shift + P → "Reload Window"
4. Verify `.vscode/settings.json` exists

### TypeScript Errors in Editor

1. Ensure VS Code is using workspace TypeScript version
2. Cmd/Ctrl + Shift + P → "TypeScript: Select TypeScript Version" → "Use Workspace Version"
3. Restart TS Server: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

### Import Sorting Not Working

1. Ensure `@trivago/prettier-plugin-sort-imports` is installed
2. Check `.prettierrc.json` has the plugin configured
3. Restart VS Code

## Getting Help

- **Questions about code?** Ask in team chat
- **Found a bug?** Create an issue
- **Need to discuss architecture?** Schedule a team meeting

## Contributing Best Practices

1. **Write clear commit messages**
   - Use present tense ("Add feature" not "Added feature")
   - Be descriptive but concise
   - Reference issue numbers when applicable

2. **Keep commits focused**
   - One logical change per commit
   - Don't mix refactoring with new features

3. **Test your changes**
   - Run `npm run check-all` before pushing
   - Test in browser for UI changes
   - Check both desktop and mobile views

4. **Keep PRs small**
   - Easier to review
   - Faster to merge
   - Less likely to have conflicts

## Next Steps

- Read the main README.md for project overview
- Explore the codebase structure
- Pick an issue to work on
- Ask questions when you're stuck!

Happy coding! 🚀
