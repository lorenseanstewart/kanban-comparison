import {
  component$,
  useSignal,
  $,
  createContextId,
  useContextProvider,
  type Signal,
  useComputed$,
} from "@builder.io/qwik";
import { routeLoader$, routeAction$, Link } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { eq, max } from "drizzle-orm";
import { getBoard, getUsers, getTags } from "~/db/queries";
import type { BoardDetails, BoardCard } from "~/db/queries";
import { BoardOverview } from "~/components/BoardOverview";
import { CardList } from "~/components/CardList";
import { AddCardModal } from "~/components/modals/AddCardModal";
import { getDatabase } from "~/lib/db";
import { cards, cardTags, comments, lists } from "../../../../drizzle/schema";
import {
  MoveCardSchema,
  UpdateCardPositionSchema,
  CardSchema,
  CardUpdateSchema,
  CommentSchema,
} from "~/lib/validation";
import * as v from "valibot";

export const DraggedCardContext =
  createContextId<Signal<string>>("dragged-card");

export const useBoardData = routeLoader$(async (requestEvent) => {
  const boardId = requestEvent.params.id;
  return await getBoard(requestEvent, boardId);
});

export const useUsersData = routeLoader$(async (requestEvent) => {
  return await getUsers(requestEvent);
});

export const useTagsData = routeLoader$(async (requestEvent) => {
  return await getTags(requestEvent);
});

type ActionResult = { success: true } | { success: false; error: string };

type CreateCardActionResult =
  | { success: true; cardId: string }
  | { success: false; error: string };

export const useCreateCardAction = routeAction$<CreateCardActionResult>(
  async (data, requestEvent) => {
    try {
      const db = getDatabase(requestEvent);
      const { params } = requestEvent;

      // Parse tagIds first for validation
      let tagIds: string[] = [];
      if (data.tagIds) {
        try {
          tagIds =
            typeof data.tagIds === "string"
              ? JSON.parse(data.tagIds as string)
              : (data.tagIds as string[]);
        } catch (e) {
          console.error("Failed to parse tagIds:", e);
        }
      }

      // Validate input data
      const parsed = v.safeParse(CardSchema, {
        title: data.title,
        description: data.description || null,
        assigneeId: data.assigneeId,
        tagIds: tagIds.length > 0 ? tagIds : undefined,
      });

      if (!parsed.success) {
        return {
          success: false,
          error: parsed.issues[0]?.message ?? "Invalid card data",
        };
      }

      const validatedData = parsed.output;
      const boardId = params.id;

      // Find the Todo list for this board
      const todoLists = await db
        .select()
        .from(lists)
        .where(eq(lists.boardId, boardId));

      const todoList = todoLists.find((list) => list.title === "Todo");

      if (!todoList) {
        return {
          success: false,
          error: "Todo list not found for this board",
        };
      }

      // Get the highest position in the Todo list
      const maxPositionResult = await db
        .select({ maxPos: max(cards.position) })
        .from(cards)
        .where(eq(cards.listId, todoList.id));

      const nextPosition = (maxPositionResult[0]?.maxPos ?? -1) + 1;

      // Create the card
      const cardId = crypto.randomUUID();

      // Insert card
      await db.insert(cards).values({
        id: cardId,
        listId: todoList.id,
        title: validatedData.title,
        description: validatedData.description ?? null,
        assigneeId: validatedData.assigneeId,
        position: nextPosition,
        completed: false,
      });

      // Add tags if any
      if (validatedData.tagIds && validatedData.tagIds.length > 0) {
        await db.insert(cardTags).values(
          validatedData.tagIds.map((tagId: string) => ({
            cardId,
            tagId,
          })),
        );
      }

      return {
        success: true,
        cardId,
      };
    } catch (error) {
      console.error("Failed to create card:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create card. Please try again.",
      };
    }
  },
);

