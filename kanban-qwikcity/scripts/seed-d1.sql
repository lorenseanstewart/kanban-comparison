-- Seed data for Cloudflare D1 database
-- Run with: wrangler d1 execute kanban-db --file=./scripts/seed-d1.sql

-- Clear existing data (optional - comment out if you want to preserve data)
DELETE FROM comments;
DELETE FROM card_tags;
DELETE FROM cards;
DELETE FROM tags;
DELETE FROM lists;
DELETE FROM boards;
DELETE FROM users;

-- Create sample users
INSERT INTO users (id, name) VALUES
  ('user-1', 'Alice Johnson'),
  ('user-2', 'Bob Smith'),
  ('user-3', 'Carol Davis');

-- Create sample board
INSERT INTO boards (id, title, description, created_at)
VALUES ('b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'Team Project Board', 'Main project tracking board', strftime('%s', 'now') * 1000);

-- Create lists
INSERT INTO lists (id, board_id, title, position, created_at)
VALUES
  ('list-1', 'b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'Backlog', 0, strftime('%s', 'now') * 1000),
  ('list-2', 'b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'To Do', 1, strftime('%s', 'now') * 1000),
  ('list-3', 'b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'In Progress', 2, strftime('%s', 'now') * 1000),
  ('list-4', 'b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'Done', 3, strftime('%s', 'now') * 1000);

-- Create tags
INSERT INTO tags (id, name, color, created_at)
VALUES
  ('tag-1', 'Bug', '#ef4444', strftime('%s', 'now') * 1000),
  ('tag-2', 'Feature', '#3b82f6', strftime('%s', 'now') * 1000),
  ('tag-3', 'Documentation', '#10b981', strftime('%s', 'now') * 1000),
  ('tag-4', 'High Priority', '#f59e0b', strftime('%s', 'now') * 1000);

-- Create cards in Backlog
INSERT INTO cards (id, list_id, title, description, assignee_id, position, completed, created_at)
VALUES
  ('card-1', 'list-1', 'Add user authentication', 'Implement login/logout functionality', 'user-1', 0, 0, strftime('%s', 'now') * 1000),
  ('card-2', 'list-1', 'Design new landing page', 'Create mockups for homepage redesign', 'user-2', 1, 0, strftime('%s', 'now') * 1000),
  ('card-3', 'list-1', 'Set up CI/CD pipeline', 'Configure automated testing and deployment', NULL, 2, 0, strftime('%s', 'now') * 1000);

-- Create cards in To Do
INSERT INTO cards (id, list_id, title, description, assignee_id, position, completed, created_at)
VALUES
  ('card-4', 'list-2', 'Fix mobile responsive issues', 'Navigation menu breaks on small screens', 'user-1', 0, 0, strftime('%s', 'now') * 1000),
  ('card-5', 'list-2', 'Update API documentation', 'Document new endpoints and parameters', 'user-3', 1, 0, strftime('%s', 'now') * 1000),
  ('card-6', 'list-2', 'Optimize database queries', 'Improve performance of dashboard queries', 'user-2', 2, 0, strftime('%s', 'now') * 1000);

-- Create cards in In Progress
INSERT INTO cards (id, list_id, title, description, assignee_id, position, completed, created_at)
VALUES
  ('card-7', 'list-3', 'Implement drag and drop', 'Add ability to reorder tasks', 'user-1', 0, 0, strftime('%s', 'now') * 1000),
  ('card-8', 'list-3', 'Add dark mode support', 'Implement theme switching', 'user-2', 1, 0, strftime('%s', 'now') * 1000);

-- Create cards in Done
INSERT INTO cards (id, list_id, title, description, assignee_id, position, completed, created_at)
VALUES
  ('card-9', 'list-4', 'Set up project repository', 'Initialize Git repo and configure tools', 'user-3', 0, 1, strftime('%s', 'now') * 1000),
  ('card-10', 'list-4', 'Create initial UI components', 'Build reusable component library', 'user-1', 1, 1, strftime('%s', 'now') * 1000),
  ('card-11', 'list-4', 'Write project README', 'Document project setup and guidelines', 'user-2', 2, 1, strftime('%s', 'now') * 1000);

-- Assign tags to cards
INSERT INTO card_tags (card_id, tag_id)
VALUES
  ('card-1', 'tag-2'), -- Add user authentication - Feature
  ('card-2', 'tag-2'), -- Design landing page - Feature
  ('card-3', 'tag-2'), -- CI/CD - Feature
  ('card-4', 'tag-1'), -- Mobile issues - Bug
  ('card-4', 'tag-4'), -- Mobile issues - High Priority
  ('card-5', 'tag-3'), -- API docs - Documentation
  ('card-6', 'tag-4'), -- Optimize queries - High Priority
  ('card-7', 'tag-2'), -- Drag and drop - Feature
  ('card-8', 'tag-2'); -- Dark mode - Feature

-- Add comments to some cards
INSERT INTO comments (id, card_id, user_id, text, created_at)
VALUES
  ('comment-1', 'card-1', 'user-2', 'Should we use OAuth or JWT?', strftime('%s', 'now') * 1000),
  ('comment-2', 'card-1', 'user-1', 'Let''s go with JWT for simplicity', strftime('%s', 'now') * 1000 + 3600000),
  ('comment-3', 'card-4', 'user-3', 'I can test this on my phone', strftime('%s', 'now') * 1000),
  ('comment-4', 'card-7', 'user-1', 'Implemented using dnd-kit library', strftime('%s', 'now') * 1000),
  ('comment-5', 'card-9', 'user-2', 'Great work team! 🎉', strftime('%s', 'now') * 1000);

-- Print summary
SELECT 'Seed completed successfully! 🌱' as message;
SELECT 'Created:' as summary;
SELECT COUNT(*) || ' users' FROM users;
SELECT COUNT(*) || ' boards' FROM boards;
SELECT COUNT(*) || ' lists' FROM lists;
SELECT COUNT(*) || ' cards' FROM cards;
SELECT COUNT(*) || ' tags' FROM tags;
SELECT COUNT(*) || ' comments' FROM comments;
