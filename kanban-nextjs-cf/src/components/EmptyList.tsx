export function EmptyList() {
  return (
    <div className="card bg-base-200 dark:bg-base-300 shadow-xl w-full max-w-md mx-auto">
      <div className="card-body items-center text-center">
        <h2 className="card-title text-secondary">No lists yet</h2>
        <p className="text-base-content/60">
          Add a list to begin organizing work on this board.
        </p>
      </div>
    </div>
  );
}
