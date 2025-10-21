import { Suspense } from "react";
import Link from "next/link";
import { getBoard, getUsers, getTags } from "@/lib/api";
import { BoardPageClient } from "./BoardPageClient";

function LoadingFallback() {
  return (
    <main className="w-full p-8 space-y-10 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href="/" className="link link-hover">
              Boards
            </Link>
          </li>
          <li>
            <span className="text-base-content/60">Loading...</span>
          </li>
        </ul>
      </div>
      <div className="flex justify-center py-16">
        <span
          className="loading loading-spinner loading-lg text-primary"
          aria-label="Loading board"
        />
      </div>
    </main>
  );
}

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
