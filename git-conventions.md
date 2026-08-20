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

When using the automatic PR creation from Feature Close Out, the title is
generated from the story ID and the latest commit message — which only
works if commits follow the format above.

Description should include: what changed, which schema tables were
touched (if any), and a link back to the Jira story.

## What breaks if this isn't followed

- The automatic PR title generation in Feature Close Out pulls the story
  ID the same way — same failure mode.
