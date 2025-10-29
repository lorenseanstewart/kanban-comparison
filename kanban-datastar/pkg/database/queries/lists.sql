-- name: GetListsByBoardId :many
SELECT id, title, position
FROM lists
WHERE board_id = ?
ORDER BY position ASC;

-- name: GetListByBoardIdAndTitle :one
SELECT id, title, position, board_id
FROM lists
WHERE board_id = ? AND title = ?
LIMIT 1;

-- name: CreateList :exec
INSERT INTO lists (id, board_id, title, position, created_at)
VALUES (?, ?, ?, ?, ?);
