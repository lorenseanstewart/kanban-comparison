"use client";

import Link from "next/link";

export default function BoardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("BoardError:", error);

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto p-8 space-y-6 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
        <div className="card bg-error/10">
          <div className="card-body items-center text-center">
            <h1 className="card-title text-3xl text-error">Board Error</h1>
            <p className="text-base-content/70 mt-2">
              {error.message ||
                "Failed to load this board. It may not exist or there was an error."}
            </p>
            <div className="card-actions justify-center gap-4 mt-6">
              <button onClick={reset} className="btn btn-primary">
                Try Again
              </button>
              <Link href="/" className="btn btn-ghost">
                Back to Boards
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
