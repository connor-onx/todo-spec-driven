"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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
