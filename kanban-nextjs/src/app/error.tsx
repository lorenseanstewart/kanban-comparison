"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
      <div className="card bg-base-100 dark:bg-base-300 shadow-xl max-w-md w-full">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-error text-2xl">Something went wrong</h2>
          <p className="text-base-content/70 mt-2">
            {error.message || "An unexpected error occurred"}
          </p>
          <div className="card-actions mt-6 gap-4">
            <button onClick={reset} className="btn btn-primary">
              Try Again
            </button>
            <Link href="/" className="btn btn-ghost">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
