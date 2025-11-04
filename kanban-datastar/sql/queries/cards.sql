-- name: CardsByListId :many
SELECT 
    c.id AS card_id,
    c.title AS title,
    c.description AS description,
    c.position AS position,
    c.completed AS completed,
    c.assignee_id AS assignee_id,
    u.name AS assignee_name,
    c.list_id AS list_id
FROM cards c
LEFT JOIN users u ON c.assignee_id = u.id -- Include null values, assignee can be null
WHERE c.list_id = ?
ORDER BY c.position ASC;

-- name: MaxPositionInList :one
SELECT CAST(COALESCE(MAX(position), -1) AS INTEGER) as max_position
FROM cards
WHERE list_id = ?;

-- name: CardByCardId :one
SELECT *
FROM cards
WHERE id = ?;

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

-- name: UpdateCardPosition :exec
UPDATE cards
SET position = ?
WHERE id = ?;

-- name: DeleteCard :exec
DELETE FROM cards
WHERE id = ?;

-- name: UpdateListAndCardPosition :exec
UPDATE cards
SET position = ?, list_id = ?, completed = ?
WHERE id = ?;
