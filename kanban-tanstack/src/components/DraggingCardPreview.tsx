import type { BoardCard } from "~/lib/api";

export function DraggingCardPreview({ card }: { card: BoardCard }) {
  return (
    <article className="card bg-base-100 dark:bg-neutral shadow-2xl rotate-3 scale-105">
      <div className="card-body gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="card-title text-lg text-base-content">{card.title}</h3>
          {card.completed && (
            <span className="badge badge-success badge-outline">Done</span>
          )}
        </div>

        {card.description && (
          <p className="text-sm text-base-content/70 bg-base-200 dark:bg-base-100 rounded-xl px-3 py-2">
            {card.description}
          </p>
        )}

        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-2.5">
            {card.tags.map((tag) => (
              <span
                key={tag.id}
                className="badge border-0 shadow font-semibold text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
