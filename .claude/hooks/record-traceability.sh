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

CHANGED_FILES="$(git diff --name-only "origin/${BASE_BRANCH}...HEAD" 2>/dev/null || git diff --name-only "${BASE_BRANCH}...HEAD" 2>/dev/null || echo "")"

TEST_FILES="$(echo "$CHANGED_FILES" | grep -E '(test|spec)' || true)"

# Self-reported context: the agent is instructed (via CLAUDE.md or the skill
# prompt) to write this file as its last step, since it knows which schema
# tables it touched and why -- that's not recoverable from a diff alone.
SUMMARY_FILE=".claude/task-summary.json"
TABLES_TOUCHED="[]"
SUMMARY_TEXT=""
if [ -f "$SUMMARY_FILE" ]; then
  TABLES_TOUCHED="$(python3 -c "import json,sys; print(json.dumps(json.load(open('$SUMMARY_FILE')).get('tables_touched', [])))")"
  SUMMARY_TEXT="$(python3 -c "import json,sys; print(json.load(open('$SUMMARY_FILE')).get('summary', ''))")"
fi

mkdir -p .claude/traceability
OUT_FILE=".claude/traceability/${STORY_ID}.json"

python3 - "$OUT_FILE" "$STORY_ID" "$BRANCH" "$SUMMARY_TEXT" "$TABLES_TOUCHED" "$CHANGED_FILES" "$TEST_FILES" << 'PYEOF'
import json, sys
from datetime import datetime, timezone

out_file, story_id, branch, summary_text, tables_json, changed_files_raw, test_files_raw = sys.argv[1:8]

changed_files = [l for l in changed_files_raw.splitlines() if l.strip()]
test_files = [l for l in test_files_raw.splitlines() if l.strip()]

record = {
    "story_id": story_id,
    "branch": branch,
    "updated_at": datetime.now(timezone.utc).isoformat(),
    "files_changed": changed_files,
    "tests_added_or_changed": test_files,
    "schema_tables_touched": json.loads(tables_json),
    "agent_summary": summary_text,
}

with open(out_file, "w") as f:
    json.dump(record, f, indent=2)
    f.write("\n")

print(f"Wrote {out_file}")
PYEOF
