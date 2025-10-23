import type { BoardDetails, UsersList, TagsList, BoardCard } from "../lib/api";
import { Card } from "./Card";

export function CardList(props: {
  list: BoardDetails["lists"][number];
  allUsers: UsersList;
  allTags: TagsList;
  onCardUpdate?: (cardId: string, updates: Partial<BoardCard>) => void;
  onCardDelete?: (cardId: string) => void;
}) {
  const cardIds = props.list.cards.map((card) => card.id);

  // Check if we're over this list OR over any card in this lis

  return (
    <section class="card bg-base-200 dark:bg-base-300 min-w-[20rem] shadow-xl">
      <div class="card-body gap-4">
        <header class="flex items-center justify-between">
          <h2 class="card-title text-base-content">{props.list.title}</h2>
          <div class="badge badge-primary badge-outline badge-lg shadow">
            {props.list.cards.length} cards
          </div>
        </header>

        <div class={`min-h-[200px] transition-all duration-200 rounded-lg`}>
          {props.list.cards.length === 0 ? (
            <div class="alert alert-info text-sm">
              <span>No cards yet</span>
            </div>
          ) : (
            <div class="space-y-3">
              {props.list.cards.map((card) => (
                <Card
                  card={card}
                  allUsers={props.allUsers}
                  allTags={props.allTags}
                  onCardUpdate={props.onCardUpdate}
                  onCardDelete={props.onCardDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
