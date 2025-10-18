import * as v from 'valibot'

export const BoardSchema = v.object({
  title: v.pipe(
    v.string('Board title is required'),
    v.minLength(1, 'Board title cannot be empty'),
    v.maxLength(255, 'Board title must be less than 255 characters')
  ),
  description: v.nullish(
    v.pipe(
      v.string('Board description must be text'),
      v.maxLength(500, 'Board description must be less than 500 characters')
    )
  ),
})

export const CardSchema = v.object({
  title: v.pipe(
    v.string('Card title is required'),
    v.minLength(1, 'Card title cannot be empty'),
    v.maxLength(255, 'Card title must be less than 255 characters')
  ),
  description: v.nullish(
    v.pipe(
      v.string('Card description must be text'),
      v.maxLength(2000, 'Card description must be less than 2000 characters')
    )
  ),
  assigneeId: v.nullish(v.string('Assignee must be a valid user ID')),
  tagIds: v.optional(v.array(v.string('Each tag ID must be a valid string'), 'Tags must be provided as an array'), []),
})

export const CardUpdateSchema = v.object({
  title: v.optional(
    v.pipe(
      v.string('Card title must be text'),
      v.minLength(1, 'Card title cannot be empty'),
      v.maxLength(255, 'Card title must be less than 255 characters')
    )
  ),
  description: v.nullish(
    v.pipe(
      v.string('Card description must be text'),
      v.maxLength(2000, 'Card description must be less than 2000 characters')
    )
  ),
  assigneeId: v.nullish(v.string('Assignee must be a valid user ID')),
  tagIds: v.optional(v.array(v.string('Each tag ID must be a valid string'), 'Tags must be provided as an array')),
})

export const CommentSchema = v.object({
  text: v.pipe(
    v.string('Comment text is required'),
    v.minLength(1, 'Comment text cannot be empty'),
    v.maxLength(1000, 'Comment text must be less than 1000 characters')
  ),
  cardId: v.string('Card ID is required to add a comment'),
  userId: v.string('User must be selected to add a comment'),
})
