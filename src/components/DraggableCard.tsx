import { User, type Tag } from "@/schema";
import { createSortable, transformStyle } from "@thisbeyond/solid-dnd";
import { For, Show, createSignal, onMount } from "solid-js";
import type { BoardCard, UsersList } from "~/api/boards";
import { EditPencil } from "./icons/EditPencil";
import { CardEditModal } from "./CardEditModal";

export function DraggableCard(props: {
  card: BoardCard;
  users: UsersList | undefined;
  allUsers: User[];
  allTags: Tag[];
  onCardUpdate?: (cardId: string, updates: Partial<BoardCard>) => void;
}) {
  const [mounted, setMounted] = createSignal(false);
  const [isModalOpen, setIsModalOpen] = createSignal(false);

  onMount(() => {
    setMounted(true);
  });

  const handleUpdate = (updates: Partial<BoardCard>) => {
    if (props.onCardUpdate) {
      props.onCardUpdate(props.card.id, updates);
    }
  };

  return (
    <>
      <Show
        when={mounted()}
        fallback={
          <div class="card bg-base-100 dark:bg-neutral shadow-lg">
            <CardContent
              card={props.card}
              users={props.users}
              onEdit={() => setIsModalOpen(true)}
            />
          </div>
        }
      >
        <DraggableContent
          card={props.card}
          users={props.users}
          onEdit={() => setIsModalOpen(true)}
        />
      </Show>
      <CardEditModal
        card={props.card}
        users={props.allUsers}
        tags={props.allTags}
        isOpen={isModalOpen()}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleUpdate}
      />
    </>
  );
}

function DraggableContent(props: {
  card: BoardCard;
  users: UsersList | undefined;
  onEdit: () => void;
}) {
  const sortable = createSortable(props.card.id);

  return (
    <div
      // @ts-ignore - solid-dnd custom directive
      use:sortable
      class="card bg-base-100 dark:bg-neutral shadow-lg cursor-grab active:cursor-grabbing transition-all duration-300 ease-in-out"
      classList={{
        "opacity-25": sortable.isActiveDraggable,
      }}
      style={`${transformStyle(sortable.transform)}; view-transition-name: card-${props.card.id};`}
    >
      <CardContent
        card={props.card}
        users={props.users}
        onEdit={props.onEdit}
      />
    </div>
  );
}

function CardContent(props: {
  card: BoardCard;
  users: UsersList | undefined;
  onEdit: () => void;
}) {
  const { card, users } = props;
  return (
    <div class="card-body gap-3 p-4">
      <div class="flex items-start justify-between gap-2">
        <h3 class="card-title text-lg text-base-content">{card.title}</h3>
        <Show when={card.completed}>
          <span class="badge badge-success badge-outline">Done</span>
        </Show>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            props.onEdit();
          }}
          class="btn btn-ghost btn-xs btn-circle"
        >
          <EditPencil />
        </button>
      </div>

      <Show when={card.assigneeId}>
        {(assigneeId) => (
          <div class="badge badge-outline badge-secondary badge-sm">
            Assigned to{" "}
            {users?.find((u: User) => u.id === assigneeId())?.name ??
              "Unassigned"}
          </div>
        )}
      </Show>

      <Show when={card.description}>
        {(description) => (
          <p class="text-sm text-base-content/70 bg-base-200 dark:bg-base-100 rounded-xl px-3 py-2">
            {description()}
          </p>
        )}
      </Show>

      <Show when={card.tags.length > 0}>
        <div class="flex flex-wrap gap-2.5 rounded-xl px-3 py-2 bg-base-200 dark:bg-base-100">
          <For each={card.tags}>
            {(tag) => (
              <span
                class="badge border-0 shadow font-semibold text-white"
                style={`background-color: ${tag.color};`}
              >
                {tag.name}
              </span>
            )}
          </For>
        </div>
      </Show>

      <Show when={card.comments.length > 0}>
        <div class="rounded-2xl bg-base-200 dark:bg-base-100 p-3 space-y-2 shadow-inner">
          <p class="text-xs font-semibold text-base-content/50">Comments</p>
          <ul class="space-y-1 text-sm text-base-content/70">
            <For each={card.comments}>
              {(comment) => (
                <li>
                  <span class="font-semibold text-base-content">
                    {users?.find((u) => u.id === comment.userId)?.name ??
                      "Unknown"}
                    :
                  </span>{" "}
                  {comment.text}
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>
    </div>
  );
}
