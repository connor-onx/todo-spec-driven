import { DependencyGraph } from "@/app/worktree/dependency-graph"
import { JIRA_SNAPSHOT } from "@/app/worktree/snapshot"

export default function WorktreePage() {
  const { epic, nodes, edges, generatedAt } = JIRA_SNAPSHOT

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-5xl flex-col gap-6 py-16 px-16 bg-white dark:bg-black">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Story dependency graph
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Stories under{" "}
            <a
              href={epic.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-2"
            >
              {epic.key}: {epic.summary}
            </a>
            . Arrows point from a story to the stories that depend on it. Snapshot from Jira
            as of {generatedAt} — not live.
          </p>
        </div>
        <DependencyGraph nodes={nodes} edges={edges} />
      </main>
    </div>
  )
}
