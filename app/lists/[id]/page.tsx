import { notFound } from "next/navigation"

import { AddTodoForm } from "@/app/add-todo-form"
import { TodosView } from "@/app/todos-view"
import { prisma } from "@/lib/prisma"

export default async function ListPage(props: PageProps<"/lists/[id]">) {
  const { id } = await props.params
  const listId = Number(id)

  const list = Number.isInteger(listId)
    ? await prisma.list.findUnique({
        where: { id: listId },
        include: { todos: { orderBy: { createdAt: "asc" } } }
      })
    : null

  if (!list) {
    notFound()
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col gap-8 py-16 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
          {list.name}
        </h1>
        <TodosView todos={list.todos}/>
        <AddTodoForm listId={list.id}/>
      </main>
    </div>
  )
}
