import { db } from '../lib/db';
import { users, boards, lists, cards, tags, cardTags, comments } from '../../drizzle/schema';

const timestamp = (day: number, hour: number, minute = 0) => new Date(Date.UTC(2024, 0, day, hour, minute));

const usersData = [
  { id: '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', name: 'Loren' },
  { id: 'ce642ef6-6367-406e-82ea-b0236361440f', name: 'Alex' },
  { id: '288bc717-a551-4a91-8d9d-444d13addb68', name: 'Dolly' },
  { id: '9689b595-abe1-4589-838c-1958aae53a94', name: 'Bobby' },
  { id: '6ef2bf51-f656-49ac-843f-5954a6f2a00b', name: 'Sofia' },
];

const boardsData = [
  { id: 'b05927a0-76d2-42d5-8ad3-a1b93c39698c', title: 'Product Launch', description: 'Launch prep checklist', createdAt: timestamp(1, 9) },
  { id: '2b126cd1-627d-489f-81e9-2868305f1945', title: 'Website Refresh', description: 'Marketing site overhaul', createdAt: timestamp(1, 10) },
];

const listTitles = ['Todo', 'In-Progress', 'QA', 'Done'];

const listIds = [
  ['7e331af8-1641-4d2b-81e8-1b23085d17fe', '3ce313c4-7ad5-4e24-896f-9609dfc35dd0', '29d2b707-41d9-42a9-8d13-9f5380add228', '5fb8a343-78f7-4891-85fa-5a17db87151c'],
  ['22202c8e-3976-4775-8832-8bc3961d8fed', 'cf98cc8a-e59a-4590-8fcd-f1d89a8975c8', '089da10e-c76a-4ff6-8928-fd352a3ddd04', '42047e01-87ea-4ec6-8ec2-d539b10b3c64'],
];

const listsData = boardsData.flatMap((board, boardIndex) =>
  listTitles.map((title, titleIndex) => ({
    id: listIds[boardIndex][titleIndex],
    boardId: board.id,
    title,
    position: titleIndex + 1,
    createdAt: timestamp(2 + boardIndex, 8 + titleIndex),
  })),
);

const listIdByKey = new Map<string, string>();
for (const list of listsData) {
  listIdByKey.set(`${list.boardId}:${list.title}`, list.id);
}

const ensureListId = (boardId: string, title: string) => {
  const id = listIdByKey.get(`${boardId}:${title}`);
  if (!id) {
    throw new Error(`Missing list for ${boardId} ${title}`);
  }
  return id;
};

