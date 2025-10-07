import * as v from "valibot";

// Board validation schema
export const BoardSchema = v.object({
  title: v.pipe(
    v.string("Title is required"),
    v.minLength(1, "Title cannot be empty"),
    v.maxLength(255, "Title must be less than 255 characters")
  ),
  description: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(500, "Description must be less than 500 characters")
    )
  ),
});

export type BoardInput = v.InferInput<typeof BoardSchema>;
export type BoardOutput = v.InferOutput<typeof BoardSchema>;

// Card validation schema
const tagIdsField = v.optional(
  v.pipe(
    v.union([v.string(), v.array(v.string())]),
    v.transform((value) => {
      if (Array.isArray(value)) {
        return value;
      }

      if (value.trim().length === 0) {
        return [];
      }

      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }),
    v.array(v.string())
  ),
  []
);

export const CardSchema = v.object({
  title: v.pipe(
    v.string("Title is required"),
    v.minLength(1, "Title cannot be empty"),
    v.maxLength(255, "Title must be less than 255 characters")
  ),
  description: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(2000, "Description must be less than 2000 characters")
    )
  ),
  assigneeId: v.optional(v.string()),
  tagIds: tagIdsField,
});

export type CardInput = v.InferInput<typeof CardSchema>;
export type CardOutput = v.InferOutput<typeof CardSchema>;

// Card update validation schema
export const CardUpdateSchema = v.object({
  cardId: v.string("Card ID is required"),
  title: v.pipe(
    v.string("Title is required"),
    v.minLength(1, "Title cannot be empty"),
    v.maxLength(255, "Title must be less than 255 characters")
  ),
  description: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(2000, "Description must be less than 2000 characters")
    )
  ),
  assigneeId: v.optional(v.string()),
  tagIds: tagIdsField,
});

export type CardUpdateInput = v.InferInput<typeof CardUpdateSchema>;
export type CardUpdateOutput = v.InferOutput<typeof CardUpdateSchema>;

// Comment validation schema
export const CommentSchema = v.object({
  cardId: v.string("Card ID is required"),
  userId: v.string("User ID is required"),
  text: v.pipe(
    v.string("Comment text is required"),
    v.minLength(1, "Comment text cannot be empty"),
    v.maxLength(1000, "Comment must be less than 1000 characters")
  ),
});

export type CommentInput = v.InferInput<typeof CommentSchema>;
export type CommentOutput = v.InferOutput<typeof CommentSchema>;

const positionField = v.pipe(
  v.union([v.string(), v.number()]),
  v.transform((value) =>
    typeof value === "string" ? Number.parseInt(value, 10) : value
  ),
  v.number("Position must be a number"),
  v.transform((value) => Math.max(0, Math.floor(value)))
);

export const MoveCardSchema = v.object({
  cardId: v.string("Card ID is required"),
  listId: v.string("Target list ID is required"),
  newPosition: positionField,
});

export type MoveCardInput = v.InferInput<typeof MoveCardSchema>;

export const UpdateCardPositionSchema = v.object({
  cardId: v.string("Card ID is required"),
  position: positionField,
});

export type UpdateCardPositionInput = v.InferInput<typeof UpdateCardPositionSchema>;

