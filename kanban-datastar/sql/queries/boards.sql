-- name: Boards :many
SELECT id, title, description
FROM boards
ORDER BY created_at ASC;

-- name: Board :one
SELECT id, title, description
FROM boards
WHERE id = ?
LIMIT 1;

-- name: CreateBoard :exec
INSERT INTO boards (id, title, description, created_at)
VALUES (?, ?, ?, ?);
