"use client"

import { toggleTodoAction, type ToggleTodoState } from "@/lib/actions/todos"
import { useActionState } from "react"

const initialState: ToggleTodoState = {}

interface ToggleTodoButtonProps {
  todoId: number
  completed: boolean
}

export function ToggleTodoButton({ todoId, completed }: ToggleTodoButtonProps) {
  const [state, formAction, pending] = useActionState(
    toggleTodoAction.bind(null, todoId, !completed),
    initialState
  )

  return (
    <form action={formAction}>
      <button
        type="submit"
        aria-pressed={completed}
        disabled={pending}
        className="rounded border border-black/[.08] px-2 py-1 text-sm disabled:opacity-50 dark:border-white/[.145]"
      >
        {pending ? "Updating..." : completed ? "Mark incomplete" : "Mark complete"}
      </button>
      {state.error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
    </form>
  )
}
