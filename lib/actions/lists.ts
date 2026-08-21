"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export interface CreateListState {
  error?: string
}

export async function createListAction(
  _prevState: CreateListState,
  formData: FormData
): Promise<CreateListState> {
  const name = String(formData.get("name") ?? "").trim()

  if (!name) {
    return { error: "List name is required" }
  }

  try {
    await prisma.list.create({ data: { name } })
  } catch {
    return { error: "Failed to create list. Please try again." }
  }

  revalidatePath("/")
  return {}
}

export interface DeleteListState {
  error?: string
}

export async function deleteListAction(
  listId: number,
  _prevState: DeleteListState,
  _formData: FormData
): Promise<DeleteListState> {
  if (!Number.isInteger(listId) || listId <= 0) {
    return { error: "Invalid list" }
  }

  try {
    await prisma.list.delete({ where: { id: listId } })
  } catch {
    return { error: "Failed to delete list. Please try again." }
  }

  revalidatePath("/")
  redirect("/")
}
