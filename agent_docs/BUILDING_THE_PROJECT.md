# Building the Project

Development setup, building, and deployment instructions for Investify.

## Development Environment Setup

### Prerequisites

- **Node.js 20.x** - Check `.nvmrc` for required version
- **npm** - Comes with Node.js
- **Firebase CLI** - For running emulators locally
- **nvm** (optional) - For managing Node.js versions

### Initial Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd investify
   ```

2. **Use correct Node.js version**

   ```bash
   # If using nvm
   nvm use

   # If not using nvm, manually install Node.js 20.x
   ```

3. **Install dependencies**

   ```bash
   npm install --legacy-peer-deps
   ```

   The `--legacy-peer-deps` flag is required for React 19 compatibility.

4. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

5. **Start Firebase emulators** (in one terminal)

   ```bash
   npm run emulators:start
   ```

6. **Start development server** (in another terminal)

   ```bash
   npm run dev
   ```

   Dev server will be available at `http://localhost:3000`

### Environment Variables

Create `.env.local` based on `.env.example`:

| Variable                         | Purpose                   | Development    | Notes                       |
| -------------------------------- | ------------------------- | -------------- | --------------------------- |
| `FIREBASE_PROJECT_ID`            | Firebase project ID       | demo-investify | Used in emulator mode       |
| `FIREBASE_WEB_API_KEY`           | Firebase web API key      | demo-api-key   | For authentication          |
| `FIREBASE_EMULATOR_MODE`         | Use Firebase emulators    | `true`         | Set to false for production |
| `FIREBASE_AUTH_EMULATOR_HOST`    | Auth emulator endpoint    | localhost:9099 | Must match emulator port    |
| `FIREBASE_STORAGE_EMULATOR_HOST` | Storage emulator endpoint | localhost:9199 | Must match emulator port    |
| `FIREBASE_EMULATOR_PROJECT_ID`   | Emulator project ID       | demo-investify | Separate from production    |

See `.env.example` for complete list.

### Firebase Emulator Setup

#### Starting Emulators

```bash
npm run emulators:start
```

This command:

- Starts Firebase Auth emulator (port 9099)
- Starts Firebase Storage emulator (port 9199)
- Imports initial data from `./firebase-data` directory (if exists)
- Auto-exports data on exit to `./firebase-data` (for persistence)

#### Emulator UI

Firebase Emulator Suite UI available at: `http://localhost:4000`

Use this to:

- Browse Firestore data
- Manage auth users
- View emulator logs
- Delete/reset data

#### Resetting Emulator Data

Stop the emulator and delete the data directory:

```bash
rm -rf firebase-data
npm run emulators:start  # Starts with clean state
```

## Data Ingestion Scripts

Commands for importing and syncing mutual fund data with the Firebase emulator:

| Command                    | Purpose                        |
| -------------------------- | ------------------------------ |
| `npm run ingest:schemes`   | Ingest mutual fund scheme data |
| `npm run ingest:portfolio` | Ingest portfolio data          |
| `npm run ingest:holdings`  | Ingest holdings data           |
| `npm run nav:sync`         | Sync current NAV data          |
| `npm run nav:import`       | Import historical NAV data     |

These scripts populate the Firebase emulator with test data for local development.

**Usage:**

```bash
# Start emulator first
npm run emulators:start

# In another terminal, run ingest scripts
npm run ingest:schemes
npm run ingest:portfolio
npm run nav:sync
```

## Development Server

### Normal Development Mode

```bash
npm run dev
```

- Starts Next.js dev server on `http://localhost:3000`
- File changes auto-refresh (Fast Refresh for React)
- No manual restart needed
- TypeScript and ESLint errors shown in terminal and browser

### Debug Mode

To debug with Node inspector:

```bash
node --inspect-brk ./node_modules/.bin/next dev
```

Then:

1. Open Chrome and visit: `chrome://inspect`
2. Click "Inspect" on the target process
3. Set breakpoints and step through code

### Port Configuration

If port 3000 is already in use:

```bash
PORT=3001 npm run dev
```

## Building for Production

### Build Command

```bash
npm run build
```

Creates optimized production bundle:

- Output directory: `.next/`
- Compiles TypeScript
- Optimizes images and assets
- Bundles and minifies JavaScript
- Note: Turbopack is disabled (uses Webpack for stability)

### Build Output

| Path                             | Contents                           |
| -------------------------------- | ---------------------------------- |
| `.next/static/`                  | Static assets (CSS, fonts, images) |
| `.next/server/`                  | Server-side code and components    |
| `.next/app-render-manifest.json` | Route manifest                     |

### Pre-build Validation

Always run these checks before building:

```bash
npm run check-all
```

This runs:

1. TypeScript type checking
2. ESLint code quality check
3. Prettier format check
4. Full test suite with coverage

Fix any issues before running `npm run build`.

### Starting Production Server

After building, start the production server:

```bash
npm start
```

This runs the optimized production build (much faster than dev mode).

## Production Deployment

### Deployment Platform: Vercel (Planned)

TODO: Full Vercel deployment setup planned.

**Planned setup includes:**

- Automatic deployments on push to main/develop
- Environment variables configuration
- Preview deployments for pull requests
- Performance monitoring

**For now:**

- Build locally: `npm run build`
- Test production build: `npm start`

### Database in Production

TODO: Production Firebase project setup required before deployment.

## CI/CD Pipeline

GitHub Actions workflow automatically validates code on PRs and pushes.

### Pipeline Overview

The workflow (`.github/workflows/ci.yml`) runs these steps:

