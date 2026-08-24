"use client"

import { setTodoPriorityAction, type SetTodoPriorityState } from "@/lib/actions/todos"
import type { Priority } from "@/app/generated/prisma/client"
import { useActionState } from "react"

const initialState: SetTodoPriorityState = {}

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: "border-zinc-400 text-zinc-600 dark:border-zinc-600 dark:text-zinc-400",
  MEDIUM: "border-amber-500 text-amber-700 dark:border-amber-400 dark:text-amber-400",
  HIGH: "border-red-500 text-red-700 dark:border-red-400 dark:text-red-400"
}

interface TodoPrioritySelectProps {
  todoId: number
  priority: Priority
}

export function TodoPrioritySelect({ todoId, priority }: TodoPrioritySelectProps) {
  const [state, formAction, pending] = useActionState(
    setTodoPriorityAction.bind(null, todoId),
    initialState
  )

  return (
    <form action={formAction}>
      <select
        name="priority"
        defaultValue={priority}
        disabled={pending}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={`rounded border bg-transparent px-2 py-1 text-sm disabled:opacity-50 ${PRIORITY_STYLES[priority]}`}
      >
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
      </select>
      {state.error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
    </form>
  )
}
