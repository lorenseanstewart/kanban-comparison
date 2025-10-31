INSERT OR IGNORE INTO users (id, name) VALUES
('2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 'Loren'),
('ce642ef6-6367-406e-82ea-b0236361440f', 'Alex'),
('288bc717-a551-4a91-8d9d-444d13addb68', 'Dolly'),
('9689b595-abe1-4589-838c-1958aae53a94', 'Bobby'),
('6ef2bf51-f656-49ac-843f-5954a6f2a00b', 'Sofia');

INSERT OR IGNORE INTO boards (id, title, description, created_at) VALUES
('b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'Product Launch', 'Launch prep checklist', 1704099600),
('2b126cd1-627d-489f-81e9-2868305f1945', 'Website Refresh', 'Marketing site overhaul', 1704103200);

INSERT OR IGNORE INTO lists (id, board_id, title, position, created_at) VALUES
('7e331af8-1641-4d2b-81e8-1b23085d17fe', 'b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'Todo', 1, 1704182400),
('3ce313c4-7ad5-4e24-896f-9609dfc35dd0', 'b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'In-Progress', 2, 1704186000),
('29d2b707-41d9-42a9-8d13-9f5380add228', 'b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'QA', 3, 1704189600),
('5fb8a343-78f7-4891-85fa-5a17db87151c', 'b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'Done', 4, 1704193200);

INSERT OR IGNORE INTO lists (id, board_id, title, position, created_at) VALUES
('22202c8e-3976-4775-8832-8bc3961d8fed', '2b126cd1-627d-489f-81e9-2868305f1945', 'Todo', 1, 1704268800),
('cf98cc8a-e59a-4590-8fcd-f1d89a8975c8', '2b126cd1-627d-489f-81e9-2868305f1945', 'In-Progress', 2, 1704272400),
('089da10e-c76a-4ff6-8928-fd352a3ddd04', '2b126cd1-627d-489f-81e9-2868305f1945', 'QA', 3, 1704276000),
('42047e01-87ea-4ec6-8ec2-d539b10b3c64', '2b126cd1-627d-489f-81e9-2868305f1945', 'Done', 4, 1704279600);

INSERT OR IGNORE INTO tags (id, name, color, created_at) VALUES
('bf87f479-2a05-4fe8-8122-22afa5e30141', 'Design', '#8B5CF6', 1704110400),
('3b8bff79-df12-4e14-860b-3e2cebe73cff', 'Product', '#EC4899', 1704114000),
('68421280-45b2-4276-8e4c-9dfc33a349f0', 'Engineering', '#3B82F6', 1704117600),
('14415f32-16aa-4860-87ef-636a7f0dd47f', 'Marketing', '#10B981', 1704121200),
('828ba03d-c9b4-402c-8165-59cb9f67d30f', 'QA', '#F59E0B', 1704124800);

INSERT OR IGNORE INTO cards (id, list_id, title, description, assignee_id, position, completed, created_at) VALUES
-- Todo list
('4c01f11d-3c41-414f-83b2-5e9bba2cefa6', '7e331af8-1641-4d2b-81e8-1b23085d17fe', 'Draft product brief', 'Summarize goals and success metrics.', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 1, 0, 1704358800),
('f3a93a34-956e-43cd-8d7a-acae880153f2', '7e331af8-1641-4d2b-81e8-1b23085d17fe', 'Complete market research', 'Compile competitor landscape report.', '288bc717-a551-4a91-8d9d-444d13addb68', 2, 0, 1704362400),
-- In-Progress list
('21f71319-8641-42bb-8e3c-b9002fed25a4', '3ce313c4-7ad5-4e24-896f-9609dfc35dd0', 'Build demo environment', 'Set up walkthrough environment with sample data.', 'ce642ef6-6367-406e-82ea-b0236361440f', 1, 0, 1704366000),
('d3d8171c-5025-4cff-88d6-2542ae13f2d3', '3ce313c4-7ad5-4e24-896f-9609dfc35dd0', 'Assemble sales kit', 'Draft enablement materials for sales team.', '9689b595-abe1-4589-838c-1958aae53a94', 2, 0, 1704369600),
-- QA list
('5868fe01-1f50-4e22-808c-276c8a884a61', '29d2b707-41d9-42a9-8d13-9f5380add228', 'Validate QA checklist', 'Verify release criteria with QA leads.', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 1, 0, 1704373200),
('bc98f392-ca0b-4842-8f58-2b14d3959f04', '29d2b707-41d9-42a9-8d13-9f5380add228', 'Schedule executive sign-off', 'Coordinate leadership review session.', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 2, 0, 1704376800),
-- Done list
('5125d378-d1e4-4be3-8f92-df5e7115a160', '5fb8a343-78f7-4891-85fa-5a17db87151c', 'Document kickoff notes', 'Capture key decisions from project kickoff.', 'ce642ef6-6367-406e-82ea-b0236361440f', 1, 1, 1704272400),
('8808dae4-ad94-46b5-89db-46edb52efe13', '5fb8a343-78f7-4891-85fa-5a17db87151c', 'Record budget approval', 'Log finance approval confirmation.', '288bc717-a551-4a91-8d9d-444d13addb68', 2, 1, 1704276000);

-- Seed Cards for Board 2: Website Refresh  
INSERT OR IGNORE INTO cards (id, list_id, title, description, assignee_id, position, completed, created_at) VALUES
-- Todo list
('0b20a227-1243-4403-8df8-db7a1db1770d', '22202c8e-3976-4775-8832-8bc3961d8fed', 'Create homepage wireframes', 'Prepare wireframes for hero, features, and pricing.', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 1, 0, 1704445200),
('d4e075b0-5c97-4b3f-893f-e5cced11c9f8', '22202c8e-3976-4775-8832-8bc3961d8fed', 'Research SEO keywords', 'Finalize target keywords for new pages.', '9689b595-abe1-4589-838c-1958aae53a94', 2, 0, 1704448800),
-- In-Progress list
('29a6974d-db06-45ea-8edf-af9aba1ed799', 'cf98cc8a-e59a-4590-8fcd-f1d89a8975c8', 'Design homepage hero', 'Produce responsive hero assets.', 'ce642ef6-6367-406e-82ea-b0236361440f', 1, 0, 1704452400),
('be948ffa-eb48-4a0d-850a-c6d2c36d852d', 'cf98cc8a-e59a-4590-8fcd-f1d89a8975c8', 'Integrate CMS content', 'Populate CMS entries for refreshed pages.', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 2, 0, 1704456000),
-- QA list
('dba9e06c-588a-478f-8e7f-51e3c1d6eb06', '089da10e-c76a-4ff6-8928-fd352a3ddd04', 'Run responsive QA', 'Validate layouts across breakpoints.', '288bc717-a551-4a91-8d9d-444d13addb68', 1, 0, 1704459600),
('d1d6a5bd-c3b2-4faf-87f2-9068ce9f98bb', '089da10e-c76a-4ff6-8928-fd352a3ddd04', 'Complete accessibility audit', 'Review accessibility checklist and fix issues.', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 2, 0, 1704463200),
-- Done list
('8c2240ed-194f-4a1e-8bab-0a7030ac56ce', '42047e01-87ea-4ec6-8ec2-d539b10b3c64', 'Update style guide', 'Publish revised color and typography tokens.', 'ce642ef6-6367-406e-82ea-b0236361440f', 1, 1, 1704355200),
('f4136567-ba8b-4c4a-8128-212e159aa59f', '42047e01-87ea-4ec6-8ec2-d539b10b3c64', 'Confirm analytics setup', 'Verify dashboards reflect new pages.', '9689b595-abe1-4589-838c-1958aae53a94', 2, 1, 1704358800);

-- Seed Card Tags   
INSERT OR IGNORE INTO card_tags (card_id, tag_id) VALUES
-- Product Launch board
('4c01f11d-3c41-414f-83b2-5e9bba2cefa6', '3b8bff79-df12-4e14-860b-3e2cebe73cff'), -- Draft product brief: Product
('4c01f11d-3c41-414f-83b2-5e9bba2cefa6', '14415f32-16aa-4860-87ef-636a7f0dd47f'), -- Draft product brief: Marketing
('f3a93a34-956e-43cd-8d7a-acae880153f2', '14415f32-16aa-4860-87ef-636a7f0dd47f'), -- Complete market research: Marketing
('21f71319-8641-42bb-8e3c-b9002fed25a4', '68421280-45b2-4276-8e4c-9dfc33a349f0'), -- Build demo environment: Engineering
('d3d8171c-5025-4cff-88d6-2542ae13f2d3', '3b8bff79-df12-4e14-860b-3e2cebe73cff'), -- Assemble sales kit: Product
('d3d8171c-5025-4cff-88d6-2542ae13f2d3', '14415f32-16aa-4860-87ef-636a7f0dd47f'), -- Assemble sales kit: Marketing
('5868fe01-1f50-4e22-808c-276c8a884a61', '828ba03d-c9b4-402c-8165-59cb9f67d30f'), -- Validate QA checklist: QA
('bc98f392-ca0b-4842-8f58-2b14d3959f04', '3b8bff79-df12-4e14-860b-3e2cebe73cff'), -- Schedule executive sign-off: Product
('5125d378-d1e4-4be3-8f92-df5e7115a160', '3b8bff79-df12-4e14-860b-3e2cebe73cff'), -- Document kickoff notes: Product
('8808dae4-ad94-46b5-89db-46edb52efe13', '3b8bff79-df12-4e14-860b-3e2cebe73cff'), -- Record budget approval: Product
-- Website Refresh board
('0b20a227-1243-4403-8df8-db7a1db1770d', 'bf87f479-2a05-4fe8-8122-22afa5e30141'), -- Create homepage wireframes: Design
('d4e075b0-5c97-4b3f-893f-e5cced11c9f8', '14415f32-16aa-4860-87ef-636a7f0dd47f'), -- Research SEO keywords: Marketing
('29a6974d-db06-45ea-8edf-af9aba1ed799', 'bf87f479-2a05-4fe8-8122-22afa5e30141'), -- Design homepage hero: Design
('29a6974d-db06-45ea-8edf-af9aba1ed799', '3b8bff79-df12-4e14-860b-3e2cebe73cff'), -- Design homepage hero: Product
('be948ffa-eb48-4a0d-850a-c6d2c36d852d', '68421280-45b2-4276-8e4c-9dfc33a349f0'), -- Integrate CMS content: Engineering
('dba9e06c-588a-478f-8e7f-51e3c1d6eb06', '828ba03d-c9b4-402c-8165-59cb9f67d30f'), -- Run responsive QA: QA
('d1d6a5bd-c3b2-4faf-87f2-9068ce9f98bb', '828ba03d-c9b4-402c-8165-59cb9f67d30f'), -- Complete accessibility audit: QA
('8c2240ed-194f-4a1e-8bab-0a7030ac56ce', 'bf87f479-2a05-4fe8-8122-22afa5e30141'), -- Update style guide: Design
('f4136567-ba8b-4c4a-8128-212e159aa59f', '68421280-45b2-4276-8e4c-9dfc33a349f0'), -- Confirm analytics setup: Engineering
('f4136567-ba8b-4c4a-8128-212e159aa59f', '14415f32-16aa-4860-87ef-636a7f0dd47f'); -- Confirm analytics setup: Marketing

-- Seed Comments    
INSERT OR IGNORE INTO comments (id, card_id, user_id, text, created_at) VALUES
-- Product Launch board comments
('c1a2b3c4-d5e6-f7a8-b9c0-d1e2f3a4b5c6', '4c01f11d-3c41-414f-83b2-5e9bba2cefa6', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 'Starting the product brief draft now.', 1704358800),
('c2a3b4c5-d6e7-f8a9-b0c1-d2e3f4a5b6c7', '4c01f11d-3c41-414f-83b2-5e9bba2cefa6', 'ce642ef6-6367-406e-82ea-b0236361440f', 'Make sure to include competitive analysis.', 1704362400),
('c3a4b5c6-d7e8-f9a0-b1c2-d3e4f5a6b7c8', 'f3a93a34-956e-43cd-8d7a-acae880153f2', '288bc717-a551-4a91-8d9d-444d13addb68', 'Found some great insights on competitor pricing.', 1704366000),
('c4a5b6c7-d8e9-f0a1-b2c3-d4e5f6a7b8c9', '21f71319-8641-42bb-8e3c-b9002fed25a4', 'ce642ef6-6367-406e-82ea-b0236361440f', 'Demo environment is 80% complete.', 1704369600),
('c5a6b7c8-d9e0-f1a2-b3c4-d5e6f7a8b9c0', 'd3d8171c-5025-4cff-88d6-2542ae13f2d3', '9689b595-abe1-4589-838c-1958aae53a94', 'Working on the sales deck now.', 1704373200),
-- Website Refresh board comments
('c6a7b8c9-d0e1-f2a3-b4c5-d6e7f8a9b0c1', '0b20a227-1243-4403-8df8-db7a1db1770d', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 'Initial wireframes look promising.', 1704445200),
('c7a8b9c0-d1e2-f3a4-b5c6-d7e8f9a0b1c2', '29a6974d-db06-45ea-8edf-af9aba1ed799', 'ce642ef6-6367-406e-82ea-b0236361440f', 'Hero design is coming along nicely.', 1704452400),
('c8a9b0c1-d2e3-f4a5-b6c7-d8e9f0a1b2c3', 'dba9e06c-588a-478f-8e7f-51e3c1d6eb06', '288bc717-a551-4a91-8d9d-444d13addb68', 'Found a few responsive issues on mobile.', 1704459600);
