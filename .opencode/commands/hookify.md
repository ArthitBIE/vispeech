# Hookify - Create Behavioral Hooks

Create hooks to prevent unwanted behaviors in the development workflow.

## Arguments
$ARGUMENTS

## Usage
```bash
# Block git push without tests passing
hookify create "git push" --deny --message "Run tests first: npm test"

# Block direct commits to main
hookify create "git commit" --deny --when "branch == main" --message "Use PR workflow"

# Block rm -rf
hookify create "rm -rf" --deny --message "Use rm -f for files, rm -rf for dirs explicitly"

# Require conventional commits
hookify create "git commit" --require-pattern "^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+"
```

## Common Rules for This Project
- No direct pushes to main
- Tests must pass before push
- No rm -rf without explicit path
- Conventional commit messages
- No secrets in code