// Update Card Action
export const useUpdateCardAction = routeAction$<ActionResult>(async (data, requestEvent) => {
  try {
    const db = getDatabase(requestEvent);

    // Parse tagIds first for validation
    let tagIds: string[] = [];
    if (data.tagIds) {
      try {
        tagIds =
          typeof data.tagIds === "string"
            ? JSON.parse(data.tagIds as string)
            : (data.tagIds as string[]);
      } catch (e) {
        console.error("Failed to parse tagIds:", e);
      }
    }

    // Validate input data
    const parsed = v.safeParse(CardUpdateSchema, {
      cardId: data.cardId,
      title: data.title,
      description: data.description || null,
      assigneeId: data.assigneeId,
      tagIds: tagIds.length > 0 ? tagIds : undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.issues[0]?.message ?? "Invalid card data",
      };
    }

    const validatedData = parsed.output;

    // Update card basic fields
    await db
      .update(cards)
      .set({
        title: validatedData.title,
        description: validatedData.description ?? null,
        assigneeId: validatedData.assigneeId,
      })
      .where(eq(cards.id, validatedData.cardId));

    // Update tags - delete existing and insert new ones
    await db.delete(cardTags).where(eq(cardTags.cardId, validatedData.cardId));

    if (validatedData.tagIds && validatedData.tagIds.length > 0) {
      await db.insert(cardTags).values(
        validatedData.tagIds.map((tagId: string) => ({
          cardId: validatedData.cardId,
          tagId,
        })),
      );
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to update card:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update card. Please try again.",
    };
  }
});

// Delete Card Action
export const useDeleteCardAction = routeAction$<ActionResult>(async (data, requestEvent) => {
  try {
    const db = getDatabase(requestEvent);

    const cardId = (data as Record<string, string>).cardId;

    if (!cardId) {
      return {
        success: false,
        error: "Card ID is required",
      };
    }

    await db.delete(cards).where(eq(cards.id, cardId));

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to delete card:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete card. Please try again.",
    };
  }
});

// Update Card List Action (move card to different list)
export const useUpdateCardListAction = routeAction$<ActionResult>(
  async (data, requestEvent) => {
    try {
      const db = getDatabase(requestEvent);

      const parsed = v.safeParse(MoveCardSchema, data);

      if (!parsed.success) {
        return {
          success: false,
          error: parsed.issues[0]?.message ?? "Invalid move payload",
        };
      }

      const payload = parsed.output;

      await db
        .update(cards)
        .set({ listId: payload.listId })
        .where(eq(cards.id, payload.cardId));

      return {
        success: true,
      };
    } catch (error) {
      console.error("Failed to update card list:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to move card. Please try again.",
      };
    }
  },
);

// Update Card Position Action
export const useUpdateCardPositionAction = routeAction$<ActionResult>(
  async (data, requestEvent) => {
    try {
      const db = getDatabase(requestEvent);

      const parsed = v.safeParse(UpdateCardPositionSchema, data);

      if (!parsed.success) {
        return {
          success: false,
          error: parsed.issues[0]?.message ?? "Invalid position payload",
        };
      }

      const payload = parsed.output;

      await db
        .update(cards)
        .set({ position: payload.position })
        .where(eq(cards.id, payload.cardId));

      return {
        success: true,
      };
    } catch (error) {
      console.error("Failed to update card position:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to reorder card. Please try again.",
      };
    }
  },
);

