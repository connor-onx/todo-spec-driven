import type { Todo } from "@/app/generated/prisma/client"
import { DeleteTodoButton } from "@/app/delete-todo-button"
import { DueDateForm } from "@/app/due-date-form"
import { ToggleTodoButton } from "@/app/toggle-todo-button"
import { TodoPrioritySelect } from "@/app/todo-priority-select"

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
          className="flex items-center gap-3 rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145]"
        >
          <ToggleTodoButton todoId={todo.id} completed={todo.completed}/>
          <span className={`flex-1 ${todo.completed ? "line-through text-zinc-400 dark:text-zinc-600" : ""}`}>
            {todo.title}
          </span>
          <TodoPrioritySelect todoId={todo.id} priority={todo.priority}/>
          <DueDateForm todoId={todo.id} dueDate={todo.dueDate}/>
          <DeleteTodoButton todoId={todo.id} listId={todo.listId}/>
        </li>
      ))}
    </ul>
  )
}
