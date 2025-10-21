import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBoard, getUsers, getTags } from "@/lib/api";
import { BoardPageClient } from "./BoardPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const boardData = await getBoard(id);

  if (!boardData) {
    return {
      title: "Board Not Found | Kanban Board",
      description: "The requested board could not be found.",
    };
  }

  return {
    title: `${boardData.title} | Kanban Board`,
    description: boardData.description || `Manage tasks on the ${boardData.title} board`,
  };
}

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
