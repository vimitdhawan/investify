# CI/CD Documentation

## Overview

This project uses GitHub Actions for Continuous Integration (CI) and Continuous Deployment (CD). The CI pipeline automatically runs on every pull request and push to main/develop branches to ensure code quality and prevent regressions.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

The main CI workflow runs multiple jobs in parallel to verify code quality, tests, and build status.

#### Triggers

- **Pull Requests**: Runs on PRs targeting `main` or `develop` branches
- **Pushes**: Runs on direct pushes to `main` or `develop` branches

#### Jobs

##### Install Dependencies

- Installs npm packages using `npm ci --legacy-peer-deps`
- Caches `node_modules` based on `package-lock.json` hash
- Runs first and provides cached dependencies to all other jobs

##### ESLint (Code Quality)

- Runs ESLint to check for code quality issues
- Uses ESLint cache for faster subsequent runs
- Fails if any linting errors are found

##### TypeScript (Type Safety)

- Runs TypeScript compiler in check mode (`tsc --noEmit`)
- Verifies all types are correct without generating output
- Caches TypeScript build info for faster checks

##### Prettier (Code Formatting)

- Checks code formatting using Prettier
- Ensures consistent code style across the project
- Fails if any files are not properly formatted

##### Security Audit

- Runs `npm audit` to check for known vulnerabilities
- Only checks production dependencies
- Fails on moderate or higher severity issues
- Set to `continue-on-error: true` to not block PRs

##### Unit Tests

- Runs Jest tests with coverage reporting
- Tests on both Node.js 18.x and 20.x
- Uses `--ci` flag for optimized CI performance
- Limits to 2 workers to prevent resource exhaustion
- Uploads coverage reports as artifacts
- Coverage reports retained for 7 days

##### Build Verification

- Runs Next.js production build
- Ensures the application can be built successfully
- Caches Next.js build cache for faster builds
- Uploads build artifacts for debugging

##### Report Results

- Runs after all other jobs complete
- Posts a summary comment on the PR with results
- Updates existing comment instead of creating new ones
- Includes coverage summary if available
- Only runs on pull requests

### 2. Merge Requirements Workflow (`.github/workflows/merge-requirements.yml`)

This workflow acts as a single required status check for branch protection.

#### Triggers

- Pull request events: `opened`, `synchronize`, `reopened`, `edited`
- Only on PRs targeting `main` or `develop`

#### Purpose

- Waits for all CI checks to complete
- Verifies all required checks have passed
- Provides a single status check for branch protection
- Simplifies branch protection rule configuration

#### Required Checks

- ✅ ESLint (code quality)
- ✅ TypeScript (type safety)
- ✅ Prettier (code formatting)
- ✅ Unit Tests (functionality)
- ✅ Build (production readiness)
- ✅ Security Audit (vulnerability scan)

### 3. Dependabot (`.github/dependabot.yml`)

Automated dependency updates to keep the project secure and up-to-date.

#### Configuration

- **NPM Dependencies**: Weekly updates on Mondays at 09:00 UTC
- **GitHub Actions**: Weekly updates on Mondays at 09:00 UTC
- **PR Limit**: Max 10 npm PRs, 5 GitHub Actions PRs
- **Grouping**: Minor and patch updates grouped by type (production/development)
- **Labels**: Auto-labels PRs with `dependencies` and `automated`

## Environment Variables

The following environment variables are used in CI:

### Required for Build

All environment variables use test/demo values in CI. See `.env.example` for full list.

```yaml
FIREBASE_EMULATOR_MODE: 'true'
FIREBASE_AUTH_EMULATOR_HOST: 'localhost:9099'
FIREBASE_STORAGE_EMULATOR_HOST: 'localhost:9199'
FIREBASE_EMULATOR_PROJECT_ID: 'demo-investify'
FIREBASE_PROJECT_ID: 'demo-investify'
FIREBASE_WEB_API_KEY: 'demo-api-key'
```

## NPM Scripts

### CI-Specific Scripts

- `npm run ci:install` - Install dependencies with legacy peer deps flag
- `npm run ci:validate` - Run all validation checks (type-check, lint, format, test, build)
- `npm run test:ci` - Run tests in CI mode with coverage

### Development Scripts

- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:debug` - Run tests with Node debugger
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run build` - Build Next.js application
- `npm run check-all` - Run all checks locally

## Caching Strategy

The CI pipeline uses multiple caching layers for optimal performance:

### 1. Node Modules Cache

- **Key**: `${{ runner.os }}-node-${{ env.NODE_VERSION }}-${{ hashFiles('package-lock.json') }}`
- **Path**: `node_modules`
- **Purpose**: Avoid reinstalling dependencies on every run

### 2. Next.js Build Cache

