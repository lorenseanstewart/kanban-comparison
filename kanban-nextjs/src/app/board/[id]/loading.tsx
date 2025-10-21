export default function BoardLoading() {
  return (
    <main className="w-full p-8 space-y-10 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
      {/* Breadcrumbs skeleton */}
      <div className="flex gap-2 items-center">
        <div className="skeleton h-4 w-16" />
        <div className="skeleton h-4 w-4" />
        <div className="skeleton h-4 w-32" />
      </div>

      {/* Board overview skeleton */}
      <div className="space-y-4">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-20 w-full" />
      </div>

      {/* Add card button skeleton */}
      <div className="flex justify-start">
        <div className="skeleton h-12 w-32" />
      </div>

      {/* Lists skeleton */}
      <div className="flex gap-7 overflow-x-auto pb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="min-w-80 flex-shrink-0">
            <div className="card bg-base-200 dark:bg-base-300 shadow-xl">
              <div className="card-body">
                <div className="skeleton h-6 w-32 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="skeleton h-24 w-full" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

