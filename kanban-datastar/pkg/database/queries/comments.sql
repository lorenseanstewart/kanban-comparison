-- name: GetCommentsByCardIds :many
SELECT id, card_id, user_id, text, created_at
FROM comments
WHERE card_id IN (sqlc.slice('card_ids'))
ORDER BY created_at ASC;

-- name: CreateComment :exec
INSERT INTO comments (id, card_id, user_id, text, created_at)
VALUES (?, ?, ?, ?, ?);