// Update Card Tags Action
export const useUpdateCardTagsAction = routeAction$<ActionResult>(
  async (_data, requestEvent) => {
    try {
      const db = getDatabase(requestEvent);
      const { request } = requestEvent;

      const formData = await request.formData();
      const cardId = formData.get("cardId") as string;
      const tagIds = JSON.parse((formData.get("tagIds") as string) || "[]");

      if (!cardId) {
        return {
          success: false,
          error: "Card ID is required",
        };
      }

      await db.delete(cardTags).where(eq(cardTags.cardId, cardId));

      if (tagIds && tagIds.length > 0) {
        await db.insert(cardTags).values(
          tagIds.map((tagId: string) => ({
            cardId,
            tagId,
          })),
        );
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error("Failed to update card tags:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update tags. Please try again.",
      };
    }
  },
);

// Create Comment Action
export const useCreateCommentAction = routeAction$<ActionResult>(
  async (data, requestEvent) => {
    try {
      const db = getDatabase(requestEvent);

      // Validate input data
      const parsed = v.safeParse(CommentSchema, {
        cardId: data.cardId,
        userId: data.userId,
        text: data.text,
      });

      if (!parsed.success) {
        return {
          success: false,
          error: parsed.issues[0]?.message ?? "Invalid comment data",
        };
      }

      const validatedData = parsed.output;
      const commentId = crypto.randomUUID();

      await db.insert(comments).values({
        id: commentId,
        cardId: validatedData.cardId,
        userId: validatedData.userId,
        text: validatedData.text,
      });

      return {
        success: true,
        commentId,
      };
    } catch (error) {
      console.error("Failed to create comment:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to add comment. Please try again.",
      };
    }
  },
);

// Move Card Action (for drag and drop)
export const useMoveCardAction = routeAction$<ActionResult>(
  async (formData, requestEvent) => {
    try {

      // When called via submit(), formData is the object passed
      // When called via form, formData is the FormData object
      let cardId: string;
      let targetListId: string;
      let newPosition: number;

      if (formData instanceof FormData) {
        cardId = formData.get("cardId") as string;
        targetListId = formData.get("targetListId") as string;
        newPosition = parseInt(formData.get("newPosition") as string, 10);
      } else {
        // Direct object submission
        cardId = (formData as any).cardId;
        targetListId = (formData as any).targetListId;
        newPosition = (formData as any).newPosition;
      }

      const parsed = v.safeParse(MoveCardSchema, {
        cardId,
        listId: targetListId,
        newPosition,
      });

      if (!parsed.success) {
        return {
          success: false,
          error: parsed.issues[0]?.message ?? "Invalid move payload",
        };
      }

      const payload = parsed.output;

      // Import the action function
      const { updateCardListAndPosition } = await import("~/db/actions");

      await updateCardListAndPosition(
        requestEvent,
        payload.cardId,
        payload.listId,
        payload.newPosition,
      );

      return {
        success: true,
      };
    } catch (error) {
      console.error("Failed to move card:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to move card. Please try again.",
      };
    }
  },
);

export default component$(() => {
  const board = useBoardData();
  const users = useUsersData();
  const tags = useTagsData();
  const moveCardAction = useMoveCardAction();
  const createCardAction = useCreateCardAction();
  const updateCardAction = useUpdateCardAction();
  const deleteCardAction = useDeleteCardAction();
  const createCommentAction = useCreateCommentAction();
  const boardState = useSignal<BoardDetails | null>(board.value);
  const isAddCardModalOpen = useSignal(false);
  const draggedCardId = useSignal("");

  useContextProvider(DraggedCardContext, draggedCardId);

  // Derive board data for better reactivity and performance
  const currentBoard = useComputed$(() => boardState.value || board.value);
  const boardOverviewKey = useComputed$(() => {
    const lists = currentBoard.value?.lists ?? [];
    return lists.map((list) => ({ id: list.id, count: list.cards.length }));
  });

  // Handle optimistic card updates
  const handleCardUpdate = $((cardId: string, updates: Partial<BoardCard>) => {
    if (!boardState.value) return;

    const updatedBoard = {
      ...boardState.value,
      lists: boardState.value.lists.map((list) => ({
        ...list,
        cards: list.cards.map((card) =>
          card.id === cardId ? { ...card, ...updates } : card,
        ),
      })),
    };

    boardState.value = updatedBoard;
  });

  // Handle card creation with server-generated ID
  const handleCardAdd = $(
    (cardData: {
      id: string;
      title: string;
      description: string | null;
      assigneeId: string | null;
      tagIds: string[];
    }) => {
      if (!boardState.value) return;

      // Find the Todo list
      const todoList = boardState.value.lists.find(
        (list) => list.title === "Todo",
      );
      if (!todoList) return;

      // Check if card already exists (prevent duplicates)
      const cardExists = boardState.value.lists.some((list) =>
        list.cards.some((card) => card.id === cardData.id),
      );
      if (cardExists) return;

      // Create new card with server-generated ID
      const newCard: BoardCard = {
        id: cardData.id,
        title: cardData.title,
        description: cardData.description,
        assigneeId: cardData.assigneeId,
        position: todoList.cards.length,
        completed: false,
        tags: tags.value.filter((tag) => cardData.tagIds.includes(tag.id)),
        comments: [],
      };

      const updatedBoard = {
        ...boardState.value,
        lists: boardState.value.lists.map((list) =>
          list.title === "Todo"
            ? { ...list, cards: [...list.cards, newCard] }
            : list,
        ),
      };

      boardState.value = updatedBoard;
    },
  );

  // Handle card deletion
  const handleCardDelete = $((cardId: string) => {
    if (!boardState.value) return;

    const updatedBoard = {
      ...boardState.value,
      lists: boardState.value.lists.map((list) => ({
        ...list,
        cards: list.cards.filter((card) => card.id !== cardId),
      })),
    };

    boardState.value = updatedBoard;
  });

  // Handle card drop with optimistic updates
  const handleCardDrop = $(
    (cardId: string, targetListId: string, newPosition: number) => {
      if (!boardState.value) {
        return;
      }

      const updatedLists = boardState.value.lists.map((list) => ({
        ...list,
        cards: list.cards.filter((card) => card.id !== cardId),
      }));

      const targetListIndex = updatedLists.findIndex(
        (list) => list.id === targetListId,
      );
      if (targetListIndex === -1) {
        return;
      }

      const movedCard = boardState.value.lists
        .flatMap((list) => list.cards)
        .find((card) => card.id === cardId);

      if (!movedCard) {
        return;
      }

      const nextTargetCards = updatedLists[targetListIndex].cards
        .slice(0, newPosition)
        .concat({ ...movedCard, position: newPosition })
        .concat(
          updatedLists[targetListIndex].cards
            .slice(newPosition)
            .map((card, idx) => ({
              ...card,
              position: newPosition + 1 + idx,
            })),
        );

      updatedLists[targetListIndex] = {
        ...updatedLists[targetListIndex],
        cards: nextTargetCards,
      };

      boardState.value = {
        ...boardState.value,
        lists: updatedLists,
      };
    },
  );

  // If board not found, show error
  if (!board.value) {
    return (
      <main class="w-full max-w-4xl mx-auto p-8 space-y-10 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
        <div class="text-center space-y-4">
          <h1 class="text-3xl font-bold text-error">Board Not Found</h1>
          <p class="text-base-content/60">
            The board you're looking for doesn't exist.
          </p>
          <Link href="/" class="btn btn-primary">
            Back to Boards
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main class="w-full p-8 space-y-10 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
      <div class="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href="/" class="link link-hover">
              Boards
            </Link>
          </li>
          <li>
            <span class="text-base-content/60">{board.value.title}</span>
          </li>
        </ul>
      </div>

      <div class="space-y-8">
        {/* Board Overview with Charts */}
        {currentBoard.value && (
          <BoardOverview
            key={JSON.stringify(boardOverviewKey.value)}
            data={currentBoard.value}
          />
        )}

        {/* Add Card Button */}
        <div class="flex justify-start mb-4">
          <button
            type="button"
            class="btn btn-primary"
            onClick$={() => (isAddCardModalOpen.value = true)}
          >
            Add Card
          </button>
        </div>

        {/* Lists and Cards */}
        <section class="flex gap-7 overflow-x-auto pb-8">
          {!boardState.value || boardState.value.lists.length === 0 ? (
            <div class="card bg-base-200 dark:bg-base-300 shadow-xl w-full max-w-md mx-auto">
              <div class="card-body items-center text-center">
                <h2 class="card-title text-secondary">No lists yet</h2>
                <p class="text-base-content/60">
                  Add a list to begin organizing work on this board.
                </p>
              </div>
            </div>
          ) : (
            boardState.value.lists.map((list) => (
              <CardList
                key={list.id}
                list={list}
                users={users.value}
                allUsers={users.value}
                allTags={tags.value}
                onCardUpdate={handleCardUpdate}
                onCardDelete={handleCardDelete}
                onCardDrop={handleCardDrop}
                updateCardAction={updateCardAction}
                deleteCardAction={deleteCardAction}
                createCommentAction={createCommentAction}
                moveCardAction={moveCardAction}
              />
            ))
          )}
        </section>
      </div>

      {/* Add Card Modal */}
      <AddCardModal
        boardId={board.value.id}
        users={users.value}
        tags={tags.value}
        isOpen={isAddCardModalOpen}
        action={createCardAction}
        onCardAdd={handleCardAdd}
      />
    </main>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const board = resolveValue(useBoardData);
  return {
    title: board ? `${board.title} - Kanban Board` : "Board Not Found",
    meta: [
      {
        name: "description",
        content: board?.description || "View and manage your Kanban board",
      },
    ],
  };
};
