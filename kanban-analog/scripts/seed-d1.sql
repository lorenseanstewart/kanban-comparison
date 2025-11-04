-- Seed data for Cloudflare D1 database
-- Run with: wrangler d1 execute kanban-db --file=./scripts/seed-d1.sql

-- Clear existing data (optional - comment out if you want to preserve data)
DELETE FROM card_tags;
DELETE FROM comments;
DELETE FROM cards;
DELETE FROM tags;
DELETE FROM lists;
DELETE FROM boards;
DELETE FROM users;

-- Create sample users
INSERT INTO users (id, name) VALUES
  ('2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 'Loren'),
  ('ce642ef6-6367-406e-82ea-b0236361440f', 'Alex'),
  ('288bc717-a551-4a91-8d9d-444d13addb68', 'Dolly'),
  ('9689b595-abe1-4589-838c-1958aae53a94', 'Bobby'),
  ('6ef2bf51-f656-49ac-843f-5954a6f2a00b', 'Sofia');

-- Create sample boards
INSERT INTO boards (id, title, description, created_at)
VALUES
  ('b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'Product Launch', 'Launch prep checklist', 1704096000000),
  ('2b126cd1-627d-489f-81e9-2868305f1945', 'Website Refresh', 'Marketing site overhaul', 1704099600000);

-- Create lists for Product Launch board
INSERT INTO lists (id, board_id, title, position, created_at)
VALUES
  ('7e331af8-1641-4d2b-81e8-1b23085d17fe', 'b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'Todo', 1, 1704182400000),
  ('3ce313c4-7ad5-4e24-896f-9609dfc35dd0', 'b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'In-Progress', 2, 1704186000000),
  ('29d2b707-41d9-42a9-8d13-9f5380add228', 'b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'QA', 3, 1704189600000),
  ('5fb8a343-78f7-4891-85fa-5a17db87151c', 'b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'Done', 4, 1704193200000);

-- Create lists for Website Refresh board
INSERT INTO lists (id, board_id, title, position, created_at)
VALUES
  ('22202c8e-3976-4775-8832-8bc3961d8fed', '2b126cd1-627d-489f-81e9-2868305f1945', 'Todo', 1, 1704268800000),
  ('cf98cc8a-e59a-4590-8fcd-f1d89a8975c8', '2b126cd1-627d-489f-81e9-2868305f1945', 'In-Progress', 2, 1704272400000),
  ('089da10e-c76a-4ff6-8928-fd352a3ddd04', '2b126cd1-627d-489f-81e9-2868305f1945', 'QA', 3, 1704276000000),
  ('42047e01-87ea-4ec6-8ec2-d539b10b3c64', '2b126cd1-627d-489f-81e9-2868305f1945', 'Done', 4, 1704279600000);

-- Create tags
INSERT INTO tags (id, name, color, created_at)
VALUES
  ('bf87f479-2a05-4fe8-8122-22afa5e30141', 'Design', '#8B5CF6', 1704110400000),
  ('3b8bff79-df12-4e14-860b-3e2cebe73cff', 'Product', '#EC4899', 1704114000000),
  ('68421280-45b2-4276-8e4c-9dfc33a349f0', 'Engineering', '#3B82F6', 1704117600000),
  ('14415f32-16aa-4860-87ef-636a7f0dd47f', 'Marketing', '#10B981', 1704121200000),
  ('828ba03d-c9b4-402c-8165-59cb9f67d30f', 'QA', '#F59E0B', 1704124800000);

-- Create cards for Product Launch board
INSERT INTO cards (id, list_id, title, description, assignee_id, position, completed, created_at)
VALUES
  -- Todo list
  ('4c01f11d-3c41-414f-83b2-5e9bba2cefa6', '7e331af8-1641-4d2b-81e8-1b23085d17fe', 'Draft product brief', 'Summarize goals and success metrics.', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 1, 0, 1704355200000),
  ('f3a93a34-956e-43cd-8d7a-acae880153f2', '7e331af8-1641-4d2b-81e8-1b23085d17fe', 'Complete market research', 'Compile competitor landscape report.', '288bc717-a551-4a91-8d9d-444d13addb68', 2, 0, 1704358800000),
  -- In-Progress list
  ('21f71319-8641-42bb-8e3c-b9002fed25a4', '3ce313c4-7ad5-4e24-896f-9609dfc35dd0', 'Build demo environment', 'Set up walkthrough environment with sample data.', 'ce642ef6-6367-406e-82ea-b0236361440f', 1, 0, 1704362400000),
  ('d3d8171c-5025-4cff-88d6-2542ae13f2d3', '3ce313c4-7ad5-4e24-896f-9609dfc35dd0', 'Assemble sales kit', 'Draft enablement materials for sales team.', '9689b595-abe1-4589-838c-1958aae53a94', 2, 0, 1704366000000),
  -- QA list
  ('5868fe01-1f50-4e22-808c-276c8a884a61', '29d2b707-41d9-42a9-8d13-9f5380add228', 'Validate QA checklist', 'Verify release criteria with QA leads.', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 1, 0, 1704369600000),
  ('bc98f392-ca0b-4842-8f58-2b14d3959f04', '29d2b707-41d9-42a9-8d13-9f5380add228', 'Schedule executive sign-off', 'Coordinate leadership review session.', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 2, 0, 1704373200000),
  -- Done list
  ('5125d378-d1e4-4be3-8f92-df5e7115a160', '5fb8a343-78f7-4891-85fa-5a17db87151c', 'Document kickoff notes', 'Capture key decisions from project kickoff.', 'ce642ef6-6367-406e-82ea-b0236361440f', 1, 1, 1704268800000),
  ('8808dae4-ad94-46b5-89db-46edb52efe13', '5fb8a343-78f7-4891-85fa-5a17db87151c', 'Record budget approval', 'Log finance approval confirmation.', '288bc717-a551-4a91-8d9d-444d13addb68', 2, 1, 1704272400000);

-- Create cards for Website Refresh board
INSERT INTO cards (id, list_id, title, description, assignee_id, position, completed, created_at)
VALUES
  -- Todo list
  ('0b20a227-1243-4403-8df8-db7a1db1770d', '22202c8e-3976-4775-8832-8bc3961d8fed', 'Create homepage wireframes', 'Prepare wireframes for hero, features, and pricing.', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 1, 0, 1704441600000),
  ('d4e075b0-5c97-4b3f-893f-e5cced11c9f8', '22202c8e-3976-4775-8832-8bc3961d8fed', 'Research SEO keywords', 'Finalize target keywords for new pages.', '9689b595-abe1-4589-838c-1958aae53a94', 2, 0, 1704445200000),
  -- In-Progress list
  ('29a6974d-db06-45ea-8edf-af9aba1ed799', 'cf98cc8a-e59a-4590-8fcd-f1d89a8975c8', 'Design homepage hero', 'Produce responsive hero assets.', 'ce642ef6-6367-406e-82ea-b0236361440f', 1, 0, 1704448800000),
  ('be948ffa-eb48-4a0d-850a-c6d2c36d852d', 'cf98cc8a-e59a-4590-8fcd-f1d89a8975c8', 'Integrate CMS content', 'Populate CMS entries for refreshed pages.', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 2, 0, 1704452400000),
  -- QA list
  ('dba9e06c-588a-478f-8e7f-51e3c1d6eb06', '089da10e-c76a-4ff6-8928-fd352a3ddd04', 'Run responsive QA', 'Validate layouts across breakpoints.', '288bc717-a551-4a91-8d9d-444d13addb68', 1, 0, 1704456000000),
  ('d1d6a5bd-c3b2-4faf-87f2-9068ce9f98bb', '089da10e-c76a-4ff6-8928-fd352a3ddd04', 'Complete accessibility audit', 'Review accessibility checklist and fix issues.', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 2, 0, 1704459600000),
  -- Done list
  ('8c2240ed-194f-4a1e-8bab-0a7030ac56ce', '42047e01-87ea-4ec6-8ec2-d539b10b3c64', 'Update style guide', 'Publish revised color and typography tokens.', 'ce642ef6-6367-406e-82ea-b0236361440f', 1, 1, 1704355200000),
  ('f4136567-ba8b-4c4a-8128-212e159aa59f', '42047e01-87ea-4ec6-8ec2-d539b10b3c64', 'Confirm analytics setup', 'Verify dashboards reflect new pages.', '9689b595-abe1-4589-838c-1958aae53a94', 2, 1, 1704358800000);

-- Assign tags to cards
INSERT INTO card_tags (card_id, tag_id)
VALUES
  -- Product Launch cards
  ('4c01f11d-3c41-414f-83b2-5e9bba2cefa6', '3b8bff79-df12-4e14-860b-3e2cebe73cff'), -- Draft product brief - Product
  ('4c01f11d-3c41-414f-83b2-5e9bba2cefa6', '14415f32-16aa-4860-87ef-636a7f0dd47f'), -- Draft product brief - Marketing
  ('f3a93a34-956e-43cd-8d7a-acae880153f2', '14415f32-16aa-4860-87ef-636a7f0dd47f'), -- Market research - Marketing
  ('21f71319-8641-42bb-8e3c-b9002fed25a4', '68421280-45b2-4276-8e4c-9dfc33a349f0'), -- Demo environment - Engineering
  ('d3d8171c-5025-4cff-88d6-2542ae13f2d3', '3b8bff79-df12-4e14-860b-3e2cebe73cff'), -- Sales kit - Product
  ('d3d8171c-5025-4cff-88d6-2542ae13f2d3', '14415f32-16aa-4860-87ef-636a7f0dd47f'), -- Sales kit - Marketing
  ('5868fe01-1f50-4e22-808c-276c8a884a61', '828ba03d-c9b4-402c-8165-59cb9f67d30f'), -- QA checklist - QA
  ('bc98f392-ca0b-4842-8f58-2b14d3959f04', '3b8bff79-df12-4e14-860b-3e2cebe73cff'), -- Executive sign-off - Product
  ('5125d378-d1e4-4be3-8f92-df5e7115a160', '3b8bff79-df12-4e14-860b-3e2cebe73cff'), -- Kickoff notes - Product
  ('8808dae4-ad94-46b5-89db-46edb52efe13', '3b8bff79-df12-4e14-860b-3e2cebe73cff'), -- Budget approval - Product
  -- Website Refresh cards
  ('0b20a227-1243-4403-8df8-db7a1db1770d', 'bf87f479-2a05-4fe8-8122-22afa5e30141'), -- Wireframes - Design
  ('d4e075b0-5c97-4b3f-893f-e5cced11c9f8', '14415f32-16aa-4860-87ef-636a7f0dd47f'), -- SEO keywords - Marketing
  ('29a6974d-db06-45ea-8edf-af9aba1ed799', 'bf87f479-2a05-4fe8-8122-22afa5e30141'), -- Hero design - Design
  ('29a6974d-db06-45ea-8edf-af9aba1ed799', '3b8bff79-df12-4e14-860b-3e2cebe73cff'), -- Hero design - Product
  ('be948ffa-eb48-4a0d-850a-c6d2c36d852d', '68421280-45b2-4276-8e4c-9dfc33a349f0'), -- CMS content - Engineering
  ('dba9e06c-588a-478f-8e7f-51e3c1d6eb06', '828ba03d-c9b4-402c-8165-59cb9f67d30f'), -- Responsive QA - QA
  ('d1d6a5bd-c3b2-4faf-87f2-9068ce9f98bb', '828ba03d-c9b4-402c-8165-59cb9f67d30f'), -- Accessibility - QA
  ('8c2240ed-194f-4a1e-8bab-0a7030ac56ce', 'bf87f479-2a05-4fe8-8122-22afa5e30141'), -- Style guide - Design
  ('f4136567-ba8b-4c4a-8128-212e159aa59f', '68421280-45b2-4276-8e4c-9dfc33a349f0'), -- Analytics - Engineering
  ('f4136567-ba8b-4c4a-8128-212e159aa59f', '14415f32-16aa-4860-87ef-636a7f0dd47f'); -- Analytics - Marketing

-- Add sample comments
INSERT INTO comments (id, card_id, user_id, text, created_at)
VALUES
  ('ca17e81b-9e6c-47e8-8901-c6fe3e4d9431', '4c01f11d-3c41-414f-83b2-5e9bba2cefa6', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 'Initial outline drafted.', 1704528000000),
  ('2b2c02a8-0467-4b11-8d99-82776b3bb686', '4c01f11d-3c41-414f-83b2-5e9bba2cefa6', 'ce642ef6-6367-406e-82ea-b0236361440f', 'Review scheduled for tomorrow.', 1704535200000),
  ('74aa8194-0691-4591-8c0c-5dc219c6c67a', 'f3a93a34-956e-43cd-8d7a-acae880153f2', '288bc717-a551-4a91-8d9d-444d13addb68', 'Collected competitor pricing.', 1704538800000),
  ('8d8b25e9-9e7a-4ee0-86a2-df1b197008e4', 'f3a93a34-956e-43cd-8d7a-acae880153f2', '9689b595-abe1-4589-838c-1958aae53a94', 'Will add win-loss insights.', 1704546000000),
  ('eaa05186-35b4-4511-81d1-6d8ae6784b55', '21f71319-8641-42bb-8e3c-b9002fed25a4', 'ce642ef6-6367-406e-82ea-b0236361440f', 'Demo environment bootstrapped.', 1704531600000),
  ('b098967a-1f69-4c3a-8d10-ac3216a99209', '21f71319-8641-42bb-8e3c-b9002fed25a4', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 'QA will test walkthrough.', 1704538800000),
  ('4a1f8db8-f098-4a97-8618-d6c97b6dbd74', 'd3d8171c-5025-4cff-88d6-2542ae13f2d3', '9689b595-abe1-4589-838c-1958aae53a94', 'Draft slides uploaded.', 1704542400000),
  ('c142d2d0-6bb5-4892-8284-7c688e840ebb', 'd3d8171c-5025-4cff-88d6-2542ae13f2d3', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 'Adding launch messaging.', 1704549600000),
  ('bc7390ea-74de-4e8f-886c-91bced77048b', '5868fe01-1f50-4e22-808c-276c8a884a61', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 'Checklist shared with leads.', 1704553200000),
  ('31f972dd-c193-4c51-80e9-14900fea62f8', '5868fe01-1f50-4e22-808c-276c8a884a61', '288bc717-a551-4a91-8d9d-444d13addb68', 'Noted analytics validation.', 1704560400000);

-- Print summary
SELECT 'Seed completed successfully!' as message;
SELECT 'Created:' as summary;
SELECT COUNT(*) || ' users' FROM users;
SELECT COUNT(*) || ' boards' FROM boards;
SELECT COUNT(*) || ' lists' FROM lists;
SELECT COUNT(*) || ' cards' FROM cards;
SELECT COUNT(*) || ' tags' FROM tags;
SELECT COUNT(*) || ' comments' FROM comments;
