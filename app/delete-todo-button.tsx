"use client"

import { deleteTodoAction, type DeleteTodoState } from "@/lib/actions/todos"
import { useActionState } from "react"

const initialState: DeleteTodoState = {}

interface DeleteTodoButtonProps {
  todoId: number
  listId: number
}

export function DeleteTodoButton({ todoId, listId }: DeleteTodoButtonProps) {
  const [state, formAction, pending] = useActionState(
    deleteTodoAction.bind(null, todoId, listId),
    initialState
  )

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("Delete this todo? This can't be undone.")) {
          e.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className="rounded border border-black/[.08] px-2 py-1 text-sm disabled:opacity-50 dark:border-white/[.145]"
      >
        {pending ? "Deleting..." : "Delete"}
      </button>
      {state.error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
    </form>
  )
}
