"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("GlobalError:", error);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4">
          <main className="w-full max-w-2xl mx-auto p-8 space-y-6 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
            <div className="card bg-error/10">
              <div className="card-body items-center text-center">
                <h1 className="card-title text-3xl text-error">
                  Something went wrong!
                </h1>
                <p className="text-base-content/70 mt-2">
                  {error.message || "An unexpected error occurred."}
                </p>
                <div className="card-actions justify-center gap-4 mt-6">
                  <button onClick={reset} className="btn btn-primary">
                    Try Again
                  </button>
                  <Link href="/" className="btn btn-ghost">
                    Go Home
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
