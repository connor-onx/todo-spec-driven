"use client"

import { createTodoAction, type CreateTodoState } from "@/lib/actions/todos"
import { useActionState } from "react"

const initialState: CreateTodoState = {}

interface AddTodoFormProps {
  listId: number
}

export function AddTodoForm({ listId }: AddTodoFormProps) {
  const [state, formAction, pending] = useActionState(
    createTodoAction,
    initialState
  )

  return (
    <form action={formAction} className="flex flex-col gap-2 w-full max-w-sm">
      <input type="hidden" name="listId" value={listId}/>
      <div className="flex gap-2">
        <input
          type="text"
          name="title"
          placeholder="New todo title"
          aria-invalid={Boolean(state.error)}
          className="flex-1 rounded border border-black/[.08] px-3 py-2 dark:border-white/[.145]"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-foreground px-4 py-2 text-background disabled:opacity-50"
        >
          {pending ? "Adding..." : "Add todo"}
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
