import { For, createSignal, onMount, Show } from "solid-js";
import { SortableProvider } from "@thisbeyond/solid-dnd";
import type { BoardCard, BoardList, UsersList } from "~/api/boards";
import { DroppableList } from "~/components/DroppableList";
import { DraggableCard } from "~/components/DraggableCard";
import type { User, Tag } from "../../drizzle/schema";

export function CardList(props: {
  list: BoardList;
  users: UsersList | undefined;
  allUsers: User[];
  allTags: Tag[];
  onCardUpdate?: (cardId: string, updates: Partial<BoardCard>) => void;
}) {
  const { list, users } = props;
  const [mounted, setMounted] = createSignal(false);

  onMount(() => {
    setMounted(true);
  });

  const cardIds = () => list.cards.map((card) => card.id);

  const cardList = () => (
    <For
      each={list.cards}
      fallback={
        <div class="alert alert-info text-sm">
          <span>No cards yet</span>
        </div>
      }
    >
      {(card: BoardCard) => (
        <DraggableCard
          card={card}
          users={users}
          allUsers={props.allUsers}
          allTags={props.allTags}
          onCardUpdate={props.onCardUpdate}
        />
      )}
    </For>
  );

  return (
    <article class="card bg-base-200 dark:bg-base-300 min-w-[20rem] shadow-xl">
      <div class="card-body gap-4">
        <header class="flex items-center justify-between">
          <h2 class="card-title text-base-content">{list.title}</h2>
          <div class="badge badge-primary badge-outline badge-lg shadow">
            {list.cards.length} cards
          </div>
        </header>

        <DroppableList listId={list.id}>
          <div class="min-h-[200px]">
            <Show
              when={mounted()}
              fallback={cardList()}
            >
              <SortableProvider ids={cardIds()}>{cardList()}</SortableProvider>
            </Show>
          </div>
        </DroppableList>
      </div>
    </article>
  );
}
