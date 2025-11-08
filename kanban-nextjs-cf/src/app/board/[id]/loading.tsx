import Link from "next/link";

// from tanstack app
export default function LoadingFallback() {
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
