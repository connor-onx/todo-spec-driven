"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface CreateTodoState {
  error?: string
}

export async function createTodoAction(
  _prevState: CreateTodoState,
  formData: FormData
): Promise<CreateTodoState> {
  const title = String(formData.get("title") ?? "").trim()
  const listId = Number(formData.get("listId"))

  if (!title) {
    return { error: "Todo title is required" }
  }

  if (!Number.isInteger(listId) || listId <= 0) {
    return { error: "A valid list is required" }
  }

  try {
    await prisma.todo.create({ data: { title, listId, completed: false } })
  } catch {
    return { error: "Failed to create todo. Please try again." }
  }

  revalidatePath(`/lists/${listId}`)
  return {}
}
