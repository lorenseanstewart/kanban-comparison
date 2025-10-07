import {
  DragDropProvider,
  DragDropSensors,
  DragOverlay,
  type DragEventHandler,
  closestCenter,
} from "@thisbeyond/solid-dnd";
import { type JSX, type Accessor, createSignal, Show, onMount } from "solid-js";
import type { BoardDetails, BoardCard } from "~/api/boards";

export function DragDropBoard(props: {
  children: JSX.Element;
  onDragEnd: DragEventHandler;
  board: Accessor<BoardDetails | null>;
}) {
  const [activeCard, setActiveCard] = createSignal<BoardCard | null>(null);
  const [mounted, setMounted] = createSignal(false);

  onMount(() => {
    setMounted(true);
  });

  const handleDragStart: DragEventHandler = ({ draggable }) => {
    const cardId = draggable.id as string;
    const currentBoard = props.board();

    if (currentBoard && cardId.startsWith('card-')) {
      // Find the card in the board data
      for (const list of currentBoard.lists) {
        const card = list.cards.find(c => c.id === cardId);
        if (card) {
          setActiveCard(card);
          break;
        }
      }
    }
  };

  const handleDragEnd: DragEventHandler = (event) => {
    setActiveCard(null);
    props.onDragEnd(event);
  };

  return (
    <Show when={mounted()} fallback={props.children}>
      <DragDropProvider
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetector={closestCenter}
      >
        <DragDropSensors>
          {props.children}
          <DragOverlay>
            <Show when={activeCard()}>
              {(card) => (
                <div class="card bg-base-100 dark:bg-neutral shadow-2xl rotate-3 scale-105">
                  <div class="card-body gap-3 p-4">
                    <div class="flex items-start justify-between gap-2">
                      <h3 class="card-title text-lg text-base-content">{card().title}</h3>
                      <Show when={card().completed}>
                        <span class="badge badge-success badge-outline">Done</span>
                      </Show>
                    </div>

                    <Show when={card().description}>
                      {(description) => (
                        <p class="text-sm text-base-content/70 bg-base-200 dark:bg-base-100 rounded-xl px-3 py-2">
                          {description()}
                        </p>
                      )}
                    </Show>

                    <Show when={card().tags.length > 0}>
                      <div class="flex flex-wrap gap-2.5">
                        {card().tags.map((tag) => (
                          <span
                            class="badge border-0 shadow font-semibold text-white"
                            style={`background-color: ${tag.color};`}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </Show>
                  </div>
                </div>
              )}
            </Show>
          </DragOverlay>
        </DragDropSensors>
      </DragDropProvider>
    </Show>
  );
}