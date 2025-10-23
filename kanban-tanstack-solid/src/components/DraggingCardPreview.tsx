import type { BoardCard } from "~/lib/api";

export function DraggingCardPreview(props: { card: BoardCard }) {
  return (
    <article class="card bg-base-100 dark:bg-neutral shadow-2xl rotate-3 scale-105">
      <div class="card-body gap-3 p-4">
        <div class="flex items-start justify-between gap-2">
          <h3 class="card-title text-lg text-base-content">
            {props.card.title}
          </h3>
          {props.card.completed && (
            <span class="badge badge-success badge-outline">Done</span>
          )}
        </div>

        {props.card.description && (
          <p class="text-sm text-base-content/70 bg-base-200 dark:bg-base-100 rounded-xl px-3 py-2">
            {props.card.description}
          </p>
        )}

        {props.card.tags.length > 0 && (
          <div class="flex flex-wrap gap-2.5">
            {props.card.tags.map((tag) => (
              <span
                class="badge border-0 shadow font-semibold text-white"
                style={{ "background-color": tag.color }}
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
