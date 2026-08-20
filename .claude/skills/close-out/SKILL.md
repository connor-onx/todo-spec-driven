---
name: close-out
description: Close out a story on its feature branch - refresh the traceability record, push, open (or reuse) the PR against main, and comment the PR link on the linked Jira issue. Does not change the issue's status - opening a PR doesn't mean the story has moved in the workflow.
---

# Close Out a Story

Run this when a story's work is finished and ready to hand off for review.
Unlike the `Stop` hook (which fires on nearly every turn and only does the
cheap, local, idempotent traceability write), this skill performs real
actions on shared systems -- git push, opening a GitHub PR, commenting on
and possibly transitioning a Jira issue -- so it only runs when explicitly
invoked as `/close-out`, never automatically.

It is safe to re-run: it reuses an existing PR instead of duplicating one,
and won't post a duplicate Jira comment for the same PR URL.

## Steps

### 1. Determine the story ID

- `git rev-parse --abbrev-ref HEAD` for the current branch name.
- Extract the story ID with the same pattern `.claude/hooks/record-traceability.sh`
  uses: one or more uppercase letters, a hyphen, then digits (`[A-Z]+-[0-9]+`),
  taking the first match anywhere in the branch name.
- If no story ID is found, tell the user and stop. Don't guess.

### 2. Refresh the traceability record

- Run `.claude/hooks/record-traceability.sh` so
  `.claude/traceability/<STORY_ID>.json` reflects the current diff against
  `origin/main` (fall back to `main` if `origin/main` isn't fetched).
- Check `git status --porcelain` for that file. If it's new or changed,
  `git add` it and commit: `<STORY_ID>: update traceability record`. If
  there's nothing to commit, skip -- never create an empty commit.

### 3. Push the branch

- Tell the user what's about to be pushed (branch name, whether it already
  has an upstream) before doing it -- this touches the shared remote.
- `git push` if upstream is already set, otherwise
  `git push -u origin <branch>`.

### 4. Open or reuse the PR

- Check for an existing PR on this branch first:
  `gh pr view <branch> --json url,state`. If one exists and is open, reuse
  its URL -- do not create a duplicate.
- If `gh` isn't installed or isn't authenticated, tell the user exactly
  that (e.g. "gh CLI isn't available -- install it and run `gh auth login`,
  or give me a PR URL directly") and stop before this step rather than
  failing silently. Still offer to continue with the Jira step below if the
  user can supply a PR URL manually.
- Otherwise create one:
  `gh pr create --base main --head <branch> --title "<STORY_ID>: <summary>" --body "<body>"`.
  - Title: `<STORY_ID>: <latest commit subject, minus the story-id prefix>`,
    matching git-conventions.md's rule that the PR title is generated from
    the story ID and the latest commit message.
  - Body: what changed, the schema tables touched (from this story's
    `.claude/traceability/<STORY_ID>.json` -> `schema_tables_touched`), and
    a link to the Jira issue (`https://cbts.atlassian.net/browse/<STORY_ID>`)
    -- per git-conventions.md's PR description requirements.

### 5. Comment on the Jira issue

Use the Atlassian MCP tools already authenticated in this session
(`getJiraIssue`, `addCommentToJiraIssue`) -- never a stored Jira API token
for this.

- Opening a PR does not mean the story has moved in the workflow -- if it
  was in whatever status it was in before (e.g. still in dev/in progress),
  it stays there. **Never transition the issue's status as part of this
  skill.** Status changes happen separately, driven by the person/process
  that owns the workflow, not by a PR existing.
- Fetch the issue (`getJiraIssue`, including `comment` in `fields`) and
  check its existing comments for one that already contains this exact PR
  URL -- skip posting if so, so re-running the skill after the PR already
  exists doesn't spam duplicate comments.
- Otherwise, post a comment on the issue with the PR URL (e.g.
  "PR opened: <url>") via `addCommentToJiraIssue`.

## Guardrails

- Confirm the story ID, branch, and what's about to happen (push, PR
  open/reuse, Jira comment) before taking the push/PR/Jira actions -- these
  are visible to teammates and not fully reversible.
- Idempotent by design at every external step: check before acting (existing
  PR, existing comment) rather than assuming this is the first time it's
  been run for this story.
- Opening a PR is not a workflow-status event. This skill only comments;
  it never transitions the Jira issue.
- Never hardcode, request, or paste real GitHub or Jira credentials.
  GitHub auth comes from `gh`'s own login state; Jira auth comes from this
  session's already-authenticated Atlassian MCP connection.
