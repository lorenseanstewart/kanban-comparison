import { getBoard, getTags, getUsers } from "@/lib/api";
import { BoardPageClient } from "./BoardPageClient";


export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const boardPromise = getBoard(id);
  const usersPromise = getUsers();
  const tagsPromise = getTags();

  return (
    <BoardPageClient
      boardPromise={boardPromise}
      usersPromise={usersPromise}
      tagsPromise={tagsPromise}
    />
  );
}
