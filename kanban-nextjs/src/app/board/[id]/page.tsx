import { notFound } from "next/navigation";
import { getBoard, getUsers, getTags } from "@/lib/api";
import { BoardPageClient } from "./BoardPageClient";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [boardData, allUsers, allTags] = await Promise.all([
    getBoard(id),
    getUsers(),
    getTags(),
  ]);

  if (!boardData) {
    notFound();
  }

  return (
    <BoardPageClient
      initialBoard={boardData}
      allUsers={allUsers}
      allTags={allTags}
    />
  );
}