const cardsData = [
  { id: '4c01f11d-3c41-414f-83b2-5e9bba2cefa6', listId: ensureListId('b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'Todo'), title: 'Draft product brief', description: 'Summarize goals and success metrics.', assigneeId: '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', position: 1, completed: false, createdAt: timestamp(4, 9) },
  { id: 'f3a93a34-956e-43cd-8d7a-acae880153f2', listId: ensureListId('b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'Todo'), title: 'Complete market research', description: 'Compile competitor landscape report.', assigneeId: '288bc717-a551-4a91-8d9d-444d13addb68', position: 2, completed: false, createdAt: timestamp(4, 10) },
  { id: '21f71319-8641-42bb-8e3c-b9002fed25a4', listId: ensureListId('b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'In-Progress'), title: 'Build demo environment', description: 'Set up walkthrough environment with sample data.', assigneeId: 'ce642ef6-6367-406e-82ea-b0236361440f', position: 1, completed: false, createdAt: timestamp(4, 11) },
  { id: 'd3d8171c-5025-4cff-88d6-2542ae13f2d3', listId: ensureListId('b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'In-Progress'), title: 'Assemble sales kit', description: 'Draft enablement materials for sales team.', assigneeId: '9689b595-abe1-4589-838c-1958aae53a94', position: 2, completed: false, createdAt: timestamp(4, 12) },
  { id: '5868fe01-1f50-4e22-808c-276c8a884a61', listId: ensureListId('b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'QA'), title: 'Validate QA checklist', description: 'Verify release criteria with QA leads.', assigneeId: '6ef2bf51-f656-49ac-843f-5954a6f2a00b', position: 1, completed: false, createdAt: timestamp(4, 13) },
  { id: 'bc98f392-ca0b-4842-8f58-2b14d3959f04', listId: ensureListId('b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'QA'), title: 'Schedule executive sign-off', description: 'Coordinate leadership review session.', assigneeId: '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', position: 2, completed: false, createdAt: timestamp(4, 14) },
  { id: '5125d378-d1e4-4be3-8f92-df5e7115a160', listId: ensureListId('b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'Done'), title: 'Document kickoff notes', description: 'Capture key decisions from project kickoff.', assigneeId: 'ce642ef6-6367-406e-82ea-b0236361440f', position: 1, completed: true, createdAt: timestamp(3, 9) },
  { id: '8808dae4-ad94-46b5-89db-46edb52efe13', listId: ensureListId('b05927a0-76d2-42d5-8ad3-a1b93c39698c', 'Done'), title: 'Record budget approval', description: 'Log finance approval confirmation.', assigneeId: '288bc717-a551-4a91-8d9d-444d13addb68', position: 2, completed: true, createdAt: timestamp(3, 10) },
  { id: '0b20a227-1243-4403-8df8-db7a1db1770d', listId: ensureListId('2b126cd1-627d-489f-81e9-2868305f1945', 'Todo'), title: 'Create homepage wireframes', description: 'Prepare wireframes for hero, features, and pricing.', assigneeId: '6ef2bf51-f656-49ac-843f-5954a6f2a00b', position: 1, completed: false, createdAt: timestamp(5, 9) },
  { id: 'd4e075b0-5c97-4b3f-893f-e5cced11c9f8', listId: ensureListId('2b126cd1-627d-489f-81e9-2868305f1945', 'Todo'), title: 'Research SEO keywords', description: 'Finalize target keywords for new pages.', assigneeId: '9689b595-abe1-4589-838c-1958aae53a94', position: 2, completed: false, createdAt: timestamp(5, 10) },
  { id: '29a6974d-db06-45ea-8edf-af9aba1ed799', listId: ensureListId('2b126cd1-627d-489f-81e9-2868305f1945', 'In-Progress'), title: 'Design homepage hero', description: 'Produce responsive hero assets.', assigneeId: 'ce642ef6-6367-406e-82ea-b0236361440f', position: 1, completed: false, createdAt: timestamp(5, 11) },
  { id: 'be948ffa-eb48-4a0d-850a-c6d2c36d852d', listId: ensureListId('2b126cd1-627d-489f-81e9-2868305f1945', 'In-Progress'), title: 'Integrate CMS content', description: 'Populate CMS entries for refreshed pages.', assigneeId: '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', position: 2, completed: false, createdAt: timestamp(5, 12) },
  { id: 'dba9e06c-588a-478f-8e7f-51e3c1d6eb06', listId: ensureListId('2b126cd1-627d-489f-81e9-2868305f1945', 'QA'), title: 'Run responsive QA', description: 'Validate layouts across breakpoints.', assigneeId: '288bc717-a551-4a91-8d9d-444d13addb68', position: 1, completed: false, createdAt: timestamp(5, 13) },
  { id: 'd1d6a5bd-c3b2-4faf-87f2-9068ce9f98bb', listId: ensureListId('2b126cd1-627d-489f-81e9-2868305f1945', 'QA'), title: 'Complete accessibility audit', description: 'Review accessibility checklist and fix issues.', assigneeId: '6ef2bf51-f656-49ac-843f-5954a6f2a00b', position: 2, completed: false, createdAt: timestamp(5, 14) },
  { id: '8c2240ed-194f-4a1e-8bab-0a7030ac56ce', listId: ensureListId('2b126cd1-627d-489f-81e9-2868305f1945', 'Done'), title: 'Update style guide', description: 'Publish revised color and typography tokens.', assigneeId: 'ce642ef6-6367-406e-82ea-b0236361440f', position: 1, completed: true, createdAt: timestamp(4, 8) },
  { id: 'f4136567-ba8b-4c4a-8128-212e159aa59f', listId: ensureListId('2b126cd1-627d-489f-81e9-2868305f1945', 'Done'), title: 'Confirm analytics setup', description: 'Verify dashboards reflect new pages.', assigneeId: '9689b595-abe1-4589-838c-1958aae53a94', position: 2, completed: true, createdAt: timestamp(4, 9) },
];

const tagsData = [
  { id: 'bf87f479-2a05-4fe8-8122-22afa5e30141', name: 'Design', color: '#8B5CF6', createdAt: timestamp(1, 12) }, // Purple
  { id: '3b8bff79-df12-4e14-860b-3e2cebe73cff', name: 'Product', color: '#EC4899', createdAt: timestamp(1, 13) }, // Pink
  { id: '68421280-45b2-4276-8e4c-9dfc33a349f0', name: 'Engineering', color: '#3B82F6', createdAt: timestamp(1, 14) }, // Blue
  { id: '14415f32-16aa-4860-87ef-636a7f0dd47f', name: 'Marketing', color: '#10B981', createdAt: timestamp(1, 15) }, // Green
  { id: '828ba03d-c9b4-402c-8165-59cb9f67d30f', name: 'QA', color: '#F59E0B', createdAt: timestamp(1, 16) }, // Amber
];

const cardTagsData = [
  { cardId: '4c01f11d-3c41-414f-83b2-5e9bba2cefa6', tagId: '3b8bff79-df12-4e14-860b-3e2cebe73cff' },
  { cardId: '4c01f11d-3c41-414f-83b2-5e9bba2cefa6', tagId: '14415f32-16aa-4860-87ef-636a7f0dd47f' },
  { cardId: 'f3a93a34-956e-43cd-8d7a-acae880153f2', tagId: '14415f32-16aa-4860-87ef-636a7f0dd47f' },
  { cardId: '21f71319-8641-42bb-8e3c-b9002fed25a4', tagId: '68421280-45b2-4276-8e4c-9dfc33a349f0' },
  { cardId: 'd3d8171c-5025-4cff-88d6-2542ae13f2d3', tagId: '3b8bff79-df12-4e14-860b-3e2cebe73cff' },
  { cardId: 'd3d8171c-5025-4cff-88d6-2542ae13f2d3', tagId: '14415f32-16aa-4860-87ef-636a7f0dd47f' },
  { cardId: '5868fe01-1f50-4e22-808c-276c8a884a61', tagId: '828ba03d-c9b4-402c-8165-59cb9f67d30f' },
  { cardId: 'bc98f392-ca0b-4842-8f58-2b14d3959f04', tagId: '3b8bff79-df12-4e14-860b-3e2cebe73cff' },
  { cardId: '5125d378-d1e4-4be3-8f92-df5e7115a160', tagId: '3b8bff79-df12-4e14-860b-3e2cebe73cff' },
  { cardId: '8808dae4-ad94-46b5-89db-46edb52efe13', tagId: '3b8bff79-df12-4e14-860b-3e2cebe73cff' },
  { cardId: '0b20a227-1243-4403-8df8-db7a1db1770d', tagId: 'bf87f479-2a05-4fe8-8122-22afa5e30141' },
  { cardId: 'd4e075b0-5c97-4b3f-893f-e5cced11c9f8', tagId: '14415f32-16aa-4860-87ef-636a7f0dd47f' },
  { cardId: '29a6974d-db06-45ea-8edf-af9aba1ed799', tagId: 'bf87f479-2a05-4fe8-8122-22afa5e30141' },
  { cardId: '29a6974d-db06-45ea-8edf-af9aba1ed799', tagId: '3b8bff79-df12-4e14-860b-3e2cebe73cff' },
  { cardId: 'be948ffa-eb48-4a0d-850a-c6d2c36d852d', tagId: '68421280-45b2-4276-8e4c-9dfc33a349f0' },
  { cardId: 'dba9e06c-588a-478f-8e7f-51e3c1d6eb06', tagId: '828ba03d-c9b4-402c-8165-59cb9f67d30f' },
  { cardId: 'd1d6a5bd-c3b2-4faf-87f2-9068ce9f98bb', tagId: '828ba03d-c9b4-402c-8165-59cb9f67d30f' },
  { cardId: '8c2240ed-194f-4a1e-8bab-0a7030ac56ce', tagId: 'bf87f479-2a05-4fe8-8122-22afa5e30141' },
  { cardId: 'f4136567-ba8b-4c4a-8128-212e159aa59f', tagId: '68421280-45b2-4276-8e4c-9dfc33a349f0' },
  { cardId: 'f4136567-ba8b-4c4a-8128-212e159aa59f', tagId: '14415f32-16aa-4860-87ef-636a7f0dd47f' },
];

const comment = (id: string, cardId: string, userId: string, text: string, day: number, hour: number, minute = 0) => ({
  id,
  cardId,
  userId,
  text,
  createdAt: timestamp(day, hour, minute),
});

const commentsData = [
  comment('ca17e81b-9e6c-47e8-8901-c6fe3e4d9431', '4c01f11d-3c41-414f-83b2-5e9bba2cefa6', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 'Initial outline drafted.', 6, 9),
  comment('2b2c02a8-0467-4b11-8d99-82776b3bb686', '4c01f11d-3c41-414f-83b2-5e9bba2cefa6', 'ce642ef6-6367-406e-82ea-b0236361440f', 'Review scheduled for tomorrow.', 6, 11),
  comment('74aa8194-0691-4591-8c0c-5dc219c6c67a', 'f3a93a34-956e-43cd-8d7a-acae880153f2', '288bc717-a551-4a91-8d9d-444d13addb68', 'Collected competitor pricing.', 6, 12),
  comment('8d8b25e9-9e7a-4ee0-86a2-df1b197008e4', 'f3a93a34-956e-43cd-8d7a-acae880153f2', '9689b595-abe1-4589-838c-1958aae53a94', 'Will add win-loss insights.', 6, 14),
  comment('eaa05186-35b4-4511-81d1-6d8ae6784b55', '21f71319-8641-42bb-8e3c-b9002fed25a4', 'ce642ef6-6367-406e-82ea-b0236361440f', 'Demo environment bootstrapped.', 6, 10),
  comment('b098967a-1f69-4c3a-8d10-ac3216a99209', '21f71319-8641-42bb-8e3c-b9002fed25a4', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 'QA will test walkthrough.', 6, 12),
  comment('4a1f8db8-f098-4a97-8618-d6c97b6dbd74', 'd3d8171c-5025-4cff-88d6-2542ae13f2d3', '9689b595-abe1-4589-838c-1958aae53a94', 'Draft slides uploaded.', 6, 13),
  comment('c142d2d0-6bb5-4892-8284-7c688e840ebb', 'd3d8171c-5025-4cff-88d6-2542ae13f2d3', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 'Adding launch messaging.', 6, 15),
  comment('bc7390ea-74de-4e8f-886c-91bced77048b', '5868fe01-1f50-4e22-808c-276c8a884a61', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 'Checklist shared with leads.', 6, 16),
  comment('31f972dd-c193-4c51-80e9-14900fea62f8', '5868fe01-1f50-4e22-808c-276c8a884a61', '288bc717-a551-4a91-8d9d-444d13addb68', 'Noted analytics validation.', 6, 18),
  comment('7251856a-43f0-4f71-89d0-3ded9439bb26', 'bc98f392-ca0b-4842-8f58-2b14d3959f04', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 'Sent invite to executives.', 6, 17),
  comment('6578e46d-5db4-45ab-899f-463f471e3729', 'bc98f392-ca0b-4842-8f58-2b14d3959f04', 'ce642ef6-6367-406e-82ea-b0236361440f', 'Deck updated for review.', 6, 19),
  comment('66920c38-7208-4444-878a-db1f4dcf9f2b', '5125d378-d1e4-4be3-8f92-df5e7115a160', 'ce642ef6-6367-406e-82ea-b0236361440f', 'Kickoff notes published.', 5, 9),
  comment('0dd67bda-0d1f-40a1-85a2-a1fe8c22ee03', '5125d378-d1e4-4be3-8f92-df5e7115a160', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 'Linked recording for reference.', 5, 11),
  comment('de7b5602-9d09-42f5-8cd8-9c9938229508', '8808dae4-ad94-46b5-89db-46edb52efe13', '288bc717-a551-4a91-8d9d-444d13addb68', 'Finance confirmed coverage.', 5, 10),
  comment('69cc2cb7-2c6d-4f05-84f3-14bfbec37d87', '8808dae4-ad94-46b5-89db-46edb52efe13', '9689b595-abe1-4589-838c-1958aae53a94', 'Updated spreadsheet totals.', 5, 12),
  comment('14e33081-6dbc-4dc7-88f6-bf41c145d8c3', '0b20a227-1243-4403-8df8-db7a1db1770d', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 'Wireframes ready for review.', 7, 9),
  comment('5e118d42-c342-4bd3-8c1e-9044c5d50738', '0b20a227-1243-4403-8df8-db7a1db1770d', 'ce642ef6-6367-406e-82ea-b0236361440f', 'UI feedback added.', 7, 11),
  comment('037b6ba4-edb8-4612-882e-00fe45576aa2', 'd4e075b0-5c97-4b3f-893f-e5cced11c9f8', '9689b595-abe1-4589-838c-1958aae53a94', 'Keyword list complete.', 7, 10),
  comment('59988edf-6646-41f9-8fba-a76aaa1f9487', 'd4e075b0-5c97-4b3f-893f-e5cced11c9f8', '288bc717-a551-4a91-8d9d-444d13addb68', 'Content briefs next.', 7, 12),
  comment('48d3d424-25f5-4ab6-8073-396dab649803', '29a6974d-db06-45ea-8edf-af9aba1ed799', 'ce642ef6-6367-406e-82ea-b0236361440f', 'Hero concept drafted.', 7, 13),
  comment('4870ab00-fa52-4227-8087-8a441ad8a7e7', '29a6974d-db06-45ea-8edf-af9aba1ed799', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 'Product copy added.', 7, 15),
  comment('4666f2c7-6568-4a66-87ce-e3f75365359f', 'be948ffa-eb48-4a0d-850a-c6d2c36d852d', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 'CMS entries published.', 7, 14),
  comment('418ab0e7-014a-4305-87d8-72f71cfaefae', 'be948ffa-eb48-4a0d-850a-c6d2c36d852d', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 'QA will validate content.', 7, 16),
  comment('d18fd8a2-453e-426c-8ae8-224eb2d5513b', 'dba9e06c-588a-478f-8e7f-51e3c1d6eb06', '288bc717-a551-4a91-8d9d-444d13addb68', 'Tablet layout approved.', 7, 17),
  comment('c71be2ba-9cf4-441d-8bc8-3eda3bd24b0f', 'dba9e06c-588a-478f-8e7f-51e3c1d6eb06', '9689b595-abe1-4589-838c-1958aae53a94', 'Mobile tweaks needed.', 7, 18),
  comment('38991ba8-f6a7-4d28-84ca-7236a64523ca', 'd1d6a5bd-c3b2-4faf-87f2-9068ce9f98bb', '6ef2bf51-f656-49ac-843f-5954a6f2a00b', 'Audit checklist in progress.', 7, 19),
  comment('efc10646-0497-45c6-8874-872eb28a8e5d', 'd1d6a5bd-c3b2-4faf-87f2-9068ce9f98bb', 'ce642ef6-6367-406e-82ea-b0236361440f', 'Color contrast updated.', 7, 20),
  comment('41674b74-51b7-4aeb-89cd-a1f2096326b6', '8c2240ed-194f-4a1e-8bab-0a7030ac56ce', 'ce642ef6-6367-406e-82ea-b0236361440f', 'Style guide synced to repo.', 5, 8),
  comment('2d48f368-d550-48a8-85de-739f22726e03', '8c2240ed-194f-4a1e-8bab-0a7030ac56ce', '288bc717-a551-4a91-8d9d-444d13addb68', 'Design tokens verified.', 5, 10),
  comment('06d66a80-910b-45b7-8849-967fece94020', 'f4136567-ba8b-4c4a-8128-212e159aa59f', '9689b595-abe1-4589-838c-1958aae53a94', 'Dashboards refreshed.', 5, 9),
  comment('57ce1ff5-3a51-42de-8ef7-376093a7d95c', 'f4136567-ba8b-4c4a-8128-212e159aa59f', '2cd5fecb-eee6-4cd1-8639-1f634b900a3b', 'KPIs pinned for launch.', 5, 11),
];

const seed = () => {
  db.transaction((tx) => {
    tx.delete(cardTags).run();
    tx.delete(comments).run();
    tx.delete(cards).run();
    tx.delete(lists).run();
    tx.delete(boards).run();
    tx.delete(tags).run();
    tx.delete(users).run();
    tx.insert(users).values(usersData).run();
    tx.insert(boards).values(boardsData).run();
    tx.insert(lists).values(listsData).run();
    tx.insert(tags).values(tagsData).run();
    tx.insert(cards).values(cardsData).run();
    tx.insert(cardTags).values(cardTagsData).run();
    tx.insert(comments).values(commentsData).run();
  });
};

try {
  seed();
  console.log('Database seeded');
  process.exit(0);
} catch (error) {
  console.error(error);
  process.exit(1);
}
