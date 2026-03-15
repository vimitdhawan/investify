# CI/CD Documentation

## Overview

This project uses GitHub Actions for Continuous Integration (CI). The CI pipeline automatically runs on every pull request and push to main/develop branches to ensure code quality and prevent regressions.

## Architecture

We use a **simplified single-job workflow** that runs all checks sequentially. This approach:

- ✅ Eliminates complex caching issues between jobs
- ✅ Provides faster feedback with fail-fast behavior
- ✅ Simplifies debugging with linear execution
- ✅ Reduces CI complexity and maintenance

## Workflow

### CI Pipeline (`.github/workflows/ci.yml`)

A single comprehensive job that runs all quality checks in sequence.

#### Triggers

- **Pull Requests**: Runs on PRs targeting `main` or `develop` branches
- **Pushes**: Runs on direct pushes to `main` or `develop` branches

#### Execution Flow

The pipeline runs the following steps in order (fails fast on first error):

```
1. Setup
   ├─ Checkout code
   ├─ Setup Node.js 20.x
   ├─ Install dependencies (npm ci --legacy-peer-deps)
   └─ Verify critical dependencies

2. Code Quality Checks
   ├─ TypeScript type check (tsc --noEmit)
   ├─ ESLint code quality check
   └─ Prettier formatting check

3. Tests
   ├─ Run Jest tests with coverage
   └─ Upload coverage reports as artifacts

4. Build
   ├─ Build Next.js application (webpack mode)
   └─ Upload build artifacts on failure

5. Security
   └─ npm audit (non-blocking, continues on error)

6. Report
   ├─ Generate coverage summary
   ├─ Post/update PR comment with results
   └─ Generate GitHub job summary
```

#### What Gets Checked

| Check          | Command                | Blocks Merge | Timing  |
| -------------- | ---------------------- | ------------ | ------- |
| TypeScript     | `npm run type-check`   | Yes          | ~15-30s |
| ESLint         | `npm run lint`         | Yes          | ~10-20s |
| Prettier       | `npm run format:check` | Yes          | ~5-10s  |
| Tests          | `npm run test:ci`      | Yes          | ~30-60s |
| Build          | `npm run build`        | Yes          | ~60-90s |
| Security Audit | `npm audit`            | No\*         | ~5-10s  |

\*Security audit continues on error to avoid blocking PRs, but warnings are reported.

**Total Expected Time**: ~2-4 minutes

#### Environment Variables

All environment variables use test/demo values in CI:

```yaml
FIREBASE_EMULATOR_MODE: 'true'
FIREBASE_AUTH_EMULATOR_HOST: 'localhost:9099'
FIREBASE_STORAGE_EMULATOR_HOST: 'localhost:9199'
FIREBASE_EMULATOR_PROJECT_ID: 'demo-investify'
FIREBASE_PROJECT_ID: 'demo-investify'
FIREBASE_WEB_API_KEY: 'demo-api-key'
```

See `.env.example` for complete list and local development setup.

## Dependabot (`.github/dependabot.yml`)

Automated dependency updates to keep the project secure and up-to-date.

### Configuration

- **NPM Dependencies**: Weekly updates on Mondays at 09:00 UTC
- **GitHub Actions**: Weekly updates on Mondays at 09:00 UTC
- **PR Limit**: Max 10 npm PRs, 5 GitHub Actions PRs
- **Grouping**: Minor and patch updates grouped by type (production/development)
- **Labels**: Auto-labels PRs with `dependencies` and `automated`

## Node.js Version

The project uses **Node.js 20.x** for both development and CI.

- `.nvmrc` file documents the required version
- CI uses Node.js 20.x (specified in workflow)
- Use `nvm use` to switch to the correct version locally

## NPM Scripts

### CI-Specific Scripts

```bash
npm run ci:install      # Install dependencies with legacy-peer-deps flag
npm run ci:validate     # Run all validation checks (type, lint, format, test, build)
npm run test:ci         # Run tests in CI mode with coverage
```

### Development Scripts

```bash
npm run test            # Run tests once
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
npm run test:debug      # Run tests with Node debugger
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues automatically
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
npm run type-check      # Run TypeScript type checking
npm run build           # Build Next.js application
npm run check-all       # Run all checks locally
```

## Branch Protection Setup

To enforce CI checks before merging, configure branch protection rules:

### Steps

1. Go to **Settings** → **Branches** in GitHub repository
2. Click **Add rule** or edit existing rule for `main` branch
3. Configure the following settings:

#### Required Settings

