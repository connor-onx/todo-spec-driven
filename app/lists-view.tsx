import type { List } from "@/app/generated/prisma/client"

interface ListsViewProps {
  lists: List[]
}

export function ListsView({ lists }: ListsViewProps) {
  if (lists.length === 0) {
    return (
      <p className="text-zinc-600 dark:text-zinc-400">
        No lists yet. Create one below.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {lists.map((list) => (
        <li
          key={list.id}
          className="rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145]"
        >
          {list.name}
        </li>
      ))}
    </ul>
  )
}
