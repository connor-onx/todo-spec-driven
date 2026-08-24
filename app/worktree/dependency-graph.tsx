import { NODE_HEIGHT, NODE_WIDTH, layoutGraph } from "@/app/worktree/layout-graph"
import type { JiraEdge, JiraNode, JiraStatusCategory } from "@/app/worktree/snapshot"

const STATUS_STYLES: Record<JiraStatusCategory, { badge: string; accent: string }> = {
  new: {
    badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
    accent: "border-zinc-300 dark:border-zinc-700"
  },
  indeterminate: {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    accent: "border-amber-400 dark:border-amber-700"
  },
  done: {
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    accent: "border-emerald-400 dark:border-emerald-700"
  }
}

export function DependencyGraph({ nodes, edges }: { nodes: JiraNode[]; edges: JiraEdge[] }) {
  const layout = layoutGraph(nodes, edges)

  return (
    <div className="overflow-x-auto">
      <div
        className="relative"
        style={{ width: layout.width, height: layout.height, minWidth: layout.width }}
      >
        <svg
          className="absolute inset-0 overflow-visible"
          width={layout.width}
          height={layout.height}
        >
          <defs>
            <marker
              id="arrowhead"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-zinc-400 dark:fill-zinc-600" />
            </marker>
          </defs>
          {layout.edges.map((edge) => {
            const midY = (edge.y1 + edge.y2) / 2
            const path = `M ${edge.x1} ${edge.y1} C ${edge.x1} ${midY}, ${edge.x2} ${midY}, ${edge.x2} ${edge.y2}`
            return (
              <path
                key={`${edge.from}-${edge.to}`}
                d={path}
                fill="none"
                strokeWidth={edge.span > 1 ? 1.5 : 2}
                strokeDasharray={edge.span > 1 ? "5 4" : undefined}
                className={
                  edge.span > 1
                    ? "stroke-zinc-300 dark:stroke-zinc-700"
                    : "stroke-zinc-400 dark:stroke-zinc-600"
                }
                markerEnd="url(#arrowhead)"
              />
            )
          })}
        </svg>

        {layout.nodes.map((node) => {
          const style = STATUS_STYLES[node.statusCategory]
          return (
            <a
              key={node.key}
              href={node.url}
              target="_blank"
              rel="noreferrer"
              className={`absolute flex flex-col gap-1.5 rounded-lg border-2 bg-white p-3 shadow-sm transition hover:shadow-md dark:bg-zinc-900 ${style.accent}`}
              style={{ left: node.x, top: node.y, width: NODE_WIDTH, height: NODE_HEIGHT }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">
                  {node.key}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${style.badge}`}>
                  {node.status}
                </span>
              </div>
              <p className="line-clamp-2 text-sm leading-snug text-zinc-900 dark:text-zinc-100">
                {node.summary}
              </p>
            </a>
          )
        })}
      </div>
    </div>
  )
}
