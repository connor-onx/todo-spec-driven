#!/usr/bin/env bash
# record-traceability.sh
#
# Intended to run as a Claude Code `Stop` hook (fires when a session ends).
# Writes/overwrites .claude/traceability/<STORY_ID>.json with:
#   - the story id (derived from the worktree branch name)
#   - every file changed relative to the base branch
#   - which of those look like test files
#   - a self-reported summary the agent writes before finishing
#     (schema tables touched, free-text summary) -- git diffs can't tell you
#     *which tables a change touches* or *why*, so the agent reports that itself
#
# Because this file lives inside the story's own branch, it travels with the
# PR and gets reviewed alongside the code. No shared file is touched, so two
# stories running in parallel worktrees never conflict on this.
#
# Wire it up in .claude/settings.json:
# {
#   "hooks": {
#     "Stop": [
#       { "hooks": [{ "type": "command", "command": ".claude/hooks/record-traceability.sh" }] }
#     ]
#   }
# }
#
# Also invoked from .githooks/pre-commit (every commit on a story branch)
# and from the /close-out skill. Uses `node` rather than `python3` for the
# JSON write, since node is already a hard requirement for this project.

set -euo pipefail

BASE_BRANCH="${BASE_BRANCH:-main}"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"

# Worktrees created with `claude --worktree JIRA-123` land on branch
# "worktree-JIRA-123" by default. This pulls out a JIRA-style key
# (PROJECT-123) wherever it appears in the branch name, so it also matches
# naming conventions like "story/JIRA-123-short-desc".
STORY_ID="$(echo "$BRANCH" | grep -oE '[A-Z]+-[0-9]+' | head -1)"

if [ -z "$STORY_ID" ]; then
  echo "record-traceability: could not derive a story id from branch '$BRANCH', skipping" >&2
  exit 0
fi

COMMITTED_CHANGED_FILES="$(git diff --name-only "origin/${BASE_BRANCH}...HEAD" 2>/dev/null || git diff --name-only "${BASE_BRANCH}...HEAD" 2>/dev/null || echo "")"

# Also fold in currently-staged changes. This matters when this script runs
# from a `pre-commit` hook: HEAD still points at the *previous* commit at
# that point, so a diff against HEAD alone would miss whatever is about to
# be committed. Unioning with the staged diff keeps the record accurate
# whether this runs standalone, from /close-out, or from pre-commit.
STAGED_CHANGED_FILES="$(git diff --cached --name-only 2>/dev/null || echo "")"

CHANGED_FILES="$(printf '%s\n%s\n' "$COMMITTED_CHANGED_FILES" "$STAGED_CHANGED_FILES" | sed '/^$/d' | sort -u)"

TEST_FILES="$(echo "$CHANGED_FILES" | grep -E '(test|spec)' || true)"

# Self-reported context: the agent is instructed (via CLAUDE.md or the skill
# prompt) to write this file as its last step, since it knows which schema
# tables it touched and why -- that's not recoverable from a diff alone.
SUMMARY_FILE=".claude/task-summary.json"
TABLES_TOUCHED="[]"
SUMMARY_TEXT=""
if [ -f "$SUMMARY_FILE" ]; then
  TABLES_TOUCHED="$(SUMMARY_FILE="$SUMMARY_FILE" node -e "
    const fs = require('fs')
    const data = JSON.parse(fs.readFileSync(process.env.SUMMARY_FILE, 'utf8'))
    process.stdout.write(JSON.stringify(data.tables_touched || []))
  ")"
  SUMMARY_TEXT="$(SUMMARY_FILE="$SUMMARY_FILE" node -e "
    const fs = require('fs')
    const data = JSON.parse(fs.readFileSync(process.env.SUMMARY_FILE, 'utf8'))
    process.stdout.write(data.summary || '')
  ")"
fi

mkdir -p .claude/traceability
OUT_FILE=".claude/traceability/${STORY_ID}.json"

STORY_ID="$STORY_ID" \
BRANCH="$BRANCH" \
SUMMARY_TEXT="$SUMMARY_TEXT" \
TABLES_JSON="$TABLES_TOUCHED" \
CHANGED_FILES="$CHANGED_FILES" \
TEST_FILES="$TEST_FILES" \
OUT_FILE="$OUT_FILE" \
node -e "
  const fs = require('fs')

  const changedFiles = process.env.CHANGED_FILES.split('\n').filter(Boolean)
  const testFiles = process.env.TEST_FILES.split('\n').filter(Boolean)

  const record = {
    story_id: process.env.STORY_ID,
    branch: process.env.BRANCH,
    updated_at: new Date().toISOString(),
    files_changed: changedFiles,
    tests_added_or_changed: testFiles,
    schema_tables_touched: JSON.parse(process.env.TABLES_JSON),
    agent_summary: process.env.SUMMARY_TEXT,
  }

  fs.writeFileSync(process.env.OUT_FILE, JSON.stringify(record, null, 2) + '\n')
  console.log('Wrote ' + process.env.OUT_FILE)
"
