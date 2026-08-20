import type { Todo } from "@/app/generated/prisma/client"

interface TodosViewProps {
  todos: Todo[]
}

export function TodosView({ todos }: TodosViewProps) {
  if (todos.length === 0) {
    return (
      <p className="text-zinc-600 dark:text-zinc-400">
        No todos yet. Add one below.
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {todos.map((todo) => (
        <li
          key={todo.id}
          className="rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145]"
        >
          {todo.title}
        </li>
      ))}
    </ul>
  )
}
