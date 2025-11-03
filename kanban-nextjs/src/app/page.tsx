import { Suspense } from "react";
import { getBoards } from "@/lib/api";
import { HomePageClient } from "@/components/HomePageClient";

// Force dynamic rendering since we need database access
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

function LoadingFallback() {
  return (
    <main className="w-full max-w-4xl mx-auto p-8 space-y-10 rounded-[2.5rem] bg-base-100 dark:bg-base-200 shadow-xl">
      <header className="text-center space-y-3">
        <p className="text-sm uppercase tracking-wide text-secondary">
          Your workspace
        </p>
        <h1 className="text-4xl font-black text-primary">Boards</h1>
        <p className="text-base text-base-content/60">
          Loading your boards...
        </p>
      </header>
      <div className="flex justify-center py-16">
        <span
          className="loading loading-spinner loading-lg text-primary"
          aria-label="Loading boards"
        />
      </div>
    </main>
  );
}

export default function Home() {
  const boardsPromise = getBoards();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomePageClient boardsPromise={boardsPromise} />
    </Suspense>
  );
}
