-- Seed data for Kanban HTMX application
-- This script populates the D1 database with sample data

-- Clear existing data (in reverse order of dependencies)
DELETE FROM card_tags;
DELETE FROM comments;
DELETE FROM cards;
DELETE FROM lists;
DELETE FROM boards;
DELETE FROM tags;
DELETE FROM users;

-- Users
INSERT INTO users (id, name) VALUES
  ('2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 'Loren'),
  ('ce642ef6-6367-406e-82ea-b0236361440f', 'Alex'),
  ('288bc717-a551-4a91-8d9d-444d13addb68', 'Dolly'),
  ('9689b595-abe1-4589-838c-1958aae53a94', 'Bobby'),
  ('6ef2bf51-f656-49ac-843f-5954a6f2a00b', 'Sofia');

-- Boards
INSERT INTO boards (id, title, description, created_at) VALUES
  ('b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'Product Launch', 'Launch prep checklist', '2024-01-01T09:00:00.000Z'),
  ('2b126cd1-627d-489f-81e9-2868305f1945', 'Website Refresh', 'Marketing site overhaul', '2024-01-01T10:00:00.000Z');

-- Lists for Product Launch board
INSERT INTO lists (id, board_id, title, position, created_at) VALUES
  ('7e331af8-1641-4d2b-81e8-1b23085d17fe', 'b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'Todo', 1, '2024-01-02T08:00:00.000Z'),
  ('3ce313c4-7ad5-4e24-896f-9609dfc35dd0', 'b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'In-Progress', 2, '2024-01-02T09:00:00.000Z'),
  ('29d2b707-41d9-42a9-8d13-9f5380add228', 'b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'QA', 3, '2024-01-02T10:00:00.000Z'),
  ('5fb8a343-78f7-4891-85fa-5a17db87151c', 'b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'Done', 4, '2024-01-02T11:00:00.000Z');

-- Lists for Website Refresh board
INSERT INTO lists (id, board_id, title, position, created_at) VALUES
  ('22202c8e-3976-4775-8832-8bc3961d8fed', '2b126cd1-627d-489f-81e9-2868305f1945', 'Todo', 1, '2024-01-03T08:00:00.000Z'),
  ('cf98cc8a-e59a-4590-8fcd-f1d89a8975c8', '2b126cd1-627d-489f-81e9-2868305f1945', 'In-Progress', 2, '2024-01-03T09:00:00.000Z'),
  ('089da10e-c76a-4ff6-8928-fd352a3ddd04', '2b126cd1-627d-489f-81e9-2868305f1945', 'QA', 3, '2024-01-03T10:00:00.000Z'),
  ('42047e01-87ea-4ec6-8ec2-d539b10b3c64', '2b126cd1-627d-489f-81e9-2868305f1945', 'Done', 4, '2024-01-03T11:00:00.000Z');

-- Tags
INSERT INTO tags (id, name, color, created_at) VALUES
  ('bf87f479-2a05-4fe8-8122-22afa5e30141', 'Design', '#8B5CF6', '2024-01-01T12:00:00.000Z'),
  ('3b8bff79-df12-4e14-860b-3e2cebe73cff', 'Product', '#EC4899', '2024-01-01T13:00:00.000Z'),
  ('68421280-45b2-4276-8e4c-9dfc33a349f0', 'Engineering', '#3B82F6', '2024-01-01T14:00:00.000Z'),
  ('14415f32-16aa-4860-87ef-636a7f0dd47f', 'Marketing', '#10B981', '2024-01-01T15:00:00.000Z'),
  ('828ba03d-c9b4-402c-8165-59cb9f67d30f', 'QA', '#F59E0B', '2024-01-01T16:00:00.000Z');

-- Cards for Product Launch board
INSERT INTO cards (id, list_id, title, description, assignee_id, position, completed, created_at) VALUES
  ('4c01f11d-3c41-414f-83b2-5e9bba2cefa6', '7e331af8-1641-4d2b-81e8-1b23085d17fe', 'Draft product brief', 'Summarize goals and success metrics.', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 1, 0, '2024-01-04T09:00:00.000Z'),
  ('f3a93a34-956e-43cd-8d7a-acae880153f2', '7e331af8-1641-4d2b-81e8-1b23085d17fe', 'Complete market research', 'Compile competitor landscape report.', '288bc717-a551-4a91-8d9d-444d13addb68', 2, 0, '2024-01-04T10:00:00.000Z'),
  ('21f71319-8641-42bb-8e3c-b9002fed25a4', '3ce313c4-7ad5-4e24-896f-9609dfc35dd0', 'Build demo environment', 'Set up walkthrough environment with sample data.', 'ce642ef6-6367-406e-82ea-b0236361440f', 1, 0, '2024-01-04T11:00:00.000Z'),
  ('d3d8171c-5025-4cff-88d6-2542ae13f2d3', '3ce313c4-7ad5-4e24-896f-9609dfc35dd0', 'Assemble sales kit', 'Draft enablement materials for sales team.', '9689b595-abe1-4589-838c-1958aae53a94', 2, 0, '2024-01-04T12:00:00.000Z'),
  ('5868fe01-1f50-4e22-808c-276c8a884a61', '29d2b707-41d9-42a9-8d13-9f5380add228', 'Validate QA checklist', 'Verify release criteria with QA leads.', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 1, 0, '2024-01-04T13:00:00.000Z'),
  ('bc98f392-ca0b-4842-8f58-2b14d3959f04', '29d2b707-41d9-42a9-8d13-9f5380add228', 'Schedule executive sign-off', 'Coordinate leadership review session.', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 2, 0, '2024-01-04T14:00:00.000Z'),
  ('5125d378-d1e4-4be3-8f92-df5e7115a160', '5fb8a343-78f7-4891-85fa-5a17db87151c', 'Document kickoff notes', 'Capture key decisions from project kickoff.', 'ce642ef6-6367-406e-82ea-b0236361440f', 1, 1, '2024-01-03T09:00:00.000Z'),
  ('8808dae4-ad94-46b5-89db-46edb52efe13', '5fb8a343-78f7-4891-85fa-5a17db87151c', 'Record budget approval', 'Log finance approval confirmation.', '288bc717-a551-4a91-8d9d-444d13addb68', 2, 1, '2024-01-03T10:00:00.000Z');

-- Cards for Website Refresh board
INSERT INTO cards (id, list_id, title, description, assignee_id, position, completed, created_at) VALUES
  ('0b20a227-1243-4403-8df8-db7a1db1770d', '22202c8e-3976-4775-8832-8bc3961d8fed', 'Create homepage wireframes', 'Prepare wireframes for hero, features, and pricing.', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 1, 0, '2024-01-05T09:00:00.000Z'),
  ('d4e075b0-5c97-4b3f-893f-e5cced11c9f8', '22202c8e-3976-4775-8832-8bc3961d8fed', 'Research SEO keywords', 'Finalize target keywords for new pages.', '9689b595-abe1-4589-838c-1958aae53a94', 2, 0, '2024-01-05T10:00:00.000Z'),
  ('29a6974d-db06-45ea-8edf-af9aba1ed799', 'cf98cc8a-e59a-4590-8fcd-f1d89a8975c8', 'Design homepage hero', 'Produce responsive hero assets.', 'ce642ef6-6367-406e-82ea-b0236361440f', 1, 0, '2024-01-05T11:00:00.000Z'),
  ('be948ffa-eb48-4a0d-850a-c6d2c36d852d', 'cf98cc8a-e59a-4590-8fcd-f1d89a8975c8', 'Integrate CMS content', 'Populate CMS entries for refreshed pages.', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 2, 0, '2024-01-05T12:00:00.000Z'),
  ('dba9e06c-588a-478f-8e7f-51e3c1d6eb06', '089da10e-c76a-4ff6-8928-fd352a3ddd04', 'Run responsive QA', 'Validate layouts across breakpoints.', '288bc717-a551-4a91-8d9d-444d13addb68', 1, 0, '2024-01-05T13:00:00.000Z'),
  ('d1d6a5bd-c3b2-4faf-87f2-9068ce9f98bb', '089da10e-c76a-4ff6-8928-fd352a3ddd04', 'Complete accessibility audit', 'Review accessibility checklist and fix issues.', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 2, 0, '2024-01-05T14:00:00.000Z'),
  ('8c2240ed-194f-4a1e-8bab-0a7030ac56ce', '42047e01-87ea-4ec6-8ec2-d539b10b3c64', 'Update style guide', 'Publish revised color and typography tokens.', 'ce642ef6-6367-406e-82ea-b0236361440f', 1, 1, '2024-01-04T08:00:00.000Z'),
  ('f4136567-ba8b-4c4a-8128-212e159aa59f', '42047e01-87ea-4ec6-8ec2-d539b10b3c64', 'Confirm analytics setup', 'Verify dashboards reflect new pages.', '9689b595-abe1-4589-838c-1958aae53a94', 2, 1, '2024-01-04T09:00:00.000Z');

-- Card Tags
INSERT INTO card_tags (card_id, tag_id) VALUES
  ('4c01f11d-3c41-414f-83b2-5e9bba2cefa6', '3b8bff79-df12-4e14-860b-3e2cebe73cff'),
  ('4c01f11d-3c41-414f-83b2-5e9bba2cefa6', '14415f32-16aa-4860-87ef-636a7f0dd47f'),
  ('f3a93a34-956e-43cd-8d7a-acae880153f2', '14415f32-16aa-4860-87ef-636a7f0dd47f'),
  ('21f71319-8641-42bb-8e3c-b9002fed25a4', '68421280-45b2-4276-8e4c-9dfc33a349f0'),
  ('d3d8171c-5025-4cff-88d6-2542ae13f2d3', '3b8bff79-df12-4e14-860b-3e2cebe73cff'),
  ('d3d8171c-5025-4cff-88d6-2542ae13f2d3', '14415f32-16aa-4860-87ef-636a7f0dd47f'),
  ('5868fe01-1f50-4e22-808c-276c8a884a61', '828ba03d-c9b4-402c-8165-59cb9f67d30f'),
  ('bc98f392-ca0b-4842-8f58-2b14d3959f04', '3b8bff79-df12-4e14-860b-3e2cebe73cff'),
  ('5125d378-d1e4-4be3-8f92-df5e7115a160', '3b8bff79-df12-4e14-860b-3e2cebe73cff'),
  ('8808dae4-ad94-46b5-89db-46edb52efe13', '3b8bff79-df12-4e14-860b-3e2cebe73cff'),
  ('0b20a227-1243-4403-8df8-db7a1db1770d', 'bf87f479-2a05-4fe8-8122-22afa5e30141'),
  ('d4e075b0-5c97-4b3f-893f-e5cced11c9f8', '14415f32-16aa-4860-87ef-636a7f0dd47f'),
  ('29a6974d-db06-45ea-8edf-af9aba1ed799', 'bf87f479-2a05-4fe8-8122-22afa5e30141'),
  ('29a6974d-db06-45ea-8edf-af9aba1ed799', '3b8bff79-df12-4e14-860b-3e2cebe73cff'),
  ('be948ffa-eb48-4a0d-850a-c6d2c36d852d', '68421280-45b2-4276-8e4c-9dfc33a349f0'),
  ('dba9e06c-588a-478f-8e7f-51e3c1d6eb06', '828ba03d-c9b4-402c-8165-59cb9f67d30f'),
  ('d1d6a5bd-c3b2-4faf-87f2-9068ce9f98bb', '828ba03d-c9b4-402c-8165-59cb9f67d30f'),
  ('8c2240ed-194f-4a1e-8bab-0a7030ac56ce', 'bf87f479-2a05-4fe8-8122-22afa5e30141'),
  ('f4136567-ba8b-4c4a-8128-212e159aa59f', '68421280-45b2-4276-8e4c-9dfc33a349f0'),
  ('f4136567-ba8b-4c4a-8128-212e159aa59f', '14415f32-16aa-4860-87ef-636a7f0dd47f');

-- Comments
INSERT INTO comments (id, card_id, user_id, text, created_at) VALUES
  ('ca17e81b-9e6c-47e8-8901-c6fe3e4d9431', '4c01f11d-3c41-414f-83b2-5e9bba2cefa6', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 'Initial outline drafted.', '2024-01-06T09:00:00.000Z'),
  ('2b2c02a8-0467-4b11-8d99-82776b3bb686', '4c01f11d-3c41-414f-83b2-5e9bba2cefa6', 'ce642ef6-6367-406e-82ea-b0236361440f', 'Review scheduled for tomorrow.', '2024-01-06T11:00:00.000Z'),
  ('74aa8194-0691-4591-8c0c-5dc219c6c67a', 'f3a93a34-956e-43cd-8d7a-acae880153f2', '288bc717-a551-4a91-8d9d-444d13addb68', 'Collected competitor pricing.', '2024-01-06T12:00:00.000Z'),
  ('8d8b25e9-9e7a-4ee0-86a2-df1b197008e4', 'f3a93a34-956e-43cd-8d7a-acae880153f2', '9689b595-abe1-4589-838c-1958aae53a94', 'Will add win-loss insights.', '2024-01-06T14:00:00.000Z'),
  ('eaa05186-35b4-4511-81d1-6d8ae6784b55', '21f71319-8641-42bb-8e3c-b9002fed25a4', 'ce642ef6-6367-406e-82ea-b0236361440f', 'Demo environment bootstrapped.', '2024-01-06T10:00:00.000Z'),
  ('b098967a-1f69-4c3a-8d10-ac3216a99209', '21f71319-8641-42bb-8e3c-b9002fed25a4', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 'QA will test walkthrough.', '2024-01-06T12:00:00.000Z'),
  ('4a1f8db8-f098-4a97-8618-d6c97b6dbd74', 'd3d8171c-5025-4cff-88d6-2542ae13f2d3', '9689b595-abe1-4589-838c-1958aae53a94', 'Draft slides uploaded.', '2024-01-06T13:00:00.000Z'),
  ('c142d2d0-6bb5-4892-8284-7c688e840ebb', 'd3d8171c-5025-4cff-88d6-2542ae13f2d3', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 'Adding launch messaging.', '2024-01-06T15:00:00.000Z'),
  ('bc7390ea-74de-4e8f-886c-91bced77048b', '5868fe01-1f50-4e22-808c-276c8a884a61', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 'Checklist shared with leads.', '2024-01-06T16:00:00.000Z'),
  ('31f972dd-c193-4c51-80e9-14900fea62f8', '5868fe01-1f50-4e22-808c-276c8a884a61', '288bc717-a551-4a91-8d9d-444d13addb68', 'Noted analytics validation.', '2024-01-06T18:00:00.000Z'),
  ('7251856a-43f0-4f71-89d0-3ded9439bb26', 'bc98f392-ca0b-4842-8f58-2b14d3959f04', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 'Sent invite to executives.', '2024-01-06T17:00:00.000Z'),
  ('6578e46d-5db4-45ab-899f-463f471e3729', 'bc98f392-ca0b-4842-8f58-2b14d3959f04', 'ce642ef6-6367-406e-82ea-b0236361440f', 'Deck updated for review.', '2024-01-06T19:00:00.000Z'),
  ('66920c38-7208-4444-878a-db1f4dcf9f2b', '5125d378-d1e4-4be3-8f92-df5e7115a160', 'ce642ef6-6367-406e-82ea-b0236361440f', 'Kickoff notes published.', '2024-01-05T09:00:00.000Z'),
  ('0dd67bda-0d1f-40a1-85a2-a1fe8c22ee03', '5125d378-d1e4-4be3-8f92-df5e7115a160', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 'Linked recording for reference.', '2024-01-05T11:00:00.000Z'),
  ('de7b5602-9d09-42f5-8cd8-9c9938229508', '8808dae4-ad94-46b5-89db-46edb52efe13', '288bc717-a551-4a91-8d9d-444d13addb68', 'Finance confirmed coverage.', '2024-01-05T10:00:00.000Z'),
  ('69cc2cb7-2c6d-4f05-84f3-14bfbec37d87', '8808dae4-ad94-46b5-89db-46edb52efe13', '9689b595-abe1-4589-838c-1958aae53a94', 'Updated spreadsheet totals.', '2024-01-05T12:00:00.000Z'),
  ('14e33081-6dbc-4dc7-88f6-bf41c145d8c3', '0b20a227-1243-4403-8df8-db7a1db1770d', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 'Wireframes ready for review.', '2024-01-07T09:00:00.000Z'),
  ('5e118d42-c342-4bd3-8c1e-9044c5d50738', '0b20a227-1243-4403-8df8-db7a1db1770d', 'ce642ef6-6367-406e-82ea-b0236361440f', 'UI feedback added.', '2024-01-07T11:00:00.000Z'),
  ('037b6ba4-edb8-4612-882e-00fe45576aa2', 'd4e075b0-5c97-4b3f-893f-e5cced11c9f8', '9689b595-abe1-4589-838c-1958aae53a94', 'Keyword list complete.', '2024-01-07T10:00:00.000Z'),
  ('59988edf-6646-41f9-8fba-a76aaa1f9487', 'd4e075b0-5c97-4b3f-893f-e5cced11c9f8', '288bc717-a551-4a91-8d9d-444d13addb68', 'Content briefs next.', '2024-01-07T12:00:00.000Z'),
  ('48d3d424-25f5-4ab6-8073-396dab649803', '29a6974d-db06-45ea-8edf-af9aba1ed799', 'ce642ef6-6367-406e-82ea-b0236361440f', 'Hero concept drafted.', '2024-01-07T13:00:00.000Z'),
  ('4870ab00-fa52-4227-8087-8a441ad8a7e7', '29a6974d-db06-45ea-8edf-af9aba1ed799', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 'Product copy added.', '2024-01-07T15:00:00.000Z'),
  ('4666f2c7-6568-4a66-87ce-e3f75365359f', 'be948ffa-eb48-4a0d-850a-c6d2c36d852d', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 'CMS entries published.', '2024-01-07T14:00:00.000Z'),
  ('418ab0e7-014a-4305-87d8-72f71cfaefae', 'be948ffa-eb48-4a0d-850a-c6d2c36d852d', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 'QA will validate content.', '2024-01-07T16:00:00.000Z'),
  ('d18fd8a2-453e-426c-8ae8-224eb2d5513b', 'dba9e06c-588a-478f-8e7f-51e3c1d6eb06', '288bc717-a551-4a91-8d9d-444d13addb68', 'Tablet layout approved.', '2024-01-07T17:00:00.000Z'),
  ('c71be2ba-9cf4-441d-8bc8-3eda3bd24b0f', 'dba9e06c-588a-478f-8e7f-51e3c1d6eb06', '9689b595-abe1-4589-838c-1958aae53a94', 'Mobile tweaks needed.', '2024-01-07T18:00:00.000Z'),
  ('38991ba8-f6a7-4d28-84ca-7236a64523ca', 'd1d6a5bd-c3b2-4faf-87f2-9068ce9f98bb', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 'Audit checklist in progress.', '2024-01-07T19:00:00.000Z'),
  ('efc10646-0497-45c6-8874-872eb28a8e5d', 'd1d6a5bd-c3b2-4faf-87f2-9068ce9f98bb', 'ce642ef6-6367-406e-82ea-b0236361440f', 'Color contrast updated.', '2024-01-07T20:00:00.000Z'),
  ('41674b74-51b7-4aeb-89cd-a1f2096326b6', '8c2240ed-194f-4a1e-8bab-0a7030ac56ce', 'ce642ef6-6367-406e-82ea-b0236361440f', 'Style guide synced to repo.', '2024-01-05T08:00:00.000Z'),
  ('2d48f368-d550-48a8-85de-739f22726e03', '8c2240ed-194f-4a1e-8bab-0a7030ac56ce', '288bc717-a551-4a91-8d9d-444d13addb68', 'Design tokens verified.', '2024-01-05T10:00:00.000Z'),
  ('06d66a80-910b-45b7-8849-967fece94020', 'f4136567-ba8b-4c4a-8128-212e159aa59f', '9689b595-abe1-4589-838c-1958aae53a94', 'Dashboards refreshed.', '2024-01-05T09:00:00.000Z'),
  ('57ce1ff5-3a51-42de-8ef7-376093a7d95c', 'f4136567-ba8b-4c4a-8128-212e159aa59f', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 'KPIs pinned for launch.', '2024-01-05T11:00:00.000Z');
