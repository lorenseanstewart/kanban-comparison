-- +goose Up
-- +goose StatementBegin
CREATE TABLE users (
    id text PRIMARY KEY NOT NULL,
    name text NOT NULL
);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TABLE boards (
    id text PRIMARY KEY NOT NULL,
    title text NOT NULL,
    description text,
    created_at integer NOT NULL
);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TABLE lists (
    id text PRIMARY KEY NOT NULL,
    board_id text NOT NULL,
    title text NOT NULL,
    position integer NOT NULL,
    created_at integer NOT NULL,
    FOREIGN KEY (board_id) REFERENCES boards (id) ON UPDATE NO ACTION ON DELETE CASCADE
);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX lists_board_id_idx ON lists (board_id);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX lists_position_idx ON lists (position);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TABLE tags (
    id text PRIMARY KEY NOT NULL,
    name text NOT NULL,
    color text NOT NULL,
    created_at integer NOT NULL
);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TABLE cards (
    id text PRIMARY KEY NOT NULL,
    list_id text NOT NULL,
    title text NOT NULL,
    description text,
    assignee_id text,
    position integer NOT NULL,
    completed integer DEFAULT false,
    created_at integer NOT NULL,
    FOREIGN KEY (list_id) REFERENCES lists (id) ON UPDATE NO ACTION ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES users (id) ON UPDATE NO ACTION ON DELETE SET NULL
);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX cards_list_id_idx ON cards (list_id);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX cards_position_idx ON cards (position);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX cards_assignee_id_idx ON cards (assignee_id);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TABLE card_tags (
    card_id text NOT NULL,
    tag_id text NOT NULL,
    PRIMARY KEY (card_id, tag_id),
    FOREIGN KEY (card_id) REFERENCES cards (id) ON UPDATE NO ACTION ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON UPDATE NO ACTION ON DELETE CASCADE
);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX card_tags_card_id_idx ON card_tags (card_id);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX card_tags_tag_id_idx ON card_tags (tag_id);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TABLE comments (
    id text PRIMARY KEY NOT NULL,
    card_id text NOT NULL,
    user_id text NOT NULL,
    text text NOT NULL,
    created_at integer NOT NULL,
    FOREIGN KEY (card_id) REFERENCES cards (id) ON UPDATE NO ACTION ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE NO ACTION ON DELETE SET NULL
);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX comments_card_id_idx ON comments (card_id);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX comments_user_id_idx ON comments (user_id);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE INDEX comments_created_at_idx ON comments (created_at);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS comments;
-- +goose StatementEnd

-- +goose StatementBegin
DROP TABLE IF EXISTS card_tags;
-- +goose StatementEnd

-- +goose StatementBegin
DROP TABLE IF EXISTS cards;
-- +goose StatementEnd

-- +goose StatementBegin
DROP TABLE IF EXISTS tags;
-- +goose StatementEnd

-- +goose StatementBegin
DROP TABLE IF EXISTS lists;
-- +goose StatementEnd

-- +goose StatementBegin
DROP TABLE IF EXISTS boards;
-- +goose StatementEnd

-- +goose StatementBegin
DROP TABLE IF EXISTS users;
-- +goose StatementEnd
