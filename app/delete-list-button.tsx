"use client"

import { deleteListAction, type DeleteListState } from "@/lib/actions/lists"
import { useActionState, useState } from "react"

const initialState: DeleteListState = {}

interface DeleteListButtonProps {
  listId: number
  todoCount: number
}

export function DeleteListButton({ listId, todoCount }: DeleteListButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const [state, formAction, pending] = useActionState(
    deleteListAction.bind(null, listId),
    initialState
  )

  if (confirming) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Delete this list and its {todoCount} todo{todoCount === 1 ? "" : "s"}?
          This cannot be undone.
        </p>
        <form action={formAction} className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-red-600 px-3 py-1 text-sm text-white disabled:opacity-50"
          >
            {pending ? "Deleting..." : "Confirm delete"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={pending}
            className="rounded border border-black/[.08] px-3 py-1 text-sm disabled:opacity-50 dark:border-white/[.145]"
          >
            Cancel
          </button>
        </form>
        {state.error ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        ) : null}
      </div>
    )
  }

  if (todoCount === 0) {
    return (
      <form action={formAction}>
        <button
          type="submit"
          disabled={pending}
          className="rounded border border-black/[.08] px-3 py-1 text-sm disabled:opacity-50 dark:border-white/[.145]"
        >
          {pending ? "Deleting..." : "Delete list"}
        </button>
        {state.error ? (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        ) : null}
      </form>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="rounded border border-black/[.08] px-3 py-1 text-sm dark:border-white/[.145]"
    >
      Delete list
    </button>
  )
}
