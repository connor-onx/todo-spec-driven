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

export interface ToggleTodoState {
  error?: string
}

export async function toggleTodoAction(
  todoId: number,
  completed: boolean,
  _prevState: ToggleTodoState,
  _formData: FormData
): Promise<ToggleTodoState> {
  if (!Number.isInteger(todoId) || todoId <= 0) {
    return { error: "Invalid todo" }
  }

  try {
    const updated = await prisma.todo.update({
      where: { id: todoId },
      data: {
        completed,
        completedAt: completed ? new Date() : null
      }
    })
    revalidatePath(`/lists/${updated.listId}`)
  } catch {
    return { error: "Failed to update todo. Please try again." }
  }

  return {}
}

export interface DeleteTodoState {
  error?: string
}

export async function deleteTodoAction(
  todoId: number,
  listId: number,
  _prevState: DeleteTodoState,
  _formData: FormData
): Promise<DeleteTodoState> {
  if (!Number.isInteger(todoId) || todoId <= 0) {
    return { error: "Invalid todo" }
  }

  try {
    await prisma.todo.delete({ where: { id: todoId } })
  } catch {
    return { error: "Failed to delete todo. Please try again." }
  }

  revalidatePath(`/lists/${listId}`)
  return {}
}
