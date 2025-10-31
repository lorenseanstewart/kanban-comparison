-- name: GetCardsByListIds :many
SELECT id, title, description, position, completed, assignee_id, list_id
FROM cards
WHERE list_id IN (sqlc.slice('list_ids'))
ORDER BY position ASC;

-- name: GetMaxPositionInList :one
SELECT CAST(COALESCE(MAX(position), -1) AS INTEGER) as max_position
FROM cards
WHERE list_id = ?;

-- name: GetCardByCardId :one
SELECT *
FROM cards
WHERE id = ?
LIMIT 1;

-- name: CreateCard :exec
INSERT INTO cards (id, list_id, title, description, assignee_id, position, completed, created_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?);

-- name: UpdateCardCompleted :exec
UPDATE cards
SET completed = ?
WHERE id = ?;

-- name: UpdateCard :exec
UPDATE cards
SET title = ?,
    description = ?,
    assignee_id = ?
WHERE id = ?;

-- name: UpdateCardList :exec
UPDATE cards
SET list_id = ?
WHERE id = ?;

-- name: UpdateCardPosition :exec
UPDATE cards
SET position = ?
WHERE id = ?;

-- name: DeleteCard :exec
DELETE FROM cards
WHERE id = ?;
