-- +goose Up
CREATE TABLE IF NOT EXISTS users (
    id text PRIMARY KEY NOT NULL,
    name text NOT NULL
);

CREATE TABLE IF NOT EXISTS boards (
    id text PRIMARY KEY NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    created_at integer NOT NULL
);

CREATE TABLE IF NOT EXISTS lists (
    id text PRIMARY KEY NOT NULL,
    board_id text NOT NULL,
    title text NOT NULL,
    position integer NOT NULL,
    created_at integer NOT NULL,
    FOREIGN KEY (board_id) REFERENCES boards (id) ON UPDATE NO ACTION ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS lists_board_id_idx ON lists (board_id);
CREATE INDEX IF NOT EXISTS lists_position_idx ON lists (position);

CREATE TABLE IF NOT EXISTS tags (
    id text PRIMARY KEY NOT NULL,
    name text NOT NULL,
    color text NOT NULL,
    created_at integer NOT NULL
);

CREATE TABLE IF NOT EXISTS cards (
    id text PRIMARY KEY NOT NULL,
    list_id text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    assignee_id text,
    position integer NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at integer NOT NULL,
    FOREIGN KEY (list_id) REFERENCES lists (id) ON UPDATE NO ACTION ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES users (id) ON UPDATE NO ACTION ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS cards_list_id_idx ON cards (list_id);
CREATE INDEX IF NOT EXISTS cards_position_idx ON cards (position);
CREATE INDEX IF NOT EXISTS cards_assignee_id_idx ON cards (assignee_id);

CREATE TABLE IF NOT EXISTS card_tags (
    card_id text NOT NULL,
    tag_id text NOT NULL,
    PRIMARY KEY (card_id, tag_id),
    FOREIGN KEY (card_id) REFERENCES cards (id) ON UPDATE NO ACTION ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON UPDATE NO ACTION ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS card_tags_card_id_idx ON card_tags (card_id);
CREATE INDEX IF NOT EXISTS card_tags_tag_id_idx ON card_tags (tag_id);

CREATE TABLE IF NOT EXISTS comments (
    id text PRIMARY KEY NOT NULL,
    card_id text NOT NULL,
    user_id text NOT NULL,
    text text NOT NULL,
    created_at integer NOT NULL,
    FOREIGN KEY (card_id) REFERENCES cards (id) ON UPDATE NO ACTION ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE NO ACTION ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS comments_card_id_idx ON comments (card_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments (user_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments (created_at);

