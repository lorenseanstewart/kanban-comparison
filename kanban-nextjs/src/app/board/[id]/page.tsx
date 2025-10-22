import { getBoard, getUsers, getTags } from "@/lib/api";
import { BoardPageClient } from "./BoardPageClient";
import { Suspense } from "react";
import LoadingFallback from "./loading";

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
    <Suspense fallback={<LoadingFallback />}>
      <BoardPageClient
        boardPromise={boardPromise}
        usersPromise={usersPromise}
        tagsPromise={tagsPromise}
      />
    </Suspense>
  );
}
