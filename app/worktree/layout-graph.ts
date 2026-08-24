import type { JiraEdge, JiraNode } from "@/app/worktree/snapshot"

export const NODE_WIDTH = 220
export const NODE_HEIGHT = 84
const COLUMN_GAP = 32
const ROW_GAP = 64

export type PositionedNode = JiraNode & {
  level: number
  x: number
  y: number
}

export type LaidOutEdge = JiraEdge & {
  x1: number
  y1: number
  x2: number
  y2: number
  /** Number of levels the edge spans; >1 means it skips over intermediate rows */
  span: number
}

export type GraphLayout = {
  nodes: PositionedNode[]
  edges: LaidOutEdge[]
  width: number
  height: number
}

/**
 * Assigns each node a level equal to the longest path from any root
 * (a node with no incoming edges), so a node always sits below everything
 * that blocks it.
 */
function computeLevels(nodes: JiraNode[], edges: JiraEdge[]): Map<string, number> {
  const incoming = new Map<string, string[]>()
  for (const node of nodes) incoming.set(node.key, [])
  for (const edge of edges) incoming.get(edge.to)?.push(edge.from)

  const levels = new Map<string, number>()
  const resolving = new Set<string>()

  function levelOf(key: string): number {
    const cached = levels.get(key)
    if (cached !== undefined) return cached
    if (resolving.has(key)) return 0 // guard against cycles

    resolving.add(key)
    const predecessors = incoming.get(key) ?? []
    const level = predecessors.length === 0
      ? 0
      : Math.max(...predecessors.map(levelOf)) + 1
    resolving.delete(key)

    levels.set(key, level)
    return level
  }

  for (const node of nodes) levelOf(node.key)
  return levels
}

export function layoutGraph(nodes: JiraNode[], edges: JiraEdge[]): GraphLayout {
  const levels = computeLevels(nodes, edges)

  const nodesByLevel = new Map<number, JiraNode[]>()
  for (const node of nodes) {
    const level = levels.get(node.key) ?? 0
    const bucket = nodesByLevel.get(level) ?? []
    bucket.push(node)
    nodesByLevel.set(level, bucket)
  }

  const levelCount = nodesByLevel.size
  const rowWidth = (count: number) => count * NODE_WIDTH + (count - 1) * COLUMN_GAP
  const canvasWidth = Math.max(...Array.from(nodesByLevel.values(), (row) => rowWidth(row.length)))

  const positions = new Map<string, PositionedNode>()
  for (const [level, row] of nodesByLevel) {
    const startX = (canvasWidth - rowWidth(row.length)) / 2
    row.forEach((node, index) => {
      positions.set(node.key, {
        ...node,
        level,
        x: startX + index * (NODE_WIDTH + COLUMN_GAP),
        y: level * (NODE_HEIGHT + ROW_GAP)
      })
    })
  }

  const laidOutEdges: LaidOutEdge[] = edges.map((edge) => {
    const from = positions.get(edge.from)
    const to = positions.get(edge.to)
    if (!from || !to) {
      throw new Error(`Edge references unknown node: ${edge.from} -> ${edge.to}`)
    }
    return {
      ...edge,
      x1: from.x + NODE_WIDTH / 2,
      y1: from.y + NODE_HEIGHT,
      x2: to.x + NODE_WIDTH / 2,
      y2: to.y,
      span: to.level - from.level
    }
  })

  return {
    nodes: Array.from(positions.values()),
    edges: laidOutEdges,
    width: canvasWidth,
    height: levelCount * NODE_HEIGHT + (levelCount - 1) * ROW_GAP
  }
}
