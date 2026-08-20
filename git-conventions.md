# Git Conventions

Branch names carry the story ID. The traceability hook and the automatic
PR step both depend on pulling that ID out of the branch name — follow
this exactly, or both silently fail to identify which story a branch
belongs to.

## Pattern the tooling expects

Anywhere in the branch name: one or more uppercase letters, a hyphen,
then digits — e.g. `JIRA-123`, `CAE-42`, `FT-7`. This matches whatever
your actual Jira project key is.

## Branch naming

**Single implementation** (manual feature branches):
`<STORY-ID>-short-kebab-description`

Example: `JIRA-123-checkout-total`

**Worktrees**: auto-named `worktree-<STORY-ID>` by
`claude --worktree <STORY-ID>`. Don't rename these before merge — the
hook parses this exact format.

## Commit messages

Format: `<STORY-ID>: <what changed, present tense>`

Example: `JIRA-123: add checkout total calculation`

One story per PR where reasonably possible. If a story genuinely needs
multiple PRs, link them and say so in the story.

## PR titles and descriptions

Use the `/close-out` skill (`.claude/skills/close-out/SKILL.md`) to push
the branch and open (or reuse) the PR. It generates the title from the
story ID and the latest commit message — which only works if commits
follow the format above.

Description should include: what changed, which schema tables were
touched (if any), and a link back to the Jira story. `/close-out` also
comments the PR link on the linked Jira issue -- it never changes the
issue's status. Opening a PR doesn't mean the story has moved in the
workflow; if it was in dev, it stays in dev until someone deliberately
moves it.

## Traceability records

`.claude/traceability/<STORY-ID>.json` is committed to the story's own
feature branch — never directly to `main`. It travels with the PR and is
reviewed alongside the code; it only reaches `main` when the PR merges.

This is enforced mechanically, not just by convention: a `pre-commit` git
hook (`.githooks/pre-commit`) regenerates the record and stages it as part
of every commit made on a story branch, so it's never left a commit behind
the code it describes. `npm install` wires this up automatically (the
`prepare` script sets `core.hooksPath`) — no manual setup per clone.

## What breaks if this isn't followed

- The automatic PR title generation in `/close-out` pulls the story ID the
  same way — same failure mode.
- If `npm install` was never run (so `core.hooksPath` isn't set), commits
  won't auto-update the traceability record — run `/close-out` before
  opening the PR to catch it up, or `npm install` to fix the hook going
  forward.
