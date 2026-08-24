-- DropForeignKey
ALTER TABLE "todos" DROP CONSTRAINT "todos_listId_fkey";

-- AddForeignKey
ALTER TABLE "todos" ADD CONSTRAINT "todos_listId_fkey" FOREIGN KEY ("listId") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