- **Key**: `nextjs-${{ runner.os }}-${{ hashFiles('package-lock.json') }}-${{ hashFiles('**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx') }}`
- **Path**: `.next/cache`
- **Purpose**: Speed up Next.js builds

### 3. Jest Cache

- **Key**: `jest-${{ runner.os }}-${{ matrix.node-version }}-${{ hashFiles('jest.config.js') }}`
- **Path**: `.jest-cache`
- **Purpose**: Speed up test runs

### 4. ESLint Cache

- **Key**: `eslint-${{ runner.os }}-${{ hashFiles('eslint.config.mjs') }}`
- **Path**: `.eslintcache`
- **Purpose**: Speed up linting

### 5. TypeScript Cache

- **Key**: `typescript-${{ runner.os }}-${{ hashFiles('tsconfig.json') }}`
- **Path**: `*.tsbuildinfo`
- **Purpose**: Speed up type checking

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
  - Required status checks:
    - `All Checks Passed` (from merge-requirements.yml)
- ✅ **Require conversation resolution before merging**

- ✅ **Do not allow bypassing the above settings** (recommended)

#### Optional Settings

- Include administrators (recommended for consistency)
- Require linear history (optional, for cleaner git history)

## PR Comment Bot

The CI workflow automatically posts a comment on PRs with the status of all checks.

### Comment Format

```
🤖 CI Results

| Check | Status |
|-------|--------|
| ESLint | ✅ Passed |
| TypeScript | ✅ Passed |
| Prettier | ✅ Passed |
| Tests | ✅ Passed |
| Build | ✅ Passed |
| Security Audit | ✅ Passed |

📊 Test Coverage
- Lines: XX%
- Statements: XX%
- Functions: XX%
- Branches: XX%

---
Updated at [timestamp]
```

### Behavior

- Creates a new comment on first run
- Updates the same comment on subsequent commits
- Only appears on pull requests, not direct pushes

## Troubleshooting

### Common Issues

#### 1. "npm ci" fails with peer dependency errors

**Solution**: The workflow uses `--legacy-peer-deps` flag to handle React 19 compatibility issues.

#### 2. TypeScript errors in `.next` directory

**Solution**: The CI uses clean builds. Locally, run `rm -rf .next && npm run build` to reproduce.

#### 3. Tests pass locally but fail in CI

**Possible causes**:

- Environment variables not set correctly in CI
- Different Node.js version (CI uses 18.x and 20.x)
- Timing issues in tests (use `jest.setTimeout()` if needed)

#### 4. Build fails with memory errors

**Solution**: The workflow is configured to limit workers. If needed, adjust `maxWorkers` in test:ci script.

#### 5. Cache not being used

**Possible causes**:

- `package-lock.json` was modified
- Cache key changed (config file was updated)
- Cache expired (7-day retention by default)

### Debugging Failed CI Runs

1. **Check the workflow run logs** in GitHub Actions tab
2. **Download artifacts** (coverage reports, build output) for local inspection
3. **Reproduce locally** using the same commands as CI:
   ```bash
   npm run ci:install
   npm run type-check
   npm run lint
   npm run format:check
   npm run test:ci
   npm run build
   ```
4. **Check environment variables** if build-related failures occur
5. **Review PR comments** for quick summary of failures

## Performance Metrics

### Expected CI Run Times

- **Install Dependencies**: ~30-60 seconds (with cache)
- **ESLint**: ~10-20 seconds
- **TypeScript**: ~15-30 seconds
- **Prettier**: ~5-10 seconds
- **Security Audit**: ~5-10 seconds
- **Unit Tests**: ~30-60 seconds (per Node version)
- **Build**: ~60-90 seconds (with cache)
- **Report**: ~5-10 seconds

**Total Expected Time**: ~3-5 minutes for full pipeline

### Optimization Tips

1. Write focused, fast unit tests
2. Use test.skip for slow integration tests in CI
3. Keep bundle size small to speed up builds
4. Regularly update dependencies to get performance improvements
5. Monitor cache hit rates in workflow logs

## Future Enhancements

Potential improvements to consider:

1. **E2E Testing**: Add Playwright or Cypress for end-to-end tests
2. **Visual Regression Testing**: Add screenshot comparison tests
3. **Performance Monitoring**: Add Lighthouse CI for performance budgets
4. **Bundle Size Analysis**: Track and report bundle size changes
5. **Deployment**: Add deployment workflows for staging/production
6. **Release Automation**: Add semantic-release for automated versioning
7. **Code Coverage Enforcement**: Set minimum coverage thresholds
8. **Parallel E2E Tests**: Run E2E tests in parallel for faster feedback

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Next.js Testing Documentation](https://nextjs.org/docs/testing)
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)

## Contact

For questions or issues related to CI/CD setup, please:

1. Check this documentation first
2. Review existing GitHub Actions runs for similar issues
3. Open an issue in the repository with the `ci-cd` label
