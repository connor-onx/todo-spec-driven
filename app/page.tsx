import { CreateListForm } from "@/app/create-list-form"
import { ListsView } from "@/app/lists-view"
import { prisma } from "@/lib/prisma"

export default async function Home() {
  const lists = await prisma.list.findMany({ orderBy: { createdAt: "asc" } })

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col gap-8 py-16 px-16 bg-white dark:bg-black">
        <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
          Lists
        </h1>
        <ListsView lists={lists}/>
        <CreateListForm/>
      </main>
    </div>
  )
}
