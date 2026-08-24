export type JiraStatusCategory = "new" | "indeterminate" | "done"

export type JiraNode = {
  key: string
  summary: string
  status: string
  statusCategory: JiraStatusCategory
  issueType: string
  url: string
}

export type JiraEdge = {
  /** Issue key that blocks `to` (i.e. `to` depends on `from`) */
  from: string
  to: string
}

export type JiraSnapshot = {
  generatedAt: string
  epic: {
    key: string
    summary: string
    url: string
  }
  nodes: JiraNode[]
  edges: JiraEdge[]
}

/**
 * Snapshot of story-level dependency links under epic CBTS-930, pulled from
 * Jira via the Atlassian MCP connection. This is a point-in-time export, not
 * a live view — regenerate by re-running the same query and updating this file.
 */
export const JIRA_SNAPSHOT: JiraSnapshot = {
  generatedAt: "2026-08-24",
  epic: {
    key: "CBTS-930",
    summary: "Spec Driven Development Todo Application",
    url: "https://cbts.atlassian.net/browse/CBTS-930"
  },
  nodes: [
    {
      key: "CBTS-931",
      summary: "Project & schema setup",
      status: "Ready To Test In QA",
      statusCategory: "indeterminate",
      issueType: "Story",
      url: "https://cbts.atlassian.net/browse/CBTS-931"
    },
    {
      key: "CBTS-932",
      summary: "Create a list",
      status: "Ready To Test In QA",
      statusCategory: "indeterminate",
      issueType: "Story",
      url: "https://cbts.atlassian.net/browse/CBTS-932"
    },
    {
      key: "CBTS-933",
      summary: "Add a todo to a list",
      status: "In DEV",
      statusCategory: "indeterminate",
      issueType: "Story",
      url: "https://cbts.atlassian.net/browse/CBTS-933"
    },
    {
      key: "CBTS-934",
      summary: "Toggle a todo complete/incomplete",
      status: "In DEV",
      statusCategory: "indeterminate",
      issueType: "Story",
      url: "https://cbts.atlassian.net/browse/CBTS-934"
    },
    {
      key: "CBTS-935",
      summary: "Delete a todo",
      status: "In DEV",
      statusCategory: "indeterminate",
      issueType: "Story",
      url: "https://cbts.atlassian.net/browse/CBTS-935"
    },
    {
      key: "CBTS-936",
      summary: "Delete a list",
      status: "In DEV",
      statusCategory: "indeterminate",
      issueType: "Story",
      url: "https://cbts.atlassian.net/browse/CBTS-936"
    },
    {
      key: "CBTS-937",
      summary: "Filter todos by list",
      status: "To Do",
      statusCategory: "new",
      issueType: "Story",
      url: "https://cbts.atlassian.net/browse/CBTS-937"
    },
    {
      key: "CBTS-938",
      summary: "Set a due date on a todo",
      status: "To Do",
      statusCategory: "new",
      issueType: "Story",
      url: "https://cbts.atlassian.net/browse/CBTS-938"
    },
    {
      key: "CBTS-939",
      summary: "Set priority on a todo",
      status: "To Do",
      statusCategory: "new",
      issueType: "Story",
      url: "https://cbts.atlassian.net/browse/CBTS-939"
    }
  ],
  edges: [
    { from: "CBTS-931", to: "CBTS-932" },
    { from: "CBTS-931", to: "CBTS-933" },
    { from: "CBTS-931", to: "CBTS-934" },
    { from: "CBTS-931", to: "CBTS-935" },
    { from: "CBTS-931", to: "CBTS-936" },
    { from: "CBTS-931", to: "CBTS-937" },
    { from: "CBTS-931", to: "CBTS-938" },
    { from: "CBTS-931", to: "CBTS-939" },
    { from: "CBTS-932", to: "CBTS-937" },
    { from: "CBTS-933", to: "CBTS-937" }
  ]
}
