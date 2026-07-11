# Create GitHub PR

Create a pull request from the current branch with all unpushed commits.

## Arguments
$ARGUMENTS

## Steps
1. Check current branch and unpushed commits
2. Push branch to origin
3. Create PR with descriptive title and body
4. Add appropriate labels and reviewers

## Template
```bash
git push -u origin HEAD
gh pr create --fill --base main
```