import * as v from "valibot";

// Board validation schema
export const BoardSchema = v.object({
  title: v.pipe(
    v.string("Title is required"),
    v.minLength(1, "Title cannot be empty"),
    v.maxLength(255, "Title must be less than 255 characters")
  ),
  description: v.nullish(
    v.pipe(
      v.string(),
      v.maxLength(500, "Description must be less than 500 characters")
    ),
    null
  ),
});

export type BoardInput = v.InferInput<typeof BoardSchema>;
export type BoardOutput = v.InferOutput<typeof BoardSchema>;

// Card validation schema
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
  assigneeId: v.pipe(
    v.string("Assignee is required"),
    v.minLength(1, "Assignee is required")
  ),
  tagIds: v.optional(v.array(v.string())),
});

export type CardInput = v.InferInput<typeof CardSchema>;
export type CardOutput = v.InferOutput<typeof CardSchema>;

// Card create validation schema (includes boardId)
export const CardCreateSchema = v.object({
  boardId: v.pipe(v.string("Board ID is required"), v.minLength(1, "Board ID is required")),
  title: v.pipe(
    v.string("Card title is required"),
    v.minLength(1, "Card title cannot be empty"),
    v.maxLength(255, "Card title must be less than 255 characters")
  ),
  description: v.nullish(
    v.pipe(
      v.string(),
      v.maxLength(2000, "Card description must be less than 2000 characters")
    ),
    null
  ),
  assigneeId: v.nullish(v.string(), null),
  tagIds: v.optional(v.array(v.string()), () => []),
});

export type CardCreateInput = v.InferInput<typeof CardCreateSchema>;
export type CardCreateOutput = v.InferOutput<typeof CardCreateSchema>;

// Card update validation schema
export const CardUpdateSchema = v.object({
  cardId: v.string("Card ID is required"),
  title: v.pipe(
    v.string("Title is required"),
    v.minLength(1, "Title cannot be empty"),
    v.maxLength(255, "Title must be less than 255 characters")
  ),
  description: v.nullish(
    v.pipe(
      v.string(),
      v.maxLength(2000, "Description must be less than 2000 characters")
    ),
    null
  ),
  assigneeId: v.nullish(v.string(), null),
  tagIds: v.optional(v.array(v.string()), () => []),
});

export type CardUpdateInput = v.InferInput<typeof CardUpdateSchema>;
export type CardUpdateOutput = v.InferOutput<typeof CardUpdateSchema>;

// Comment validation schema
export const CommentSchema = v.object({
  cardId: v.string("Card ID is required"),
  userId: v.pipe(
    v.string("User is required"),
    v.minLength(1, "User is required")
  ),
  text: v.pipe(
    v.string("Comment text is required"),
    v.minLength(1, "Comment text cannot be empty"),
    v.maxLength(1000, "Comment must be less than 1000 characters")
  ),
});

export type CommentInput = v.InferInput<typeof CommentSchema>;
export type CommentOutput = v.InferOutput<typeof CommentSchema>;
