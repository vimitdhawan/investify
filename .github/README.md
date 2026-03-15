# GitHub Configuration

This directory contains GitHub-specific configuration files for automated workflows and dependency management.

## Directory Structure

```
.github/
├── workflows/
│   └── ci.yml         # Single comprehensive CI pipeline
├── dependabot.yml     # Automated dependency updates
└── README.md          # This file
```

## CI Workflow

### Single-Job Pipeline (`workflows/ci.yml`)

A simplified, single-job workflow that runs all checks sequentially.

**Execution Flow:**

1. Setup (checkout, Node.js 20.x, install deps)
2. Code Quality (TypeScript, ESLint, Prettier)
3. Tests (Jest with coverage)
4. Build (Next.js with Webpack)
5. Security (npm audit)
6. Report (PR comment + job summary)

**Benefits:**

- ✅ Simple to understand and maintain
- ✅ Fails fast on first error
- ✅ No complex caching between jobs
- ✅ Linear execution for easier debugging
- ✅ Single status check for branch protection

**Expected Runtime:** ~2-4 minutes

## Dependabot

Automated dependency updates configuration:

- **NPM packages**: Weekly updates every Monday
- **GitHub Actions**: Weekly updates every Monday
- **Grouping**: Minor/patch updates grouped by type
- **PR Limits**: Max 10 npm + 5 actions PRs

## Documentation

For detailed information, see:

- [Comprehensive CI/CD Documentation](../docs/ci-cd.md)

## Quick Reference

### Node.js Version

- **CI**: Node.js 20.x
- **Local**: Use `nvm use` (reads `.nvmrc`)

### Environment Variables (CI)

All variables use test/demo values in CI:

```bash
FIREBASE_EMULATOR_MODE=true
FIREBASE_PROJECT_ID=demo-investify
FIREBASE_WEB_API_KEY=demo-api-key
```

See `.env.example` for complete list.

### NPM Scripts

```bash
npm run ci:validate     # Run all checks (like CI does)
npm run test:ci         # Run tests in CI mode
npm run check-all       # Run all checks with coverage
```

### Branch Protection Setup

**Required Status Check:** `CI Pipeline`

1. Go to **Settings** → **Branches**
2. Add protection rule for `main` branch
3. Enable "Require status checks to pass before merging"
4. Select: **"CI Pipeline"** ✅

That's it! Single check, simple setup.

## Troubleshooting

### Common Issues

**Tests fail in CI but pass locally:**

```bash
nvm use 20                      # Use same Node version
rm -rf node_modules             # Clean install
npm ci --legacy-peer-deps       # Install like CI
npm run test:ci                 # Run tests like CI
```

**Build fails with Turbopack errors:**

- Turbopack is disabled in `next.config.ts`
- CI sets `TURBOPACK=0` during builds
- If you see Turbopack errors, check your config

**"jest: not found" error:**

- All scripts use `npx` prefix now
- Run `npm ci --legacy-peer-deps` to reinstall

**CI is slow:**

- npm cache should hit after first run
- Check for slow tests: `npm run test:ci -- --verbose`
- Optimize test performance if needed

### Debugging

1. **Check workflow logs** - Click on failed job in Actions tab
2. **Download artifacts** - Coverage reports available for 7 days
3. **Reproduce locally** - Use `npm run ci:validate`
4. **Review PR comment** - Shows which check failed

## Key Features

### 1. Fail Fast

Pipeline stops at first failure for quick feedback.

### 2. PR Comment Bot

Automatically posts/updates PR comments with:

- Status of all checks
- Coverage summary
- Link to detailed results

### 3. Artifacts

- Coverage reports (7 day retention)
- Build output on failure (1 day retention)

### 4. Security

- npm audit runs on every build
- Non-blocking (continues on error)
- Results shown in logs and PR comment

## Best Practices

1. **Run checks before pushing:**

   ```bash
   npm run check-all
   ```

2. **Use pre-commit hooks:**

   ```bash
   npm run setup:hooks
   ```

3. **Keep PRs small** - Faster CI, easier reviews

4. **Write tests** - Maintain coverage

5. **Fix CI immediately** - Don't let it stay red

## Resources

- [Full CI/CD Documentation](../docs/ci-cd.md)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Dependabot Docs](https://docs.github.com/en/code-security/dependabot)
