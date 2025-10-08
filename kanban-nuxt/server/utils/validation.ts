import * as v from 'valibot'

export const BoardSchema = v.object({
  title: v.pipe(
    v.string('Title is required'),
    v.minLength(1, 'Title cannot be empty'),
    v.maxLength(255, 'Title must be less than 255 characters')
  ),
  description: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(500, 'Description must be less than 500 characters')
    ),
    null
  ),
})

export const CardSchema = v.object({
  title: v.pipe(
    v.string('Title is required'),
    v.minLength(1, 'Title cannot be empty'),
    v.maxLength(255, 'Title must be less than 255 characters')
  ),
  description: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(2000, 'Description must be less than 2000 characters')
    ),
    null
  ),
  assigneeId: v.optional(v.string(), null),
  tagIds: v.optional(v.array(v.string()), []),
})

export const CardUpdateSchema = v.object({
  title: v.optional(
    v.pipe(
      v.string(),
      v.minLength(1, 'Title cannot be empty'),
      v.maxLength(255, 'Title must be less than 255 characters')
    )
  ),
  description: v.optional(v.pipe(v.string(), v.maxLength(2000, 'Description must be less than 2000 characters')), null),
  assigneeId: v.optional(v.pipe(v.string(), v.uuid('Invalid assignee ID')), null),
  tagIds: v.optional(v.array(v.pipe(v.string(), v.uuid('Invalid tag ID')))),
})

export const CommentSchema = v.object({
  content: v.pipe(
    v.string('Content is required'),
    v.minLength(1, 'Comment cannot be empty'),
    v.maxLength(1000, 'Comment must be less than 1000 characters')
  ),
  cardId: v.pipe(v.string('Card ID is required'), v.uuid('Invalid card ID')),
  userId: v.pipe(v.string('User ID is required'), v.uuid('Invalid user ID')),
})
