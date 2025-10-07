import { db } from '../lib/db';
import { users, boards, lists, cards, tags, cardTags, comments } from '../../drizzle/schema';

const timestamp = (day: number, hour: number, minute = 0) => new Date(Date.UTC(2024, 0, day, hour, minute));

const usersData = [
  { id: 'user-loren', name: 'Loren' },
  { id: 'user-alex', name: 'Alex' },
  { id: 'user-dolly', name: 'Dolly' },
  { id: 'user-bobby', name: 'Bobby' },
  { id: 'user-sofia', name: 'Sofia' },
];

const boardsData = [
  { id: 'board-product', title: 'Product Launch', description: 'Launch prep checklist', createdAt: timestamp(1, 9) },
  { id: 'board-website', title: 'Website Refresh', description: 'Marketing site overhaul', createdAt: timestamp(1, 10) },
];

const listTitles = ['Todo', 'In-Progress', 'QA', 'Done'];

const listsData = boardsData.flatMap((board, boardIndex) =>
  listTitles.map((title, titleIndex) => ({
    id: `list-${boardIndex + 1}-${titleIndex + 1}`,
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
  { id: 'card-product-brief', listId: ensureListId('board-product', 'Todo'), title: 'Draft product brief', description: 'Summarize goals and success metrics.', assigneeId: 'user-loren', position: 1, completed: false, createdAt: timestamp(4, 9) },
  { id: 'card-market-research', listId: ensureListId('board-product', 'Todo'), title: 'Complete market research', description: 'Compile competitor landscape report.', assigneeId: 'user-dolly', position: 2, completed: false, createdAt: timestamp(4, 10) },
  { id: 'card-demo-build', listId: ensureListId('board-product', 'In-Progress'), title: 'Build demo environment', description: 'Set up walkthrough environment with sample data.', assigneeId: 'user-alex', position: 1, completed: false, createdAt: timestamp(4, 11) },
  { id: 'card-sales-kit', listId: ensureListId('board-product', 'In-Progress'), title: 'Assemble sales kit', description: 'Draft enablement materials for sales team.', assigneeId: 'user-bobby', position: 2, completed: false, createdAt: timestamp(4, 12) },
  { id: 'card-qc-checklist', listId: ensureListId('board-product', 'QA'), title: 'Validate QA checklist', description: 'Verify release criteria with QA leads.', assigneeId: 'user-sofia', position: 1, completed: false, createdAt: timestamp(4, 13) },
  { id: 'card-signoff', listId: ensureListId('board-product', 'QA'), title: 'Schedule executive sign-off', description: 'Coordinate leadership review session.', assigneeId: 'user-loren', position: 2, completed: false, createdAt: timestamp(4, 14) },
  { id: 'card-kickoff-notes', listId: ensureListId('board-product', 'Done'), title: 'Document kickoff notes', description: 'Capture key decisions from project kickoff.', assigneeId: 'user-alex', position: 1, completed: true, createdAt: timestamp(3, 9) },
  { id: 'card-budget-approval', listId: ensureListId('board-product', 'Done'), title: 'Record budget approval', description: 'Log finance approval confirmation.', assigneeId: 'user-dolly', position: 2, completed: true, createdAt: timestamp(3, 10) },
  { id: 'card-wireframes', listId: ensureListId('board-website', 'Todo'), title: 'Create homepage wireframes', description: 'Prepare wireframes for hero, features, and pricing.', assigneeId: 'user-sofia', position: 1, completed: false, createdAt: timestamp(5, 9) },
  { id: 'card-keywords', listId: ensureListId('board-website', 'Todo'), title: 'Research SEO keywords', description: 'Finalize target keywords for new pages.', assigneeId: 'user-bobby', position: 2, completed: false, createdAt: timestamp(5, 10) },
  { id: 'card-homepage-hero', listId: ensureListId('board-website', 'In-Progress'), title: 'Design homepage hero', description: 'Produce responsive hero assets.', assigneeId: 'user-alex', position: 1, completed: false, createdAt: timestamp(5, 11) },
  { id: 'card-cms-integration', listId: ensureListId('board-website', 'In-Progress'), title: 'Integrate CMS content', description: 'Populate CMS entries for refreshed pages.', assigneeId: 'user-loren', position: 2, completed: false, createdAt: timestamp(5, 12) },
  { id: 'card-responsive-pass', listId: ensureListId('board-website', 'QA'), title: 'Run responsive QA', description: 'Validate layouts across breakpoints.', assigneeId: 'user-dolly', position: 1, completed: false, createdAt: timestamp(5, 13) },
  { id: 'card-accessibility-audit', listId: ensureListId('board-website', 'QA'), title: 'Complete accessibility audit', description: 'Review accessibility checklist and fix issues.', assigneeId: 'user-sofia', position: 2, completed: false, createdAt: timestamp(5, 14) },
  { id: 'card-style-guide', listId: ensureListId('board-website', 'Done'), title: 'Update style guide', description: 'Publish revised color and typography tokens.', assigneeId: 'user-alex', position: 1, completed: true, createdAt: timestamp(4, 8) },
  { id: 'card-analytics-setup', listId: ensureListId('board-website', 'Done'), title: 'Confirm analytics setup', description: 'Verify dashboards reflect new pages.', assigneeId: 'user-bobby', position: 2, completed: true, createdAt: timestamp(4, 9) },
];

const tagsData = [
  { id: 'tag-design', name: 'Design', color: '#8B5CF6', createdAt: timestamp(1, 12) }, // Purple
  { id: 'tag-product', name: 'Product', color: '#EC4899', createdAt: timestamp(1, 13) }, // Pink
  { id: 'tag-engineering', name: 'Engineering', color: '#3B82F6', createdAt: timestamp(1, 14) }, // Blue
  { id: 'tag-marketing', name: 'Marketing', color: '#10B981', createdAt: timestamp(1, 15) }, // Green
  { id: 'tag-qa', name: 'QA', color: '#F59E0B', createdAt: timestamp(1, 16) }, // Amber
];

const cardTagsData = [
  { cardId: 'card-product-brief', tagId: 'tag-product' },
  { cardId: 'card-product-brief', tagId: 'tag-marketing' },
  { cardId: 'card-market-research', tagId: 'tag-marketing' },
  { cardId: 'card-demo-build', tagId: 'tag-engineering' },
  { cardId: 'card-sales-kit', tagId: 'tag-product' },
  { cardId: 'card-sales-kit', tagId: 'tag-marketing' },
  { cardId: 'card-qc-checklist', tagId: 'tag-qa' },
  { cardId: 'card-signoff', tagId: 'tag-product' },
  { cardId: 'card-kickoff-notes', tagId: 'tag-product' },
  { cardId: 'card-budget-approval', tagId: 'tag-product' },
  { cardId: 'card-wireframes', tagId: 'tag-design' },
  { cardId: 'card-keywords', tagId: 'tag-marketing' },
  { cardId: 'card-homepage-hero', tagId: 'tag-design' },
  { cardId: 'card-homepage-hero', tagId: 'tag-product' },
  { cardId: 'card-cms-integration', tagId: 'tag-engineering' },
  { cardId: 'card-responsive-pass', tagId: 'tag-qa' },
  { cardId: 'card-accessibility-audit', tagId: 'tag-qa' },
  { cardId: 'card-style-guide', tagId: 'tag-design' },
  { cardId: 'card-analytics-setup', tagId: 'tag-engineering' },
  { cardId: 'card-analytics-setup', tagId: 'tag-marketing' },
];

const comment = (id: string, cardId: string, userId: string, text: string, day: number, hour: number, minute = 0) => ({
  id,
  cardId,
  userId,
  text,
  createdAt: timestamp(day, hour, minute),
});

const commentsData = [
  comment('comment-001', 'card-product-brief', 'user-loren', 'Initial outline drafted.', 6, 9),
  comment('comment-002', 'card-product-brief', 'user-alex', 'Review scheduled for tomorrow.', 6, 11),
  comment('comment-003', 'card-market-research', 'user-dolly', 'Collected competitor pricing.', 6, 12),
  comment('comment-004', 'card-market-research', 'user-bobby', 'Will add win-loss insights.', 6, 14),
  comment('comment-005', 'card-demo-build', 'user-alex', 'Demo environment bootstrapped.', 6, 10),
  comment('comment-006', 'card-demo-build', 'user-sofia', 'QA will test walkthrough.', 6, 12),
  comment('comment-007', 'card-sales-kit', 'user-bobby', 'Draft slides uploaded.', 6, 13),
  comment('comment-008', 'card-sales-kit', 'user-loren', 'Adding launch messaging.', 6, 15),
  comment('comment-009', 'card-qc-checklist', 'user-sofia', 'Checklist shared with leads.', 6, 16),
  comment('comment-010', 'card-qc-checklist', 'user-dolly', 'Noted analytics validation.', 6, 18),
  comment('comment-011', 'card-signoff', 'user-loren', 'Sent invite to executives.', 6, 17),
  comment('comment-012', 'card-signoff', 'user-alex', 'Deck updated for review.', 6, 19),
  comment('comment-013', 'card-kickoff-notes', 'user-alex', 'Kickoff notes published.', 5, 9),
  comment('comment-014', 'card-kickoff-notes', 'user-sofia', 'Linked recording for reference.', 5, 11),
  comment('comment-015', 'card-budget-approval', 'user-dolly', 'Finance confirmed coverage.', 5, 10),
  comment('comment-016', 'card-budget-approval', 'user-bobby', 'Updated spreadsheet totals.', 5, 12),
  comment('comment-017', 'card-wireframes', 'user-sofia', 'Wireframes ready for review.', 7, 9),
  comment('comment-018', 'card-wireframes', 'user-alex', 'UI feedback added.', 7, 11),
  comment('comment-019', 'card-keywords', 'user-bobby', 'Keyword list complete.', 7, 10),
  comment('comment-020', 'card-keywords', 'user-dolly', 'Content briefs next.', 7, 12),
  comment('comment-021', 'card-homepage-hero', 'user-alex', 'Hero concept drafted.', 7, 13),
  comment('comment-022', 'card-homepage-hero', 'user-loren', 'Product copy added.', 7, 15),
  comment('comment-023', 'card-cms-integration', 'user-loren', 'CMS entries published.', 7, 14),
  comment('comment-024', 'card-cms-integration', 'user-sofia', 'QA will validate content.', 7, 16),
  comment('comment-025', 'card-responsive-pass', 'user-dolly', 'Tablet layout approved.', 7, 17),
  comment('comment-026', 'card-responsive-pass', 'user-bobby', 'Mobile tweaks needed.', 7, 18),
  comment('comment-027', 'card-accessibility-audit', 'user-sofia', 'Audit checklist in progress.', 7, 19),
  comment('comment-028', 'card-accessibility-audit', 'user-alex', 'Color contrast updated.', 7, 20),
  comment('comment-029', 'card-style-guide', 'user-alex', 'Style guide synced to repo.', 5, 8),
  comment('comment-030', 'card-style-guide', 'user-dolly', 'Design tokens verified.', 5, 10),
  comment('comment-031', 'card-analytics-setup', 'user-bobby', 'Dashboards refreshed.', 5, 9),
  comment('comment-032', 'card-analytics-setup', 'user-loren', 'KPIs pinned for launch.', 5, 11),
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
