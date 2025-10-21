import Link from 'next/link';

export default function BoardNotFound() {
  return (
    <main className="w-full max-w-2xl mx-auto p-8 space-y-6 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
      <div className="card bg-warning/10 border border-warning/20">
        <div className="card-body items-center text-center space-y-4">
          <svg
            className="w-20 h-20 text-warning"
            fill="none"
            strokeWidth={1.5}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          
          <h1 className="card-title text-3xl text-warning">Board Not Found</h1>
          
          <p className="text-base-content/70 text-lg">
            This board doesn't exist or has been deleted.
          </p>
          
          <div className="card-actions justify-center mt-4">
            <Link href="/" className="btn btn-primary btn-lg">
              <svg
                className="w-5 h-5"
                fill="none"
                strokeWidth={2}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Back to Boards
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

