-- name: GetTags :many
SELECT id, name, color
FROM tags
ORDER BY name ASC;
