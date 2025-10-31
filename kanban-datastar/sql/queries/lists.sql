-- name: ListsByBoardId :many
SELECT id, title, position
FROM lists
WHERE board_id = ?
ORDER BY position ASC;

-- name: CreateList :exec
INSERT INTO lists (id, board_id, title, position, created_at)
VALUES (?, ?, ?, ?, ?);

-- name: ListByListId :one
SELECT *
FROM lists
WHERE id = ?
LIMIT 1;
