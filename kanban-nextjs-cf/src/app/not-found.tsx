"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto p-8 space-y-6 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
        <div className="card bg-warning/10">
          <div className="card-body items-center text-center">
            <h1 className="card-title text-3xl text-warning">404 - Not Found</h1>
            <p className="text-base-content/70 mt-2">
              The page you are looking for does not exist.
            </p>
            <div className="card-actions justify-center gap-4 mt-6">
              <button
                onClick={() => window.history.back()}
                className="btn btn-primary"
              >
                Go Back
              </button>
              <Link href="/" className="btn btn-ghost">
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