- ✅ **Require a pull request before merging**
  - Require approvals: 1 (recommended)
  - Dismiss stale pull request approvals when new commits are pushed
- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging
  - Required status check:
    - `CI Pipeline` ← This is the single check to require
- ✅ **Require conversation resolution before merging**

- ✅ **Do not allow bypassing the above settings** (recommended)

#### Optional Settings

- Include administrators (recommended for consistency)
- Require linear history (optional, for cleaner git history)

## PR Comment Bot

The CI workflow automatically posts a comment on PRs with the status of all checks.

### Comment Format

```markdown
## ✅ CI Pipeline Results

**Status**: ✅ All checks passed!

### 📋 Checks Summary

| Check      | Status    |
| ---------- | --------- |
| TypeScript | ✅ Passed |
| ESLint     | ✅ Passed |
| Prettier   | ✅ Passed |
| Tests      | ✅ Passed |
| Build      | ✅ Passed |

### 📊 Test Coverage

- Lines: XX%
- Statements: XX%
- Functions: XX%
- Branches: XX%

---

🤖 Updated at [timestamp] | View Details
```

### Behavior

- Creates a new comment on first run
- Updates the same comment on subsequent commits
- Only appears on pull requests, not direct pushes
- Includes direct link to detailed check results

## Turbopack Configuration

**Turbopack is disabled** in this project for production builds.

### Why?

- Turbopack is experimental in Next.js 16
- Can cause build failures with certain node_modules (especially test files)
- Webpack is more stable and mature for production builds

### Configuration

In `next.config.ts`:

```typescript
experimental: {
  turbo: undefined,
}
```

In CI, we also set `TURBOPACK=0` environment variable during builds for extra safety.

## Troubleshooting

### Common Issues

#### 1. "npm ci" fails with peer dependency errors

**Solution**: The workflow uses `--legacy-peer-deps` flag to handle React 19 compatibility issues.

```bash
npm ci --legacy-peer-deps
```

#### 2. TypeScript errors in `.next` directory

**Solution**: Clean build artifacts and rebuild.

```bash
rm -rf .next
npm run build
```

#### 3. Tests pass locally but fail in CI

**Possible causes**:

- Environment variables not set correctly in CI
- Different Node.js version (CI uses 20.x)
- Timing issues in tests (use `jest.setTimeout()` if needed)
- Missing dependencies (check node_modules installation)

**Debug steps**:

```bash
# Use the same Node version as CI
nvm use 20

# Clean install dependencies
rm -rf node_modules
npm ci --legacy-peer-deps

# Run tests in CI mode
npm run test:ci
```

#### 4. Build fails with Turbopack errors

**Solution**: Turbopack is already disabled. If you see Turbopack errors:

```bash
# Ensure environment variable is set
export TURBOPACK=0
npm run build
```

#### 5. "jest: not found" error

**Solution**: All scripts now use `npx` prefix to ensure Jest is found.

```bash
# Instead of: jest
# Use: npx jest
npm run test:ci
```

#### 6. CI is slow or times out

**Possible causes**:

- npm cache not working
- Dependencies taking too long to install
- Tests running too slowly

**Solutions**:

```bash
# Check for slow tests locally
npm run test:ci -- --verbose

# Increase timeout for specific tests
jest.setTimeout(10000); // 10 seconds

# Optimize test performance
npm run test:ci -- --maxWorkers=2
```

### Debugging Failed CI Runs

1. **Check the workflow run logs** in GitHub Actions tab
   - Click on the failed job
   - Expand each step to see detailed logs
   - Look for error messages and stack traces

2. **Download artifacts** for local inspection
   - Coverage reports (always uploaded)
   - Build output (uploaded on failure)

3. **Reproduce locally** using the same commands as CI:

   ```bash
   # Use Node 20.x
   nvm use 20

   # Clean install
   rm -rf node_modules
   npm ci --legacy-peer-deps

   # Run all checks
   npm run ci:validate
   ```

4. **Check environment variables** if build-related failures occur
   - Compare local `.env.local` with CI environment variables
   - Check if any environment-specific code is breaking

5. **Review PR comments** for quick summary of failures
   - Bot comment shows which specific check failed
   - Click "View Details" for full logs

## Performance Metrics

### Expected CI Run Times

| Step            | Expected Time | Notes                   |
| --------------- | ------------- | ----------------------- |
| Setup & Install | 30-60s        | With npm cache          |
| TypeScript      | 15-30s        | Cached build info helps |
| ESLint          | 10-20s        | First run slower        |
| Prettier        | 5-10s         | Fast check              |
| Tests           | 30-60s        | Depends on test count   |
| Build           | 60-90s        | Next.js build           |
| Security Audit  | 5-10s         | Non-blocking            |
| Reporting       | 5-10s         | PR comment + summary    |