1. **Setup** - Checkout code, Node 20.x, install dependencies
2. **Quality** - TypeScript check, ESLint, Prettier format check
3. **Tests** - Jest with coverage reporting
4. **Build** - Next.js production build
5. **Security** - npm audit (non-blocking)
6. **Report** - PR comment with results

### Key Commands

Run CI validation locally before pushing:

```bash
# Quick validation
npm run check-all

# Full CI pipeline
npm run ci:validate
```

### Timing

Expected CI pipeline duration: **2-4 minutes total**

- Setup & Install: 30-60s
- TypeScript: 15-30s
- ESLint: 10-20s
- Prettier: 5-10s
- Tests: 30-60s
- Build: 60-90s
- Security Audit: 5-10s

### Troubleshooting CI Failures

See `docs/ci-cd.md` for detailed troubleshooting guide.

## Performance Optimization

### Next.js Best Practices

#### Server Components (Default)

All components are Server Components by default - they run on the server and don't add JavaScript to the bundle:

```typescript
// No 'use client' - this is a Server Component
export default function Dashboard({ userId }: { userId: string }) {
  // Can use await, access database directly
  const data = await fetchData(userId);
  return <div>{data}</div>;
}
```

**Benefits:**

- Smaller bundle size
- Faster initial page load
- Direct database access (no API needed)
- More secure (sensitive data stays on server)

#### Code Splitting

Code is automatically split by route, but you can optimize further:

```typescript
// Lazy load a heavy component
import dynamic from 'next/dynamic';

const ExpensiveChart = dynamic(() => import('@/components/chart'), {
  loading: () => <div>Loading...</div>,
  ssr: false, // Only load on client if needed
});
```

#### Image Optimization

Always use Next.js Image component:

```typescript
import Image from 'next/image';

export function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="Logo"
      width={200}
      height={100}
      priority // Preload above-fold images
    />
  );
}
```

**Benefits:**

- Automatic format conversion (WebP, AVIF)
- Responsive sizing
- Lazy loading by default
- Automatic srcset generation

#### Data Fetching

Optimize with Server Components:

```typescript
// ✅ Correct - fetch on server
export async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId); // Server-side, no extra API call
  return <div>{user.name}</div>;
}

// ❌ Avoid - fetch on client (slower, more code)
export default function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    fetchUser(userId).then(setUser); // Extra request
  }, [userId]);
  return <div>{user?.name}</div>;
}
```

#### Caching

Use React's cache function for expensive operations:

```typescript
import { cache } from 'react';

const getUser = cache(async (id: string) => {
  // Only fetches once per request, reused across components
  return db.user.get(id);
});
```

#### Cache Invalidation

Use `revalidatePath()` after mutations:

```typescript
'use server';

export async function updateGoal(goalId: string, data: unknown) {
  await updateGoalInDb(goalId, data);
  revalidatePath('/goals'); // Regenerate /goals page
  revalidatePath(`/goals/${goalId}`); // Regenerate goal detail page
}
```

### Bundle Analysis

Analyze bundle size:

```bash
npm run build
npx @next/bundle-analyzer
```

This generates an interactive visualization of your bundle.

## Troubleshooting

### Common Issues and Solutions

#### 1. npm install fails with peer dependency errors

**Cause:** React 19 has peer dependency conflicts

**Solution:**

```bash
npm install --legacy-peer-deps
```

#### 2. Firebase emulator connection refused

**Cause:** Emulator not running or wrong port

**Solution:**

```bash
# Terminal 1: Start emulator first
npm run emulators:start

# Terminal 2: Start dev server (after emulator is ready)
npm run dev

# Verify emulator is running
curl http://localhost:9099  # Auth emulator
curl http://localhost:9199  # Storage emulator
```

#### 3. Port 3000 already in use

**Cause:** Another process using port 3000

**Solution:**

```bash
# Option 1: Use different port
PORT=3001 npm run dev

# Option 2: Kill process using port 3000
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows (find PID and kill)
```

#### 4. TypeScript errors in `.next` directory

**Cause:** Corrupted or stale build artifacts

**Solution:**

```bash
rm -rf .next
npm run build
```

#### 5. Environment variables not loading

**Cause:** `.env.local` missing or incorrect

**Solution:**

```bash
# Copy template and edit
cp .env.example .env.local

# Verify variables are set
echo $FIREBASE_PROJECT_ID  # Should output project ID

# Restart dev server after changing env vars
# (Kill and run npm run dev again)
```

#### 6. Tests pass locally but fail in CI

**Cause:** Different Node.js version or environment

**Solution:**

```bash
# Use same Node version as CI
nvm use 20

# Clean install
rm -rf node_modules
npm install --legacy-peer-deps

# Run tests in CI mode
npm run test:ci
```

### Debug Tips

#### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    }
  ]
}
```

Then press F5 to debug.

#### Chrome DevTools

1. Run: `node --inspect ./node_modules/.bin/next dev`
2. Open: `chrome://inspect`
3. Click "Inspect" on Node process
4. Set breakpoints and step through

#### Test Debugging

```bash
# Run tests with Node inspector
npm run test:debug

# Then open chrome://inspect and select test process
```

#### Emulator UI

Visit `http://localhost:4000` to browse:

- Firestore collections and documents
- Auth users and sessions
- Storage files
- Emulator logs

## Related Documentation

- [RUNNING_TESTS.md](RUNNING_TESTS.md) - Testing strategies and running tests
- [ARCHITECTURE.md](ARCHITECTURE.md) - Understanding the codebase structure
- [CODE_CONVENTIONS.md](CODE_CONVENTIONS.md) - Code quality and style standards
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Firestore collections and data models
