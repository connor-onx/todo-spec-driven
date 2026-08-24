"use client"

import { updateDueDateAction, type UpdateDueDateState } from "@/lib/actions/todos"
import { useActionState } from "react"

const initialState: UpdateDueDateState = {}

interface DueDateFormProps {
  todoId: number
  dueDate: Date | null
}

function toDateInputValue(dueDate: Date | null) {
  if (!dueDate) return ""
  return dueDate.toISOString().slice(0, 10)
}

export function DueDateForm({ todoId, dueDate }: DueDateFormProps) {
  const [state, formAction, pending] = useActionState(
    updateDueDateAction.bind(null, todoId),
    initialState
  )

  return (
    <form action={formAction} className="flex items-center gap-1">
      <input
        type="date"
        name="dueDate"
        defaultValue={toDateInputValue(dueDate)}
        aria-invalid={Boolean(state.error)}
        className="rounded border border-black/[.08] px-2 py-1 text-sm dark:border-white/[.145]"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded border border-black/[.08] px-2 py-1 text-sm disabled:opacity-50 dark:border-white/[.145]"
      >
        {pending ? "Saving..." : "Save"}
      </button>
      {state.error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
    </form>
  )
}
