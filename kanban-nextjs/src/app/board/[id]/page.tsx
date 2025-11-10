import { Suspense } from "react";
import { getBoard, getTags, getUsers } from "@/lib/api";
import { BoardPageClient } from "./BoardPageClient";

function LoadingFallback() {
  return (
    <main className="w-full p-8 space-y-10 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <span className="loading loading-spinner loading-xs" />
          </li>
        </ul>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-base-300 animate-pulse rounded" />
          <div className="h-4 w-64 bg-base-300 animate-pulse rounded" />
        </div>

        <div className="flex gap-7 overflow-x-auto pb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-80 space-y-4">
              <div className="h-6 w-24 bg-base-300 animate-pulse rounded" />
              <div className="space-y-3">
                {[1, 2].map((j) => (
                  <div key={j} className="h-32 bg-base-300 animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
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
