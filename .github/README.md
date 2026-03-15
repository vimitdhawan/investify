# GitHub Configuration

This directory contains GitHub-specific configuration files for automated workflows and dependency management.

## Directory Structure

```
.github/
├── workflows/          # GitHub Actions workflow definitions
│   ├── ci.yml         # Main CI pipeline
│   └── merge-requirements.yml  # PR merge gate
├── dependabot.yml     # Automated dependency updates
└── README.md          # This file
```

## Workflows

### CI Workflow (`workflows/ci.yml`)

Comprehensive CI pipeline that runs on every PR and push to main/develop branches.

**Jobs:**

- Install Dependencies
- ESLint (code quality)
- TypeScript (type checking)
- Prettier (code formatting)
- Security Audit (vulnerability scanning)
- Unit Tests (with coverage on Node 18.x and 20.x)
- Build Verification
- PR Comment Bot (results summary)

### Merge Requirements (`workflows/merge-requirements.yml`)

Single status check that verifies all CI checks have passed before allowing PR merge.

**Purpose:**

- Simplifies branch protection rules
- Ensures all quality gates are met
- Provides clear feedback on blocking issues

## Dependabot

Automated dependency updates configuration for:

- **NPM packages**: Weekly updates every Monday
- **GitHub Actions**: Weekly updates every Monday
- **Grouping**: Minor/patch updates grouped by type
- **PR Limits**: Max 10 npm + 5 actions PRs

## Documentation

For detailed information about CI/CD setup, troubleshooting, and best practices, see:

- [CI/CD Documentation](../docs/ci-cd.md)

## Quick Reference

### Required Environment Variables (CI)

All variables use test/demo values in CI:

- `FIREBASE_EMULATOR_MODE=true`
- `FIREBASE_PROJECT_ID=demo-investify`
- `FIREBASE_WEB_API_KEY=demo-api-key`

See `.env.example` for complete list.

### NPM Scripts for CI

```bash
npm run ci:install      # Install deps with legacy-peer-deps
npm run ci:validate     # Run all validation checks
npm run test:ci         # Run tests in CI mode
```

### Setting Up Branch Protection

1. Go to **Settings** → **Branches**
2. Add protection rule for `main` branch
3. Enable "Require status checks to pass before merging"
4. Select required check: **"All Checks Passed"**

## Troubleshooting

Common issues and solutions:

**Tests fail in CI but pass locally:**

- Check Node version (CI uses 18.x and 20.x)
- Verify environment variables are set correctly
- Review workflow logs in Actions tab

**Build fails with memory errors:**

- Adjust `maxWorkers` in `test:ci` script
- Check cache configuration

**Dependabot PRs not appearing:**

- Verify dependabot.yml syntax
- Check GitHub repository settings
- Review Dependabot logs in Insights → Dependency graph

## Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Dependabot Docs](https://docs.github.com/en/code-security/dependabot)
- [Project CI/CD Docs](../docs/ci-cd.md)
