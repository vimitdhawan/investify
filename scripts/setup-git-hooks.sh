#!/bin/bash
# Script to set up Git hooks for code quality checks

HOOK_DIR=".git/hooks"
PRE_COMMIT_HOOK="$HOOK_DIR/pre-commit"

echo "🔧 Setting up Git hooks..."

# Check if .git directory exists
if [ ! -d ".git" ]; then
  echo "❌ Error: .git directory not found. Are you in the project root?"
  exit 1
fi

# Create pre-commit hook
cat > "$PRE_COMMIT_HOOK" << 'EOF'
#!/bin/sh
# Native Git pre-commit hook for code quality

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 Running pre-commit checks..."

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(js|jsx|ts|tsx|json|css|md)$')

if [ -z "$STAGED_FILES" ]; then
  echo "✅ No files to check"
  exit 0
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "${RED}❌ node_modules not found. Please run 'npm install'${NC}"
  exit 1
fi

# 1. TypeScript type checking
echo "📋 Running TypeScript type check..."
npm run type-check
if [ $? -ne 0 ]; then
  echo "${RED}❌ TypeScript type check failed${NC}"
  exit 1
fi
echo "${GREEN}✅ TypeScript check passed${NC}"

# 2. ESLint
echo "🔧 Running ESLint..."
npx eslint $STAGED_FILES
if [ $? -ne 0 ]; then
  echo "${RED}❌ ESLint check failed${NC}"
  echo "${YELLOW}💡 Run 'npm run lint:fix' to auto-fix issues${NC}"
  exit 1
fi
echo "${GREEN}✅ ESLint check passed${NC}"

# 3. Prettier
echo "💅 Checking Prettier formatting..."
npx prettier --check $STAGED_FILES
if [ $? -ne 0 ]; then
  echo "${RED}❌ Prettier formatting check failed${NC}"
  echo "${YELLOW}💡 Run 'npm run format' to auto-format${NC}"
  exit 1
fi
echo "${GREEN}✅ Prettier check passed${NC}"

# Tests are run in CI only, not in pre-commit hooks
# This allows faster local commits while ensuring quality in CI

echo "${GREEN}✨ All pre-commit checks passed!${NC}"
exit 0
EOF

# Make it executable
chmod +x "$PRE_COMMIT_HOOK"

echo "✅ Git hooks installed successfully!"
echo ""
echo "📝 Note: Pre-commit hook will run the following checks:"
echo "   - TypeScript type checking"
echo "   - ESLint validation"
echo "   - Prettier formatting"
echo ""
echo "ℹ️  Unit tests run in CI only (not pre-commit) for faster local development"
echo ""
echo "💡 To bypass hooks in emergency: git commit --no-verify"
echo "⚠️  Use --no-verify sparingly and fix issues in the next commit"
