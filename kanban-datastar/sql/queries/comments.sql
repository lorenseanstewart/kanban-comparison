-- name: CommentsByCardId :many
SELECT 
    c.id as comment_id,  
    u.id as user_id, 
    u.name as user_name, 
    c.text as comment_text,
    c.created_at
FROM comments c
INNER JOIN users u ON c.user_id = u.id
WHERE c.card_id = ?
ORDER BY created_at ASC;

-- name: CreateComment :exec
INSERT INTO comments (id, card_id, user_id, text, created_at)
VALUES (?, ?, ?, ?, ?);
