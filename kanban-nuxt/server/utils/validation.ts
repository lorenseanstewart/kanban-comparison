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
  tagIds: v.optional(v.array(v.string())),
});

export type CardInput = v.InferInput<typeof CardSchema>;
export type CardOutput = v.InferOutput<typeof CardSchema>;

// Card update validation schema (cardId comes from URL, not body)
export const CardUpdateSchema = v.pipe(
  v.object({
    title: v.optional(v.pipe(
      v.string("Title is required"),
      v.minLength(1, "Title cannot be empty"),
      v.maxLength(255, "Title must be less than 255 characters")
    )),
    description: v.optional(v.nullable(
      v.pipe(
        v.string(),
        v.maxLength(2000, "Description must be less than 2000 characters")
      )
    )),
    assigneeId: v.optional(v.string()),
    tagIds: v.optional(v.array(v.pipe(v.any(), v.transform((val) => val)))),
  }),
  v.transform((input) => {
    // Filter out null/undefined/empty values from tagIds array
    if (input.tagIds) {
      input.tagIds = input.tagIds.filter((id: any): id is string =>
        id !== null && id !== undefined && id !== '' && typeof id === 'string'
      );
    }
    // Convert empty string assigneeId to null for database
    if (input.assigneeId === '') {
      input.assigneeId = null as any;
    }
    return input;
  })
);

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
