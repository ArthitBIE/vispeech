# Hookify Help

Get help with the hookify system.

## Arguments
$ARGUMENTS

## Quick Reference
```
hookify create <command> --deny --message "reason"     # Block a command
hookify create <command> --require-pattern <regex>     # Require pattern match
hookify create <command> --when <condition>            # Conditional rule
hookify list                                           # List all rules
hookify enable <id>                                    # Enable rule
hookify disable <id>                                   # Disable rule
hookify delete <id>                                    # Remove rule
```

## Conditions
- `branch == main` - Current branch name
- `file:*.ts` - File pattern being changed
- `env:CI == true` - Environment variable
- `time > 22:00` - Time-based rules