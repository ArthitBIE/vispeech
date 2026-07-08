# Fix Plan: GSD Hardcoded Paths Pointing to Wrong Project

## Root Cause

vispeech's `.opencode/` was copy-pasted from `audience-intelligence-agent`. 143 files (`.md` + `.json`) contain hardcoded paths to `/home/atiyut/Documents/audience-intelligence-agent/` instead of `/home/atiyut/Documents/vispeech/`.

## What Breaks

- GSD workflow commands (validate, settings, stats, etc.) load templates, references, and agents from the wrong project
- `gsd-tools.cjs` fallback path falls through to the wrong project's binary
- Agent instructions point to wrong project for paths

## Fix Steps

### 1. Fix all `.md` files in `.opencode/` recursively

```bash
find /home/atiyut/Documents/vispeech/.opencode -name "*.md" \
  -exec sed -i 's|/home/atiyut/Documents/audience-intelligence-agent/|/home/atiyut/Documents/vispeech/|g' {} \;
```

### 2. Fix `opencode.json`

```bash
sed -i 's|/home/atiyut/Documents/audience-intelligence-agent/|/home/atiyut/Documents/vispeech/|g' \
  /home/atiyut/Documents/vispeech/.opencode/opencode.json
```

### 3. Verify

```bash
find /home/atiyut/Documents/vispeech/.opencode -type f \
  -exec grep -l "audience-intelligence-agent" {} \;
```

Expected: 0 files remaining.

## Files Affected

- `gsd-core/workflows/*.md` — ~30 files
- `gsd-core/references/*.md` — ~10 files
- `gsd-core/templates/*.md` — ~10 files
- `gsd-core/contexts/*.md` — ~2 files
- `gsd-core/workflows/**/*.md` (subdirectories) — ~8 files
- `command/*.md` — ~40 files
- `skills/*/SKILL.md` — ~40 files
- `agents/*.md` — ~33 files
- `opencode.json` — 1 file

## Not Changing

- `gsd-core/bin/` (binary files — the `gsd-tools.cjs` resolves paths via RUNTIME_DIR)
- `gsd-core/VERSION`
- `.planning/` files (those are project-specific and already correct)
- `src/` (application code unaffected)
- `node_modules/`
