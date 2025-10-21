export default function Loading() {
  return (
    <main className="w-full max-w-4xl mx-auto p-8 space-y-10 rounded-[2.5rem] bg-base-100 dark:bg-base-200 shadow-xl">
      <header className="text-center space-y-3">
        <div className="skeleton h-4 w-32 mx-auto" />
        <div className="skeleton h-10 w-48 mx-auto" />
        <div className="skeleton h-5 w-96 mx-auto" />
      </header>

      <div className="flex justify-end">
        <div className="skeleton h-12 w-32" />
      </div>

      <section className="grid gap-8 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card bg-base-200 dark:bg-base-300 shadow-xl">
            <div className="card-body space-y-4">
              <div className="skeleton h-7 w-3/4" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
              <div className="flex justify-end">
                <div className="skeleton h-8 w-24" />
              </div>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