**Total**: ~2-4 minutes for full pipeline

### Optimization Tips

1. **Write focused, fast unit tests**
   - Avoid unnecessary setup/teardown
   - Mock external dependencies
   - Use `test.skip` for slow integration tests in CI

2. **Keep bundle size small**
   - Smaller bundles = faster builds
   - Use dynamic imports where possible
   - Regularly audit bundle size

3. **Regularly update dependencies**
   - Newer versions often include performance improvements
   - Review and merge Dependabot PRs

4. **Monitor cache hit rates**
   - Check workflow logs for cache hits/misses
   - npm cache should hit on most runs

5. **Optimize imports**
   - Use specific imports instead of barrel exports
   - Reduces TypeScript/ESLint processing time

## Caching Strategy

The CI pipeline uses GitHub Actions built-in npm caching:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20.x
    cache: 'npm' # Automatic npm cache
```

### How It Works

- Caches based on `package-lock.json` hash
- Automatically invalidates when dependencies change
- Shared across all workflow runs
- 7-day retention for unused caches

### Benefits

- Faster dependency installation (30-60s vs 2-3min)
- Reduced network usage
- More reliable than manual caching
- Zero configuration needed

## Artifacts

The workflow uploads artifacts for debugging:

### Coverage Reports

- **When**: After every test run
- **Retention**: 7 days
- **Contents**: Full coverage report in HTML and JSON formats
- **Access**: Download from workflow run page

### Build Artifacts

- **When**: Only on build failure
- **Retention**: 1 day
- **Contents**: `.next` directory for debugging
- **Access**: Download from workflow run page

## Future Enhancements

Potential improvements to consider:

### Short-term

1. **Coverage Thresholds**: Set minimum coverage requirements (e.g., 80%)
2. **Bundle Size Tracking**: Track and report bundle size changes
3. **Performance Budgets**: Add Lighthouse CI for performance monitoring

### Medium-term

4. **E2E Testing**: Add Playwright or Cypress for end-to-end tests
5. **Visual Regression**: Add screenshot comparison tests
6. **Parallel Test Execution**: Split tests across multiple runners for faster execution

### Long-term

7. **Deployment**: Add deployment workflows for staging/production
8. **Release Automation**: Add semantic-release for automated versioning
9. **Canary Deployments**: Add gradual rollout capabilities
10. **Performance Monitoring**: Integrate with monitoring services

## Best Practices

### For Developers

1. **Run checks locally before pushing**

   ```bash
   npm run check-all
   ```

2. **Use the pre-commit hook**

   ```bash
   npm run setup:hooks
   ```

3. **Keep PRs focused and small**
   - Faster CI runs
   - Easier to review
   - Less likely to break

4. **Write tests for new features**
   - Maintain or improve coverage
   - Prevent regressions
   - Document expected behavior

5. **Fix CI failures immediately**
   - Don't merge broken code
   - Don't let the team be blocked
   - Address issues while context is fresh

### For Reviewers

1. **Check CI status before reviewing**
   - Don't review failed PRs
   - Ask author to fix CI first

2. **Review the coverage report**
   - Check if new code is tested
   - Look for coverage decreases

3. **Check for security warnings**
   - Review npm audit results
   - Discuss security concerns

4. **Verify branch is up-to-date**
   - Ensure latest changes are tested
   - Rebase if needed

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Next.js Testing Documentation](https://nextjs.org/docs/testing)
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [Node.js Version Manager (nvm)](https://github.com/nvm-sh/nvm)

## Support

For questions or issues related to CI/CD setup:

1. **Check this documentation first** - Most common issues are documented above
2. **Review existing GitHub Actions runs** - Look for similar issues
3. **Check workflow logs** - Detailed error messages often point to the solution
4. **Open an issue** - Use the `ci-cd` label for CI/CD related issues
5. **Ask the team** - Someone may have encountered this before

## Changelog

### 2026-03-15 - Simplified CI/CD

- Simplified from multi-job to single-job workflow
- Disabled Turbopack for builds (stability)
- Standardized on Node.js 20.x
- Added `.nvmrc` for version documentation
- Updated all scripts to use `npx` prefix
- Removed separate merge-requirements workflow
- Improved PR comment bot formatting
- Added comprehensive documentation

### Initial Setup

- Created GitHub Actions workflows
- Added Dependabot configuration
- Configured test coverage reporting
- Set up PR comment bot
