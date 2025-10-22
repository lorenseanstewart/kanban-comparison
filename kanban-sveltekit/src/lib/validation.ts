import * as v from 'valibot';

// Board validation schema
export const BoardSchema = v.object({
	title: v.pipe(
		v.string('Title is required'),
		v.minLength(1, 'Title cannot be empty'),
		v.maxLength(255, 'Title must be less than 255 characters')
	),
	description: v.optional(
		v.pipe(v.string(), v.maxLength(500, 'Description must be less than 500 characters'))
	)
});

export type BoardInput = v.InferInput<typeof BoardSchema>;
export type BoardOutput = v.InferOutput<typeof BoardSchema>;

// Card validation schema
export const CardSchema = v.object({
	boardId: v.string('Board ID is required'),
	title: v.pipe(
		v.string('Title is required'),
		v.minLength(1, 'Title cannot be empty'),
		v.maxLength(255, 'Title must be less than 255 characters')
	),
	description: v.optional(
		v.pipe(v.string(), v.maxLength(2000, 'Description must be less than 2000 characters'))
	),
	assigneeId: v.optional(v.string()),
	tagIds: v.optional(v.array(v.string()))
});

export type CardInput = v.InferInput<typeof CardSchema>;
export type CardOutput = v.InferOutput<typeof CardSchema>;

// Card update validation schema
export const CardUpdateSchema = v.object({
	boardId: v.string('Board ID is required'),
	cardId: v.string('Card ID is required'),
	title: v.pipe(
		v.string('Title is required'),
		v.minLength(1, 'Title cannot be empty'),
		v.maxLength(255, 'Title must be less than 255 characters')
	),
	description: v.optional(
		v.pipe(v.string(), v.maxLength(2000, 'Description must be less than 2000 characters'))
	),
	assigneeId: v.optional(v.string()),
	tagIds: v.optional(v.array(v.string()))
});

export type CardUpdateInput = v.InferInput<typeof CardUpdateSchema>;
export type CardUpdateOutput = v.InferOutput<typeof CardUpdateSchema>;

// Comment validation schema
export const CommentSchema = v.object({
	boardId: v.string('Board ID is required'),
	cardId: v.string('Card ID is required'),
	userId: v.string('User ID is required'),
	text: v.pipe(
		v.string('Comment text is required'),
		v.minLength(1, 'Comment text cannot be empty'),
		v.maxLength(1000, 'Comment must be less than 1000 characters')
	)
});

export type CommentInput = v.InferInput<typeof CommentSchema>;
export type CommentOutput = v.InferOutput<typeof CommentSchema>;

// Card list update schema
export const CardListUpdateSchema = v.object({
	cardId: v.string('Card ID is required'),
	newListId: v.string('List ID is required'),
	boardId: v.string('Board ID is required')
});

export type CardListUpdateInput = v.InferInput<typeof CardListUpdateSchema>;
export type CardListUpdateOutput = v.InferOutput<typeof CardListUpdateSchema>;

// Card position update schema
export const CardPositionUpdateSchema = v.object({
	cardIds: v.array(v.string()),
	boardId: v.string('Board ID is required')
});

export type CardPositionUpdateInput = v.InferInput<typeof CardPositionUpdateSchema>;
export type CardPositionUpdateOutput = v.InferOutput<typeof CardPositionUpdateSchema>;

// Delete card schema
export const DeleteCardSchema = v.object({
	cardId: v.string('Card ID is required'),
	boardId: v.string('Board ID is required')
});

export type DeleteCardInput = v.InferInput<typeof DeleteCardSchema>;
export type DeleteCardOutput = v.InferOutput<typeof DeleteCardSchema>;
