"use client"

import { createListAction, type CreateListState } from "@/lib/actions/lists"
import { useActionState } from "react"

const initialState: CreateListState = {}

export function CreateListForm() {
  const [state, formAction, pending] = useActionState(
    createListAction,
    initialState
  )

  return (
    <form action={formAction} className="flex flex-col gap-2 w-full max-w-sm">
      <div className="flex gap-2">
        <input
          type="text"
          name="name"
          placeholder="New list name"
          aria-invalid={Boolean(state.error)}
          className="flex-1 rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145]"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-foreground px-4 py-2 text-background disabled:opacity-50"
        >
          {pending ? "Creating..." : "Create list"}
        </button>
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
    </form>
  )
}
