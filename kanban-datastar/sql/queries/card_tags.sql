-- name: TagsByCardId :many
SELECT ct.card_id, t.id as tag_id, t.name as tag_name, t.color as tag_color
FROM card_tags ct
INNER JOIN tags t ON ct.tag_id = t.id
WHERE ct.card_id = ?;

-- name: CreateCardTag :exec
INSERT INTO card_tags (card_id, tag_id)
VALUES (?, ?);
