-- name: GetUsers :many
SELECT id, name
FROM users
ORDER BY name ASC;
