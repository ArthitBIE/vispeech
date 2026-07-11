# Setup Pre-Commit Hooks

Set up Husky pre-commit hooks with lint-staged, type checking, and tests.

## Arguments
$ARGUMENTS

## What This Does
1. Installs husky and lint-staged
2. Configures pre-commit hook to run:
   - `lint-staged` (Prettier on staged files)
   - Type checking (tsc --noEmit)
   - Unit tests (vitest run)
3. Adds prepare script for automatic husky install

## Commands
```bash
npm install -D husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged && npx tsc --noEmit && npm run test:unit"
```

## Package.json Addition
```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx,json,md,css}": ["prettier --write"]
  }
}
```