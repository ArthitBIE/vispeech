# Review Pull Request

Review PR changes with a structured checklist.

## Arguments
$ARGUMENTS

## Checklist
- [ ] Code follows project conventions (lint, typecheck pass)
- [ ] Tests pass (unit, integration, E2E)
- [ ] No security issues (secrets, injection, auth bypass)
- [ ] Changes match the PR description / linked issue
- [ ] No unnecessary complexity (ponytail: YAGNI, stdlib first)
- [ ] Documentation updated if needed
- [ ] Breaking changes noted

## Process
1. Run `rtk lint` and `rtk tsc` (or project equivalents)
2. Run test suite
3. Review diff for each file
4. Comment on any issues found
5. Approve or request changes