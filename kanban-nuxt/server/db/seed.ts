import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { boards, lists, cards, users, tags, cardTags, comments } from '../../drizzle/schema';
import { randomUUID } from 'crypto';

const sqlite = new Database('./kanban.db');
const db = drizzle(sqlite);

const timestamp = (day: number, hour: number, minute = 0) => new Date(Date.UTC(2024, 0, day, hour, minute));

// Generate UUIDs for users
const userIds = {
  loren: randomUUID(),
  alex: randomUUID(),
  dolly: randomUUID(),
  bobby: randomUUID(),
  sofia: randomUUID(),
};

const usersData = [
  { id: userIds.loren, name: 'Loren' },
  { id: userIds.alex, name: 'Alex' },
  { id: userIds.dolly, name: 'Dolly' },
  { id: userIds.bobby, name: 'Bobby' },
  { id: userIds.sofia, name: 'Sofia' },
];

// Generate UUIDs for boards
const boardIds = {
  product: randomUUID(),
  website: randomUUID(),
};

const boardsData = [
  { id: boardIds.product, title: 'Product Launch', description: 'Launch prep checklist', createdAt: timestamp(1, 9) },
  { id: boardIds.website, title: 'Website Refresh', description: 'Marketing site overhaul', createdAt: timestamp(1, 10) },
];

const listTitles = ['Todo', 'In-Progress', 'QA', 'Done'];

// Generate list IDs
const listIds = {
  product: {
    todo: randomUUID(),
    inProgress: randomUUID(),
    qa: randomUUID(),
    done: randomUUID(),
  },
  website: {
    todo: randomUUID(),
    inProgress: randomUUID(),
    qa: randomUUID(),
    done: randomUUID(),
  },
};

const listsData = [
  { id: listIds.product.todo, boardId: boardIds.product, title: 'Todo', position: 1, createdAt: timestamp(2, 8) },
  { id: listIds.product.inProgress, boardId: boardIds.product, title: 'In-Progress', position: 2, createdAt: timestamp(2, 9) },
  { id: listIds.product.qa, boardId: boardIds.product, title: 'QA', position: 3, createdAt: timestamp(2, 10) },
  { id: listIds.product.done, boardId: boardIds.product, title: 'Done', position: 4, createdAt: timestamp(2, 11) },
  { id: listIds.website.todo, boardId: boardIds.website, title: 'Todo', position: 1, createdAt: timestamp(3, 8) },
  { id: listIds.website.inProgress, boardId: boardIds.website, title: 'In-Progress', position: 2, createdAt: timestamp(3, 9) },
  { id: listIds.website.qa, boardId: boardIds.website, title: 'QA', position: 3, createdAt: timestamp(3, 10) },
  { id: listIds.website.done, boardId: boardIds.website, title: 'Done', position: 4, createdAt: timestamp(3, 11) },
];

// Generate UUIDs for cards
const cardIds = {
  productBrief: randomUUID(),
  marketResearch: randomUUID(),
  demoBuild: randomUUID(),
  salesKit: randomUUID(),
  qcChecklist: randomUUID(),
  signoff: randomUUID(),
  kickoffNotes: randomUUID(),
  budgetApproval: randomUUID(),
  wireframes: randomUUID(),
  keywords: randomUUID(),
  homepageHero: randomUUID(),
  cmsIntegration: randomUUID(),
  responsivePass: randomUUID(),
  accessibilityAudit: randomUUID(),
  styleGuide: randomUUID(),
  analyticsSetup: randomUUID(),
};

const cardsData = [
  { id: cardIds.productBrief, listId: listIds.product.todo, title: 'Draft product brief', description: 'Summarize goals and success metrics.', assigneeId: userIds.loren, position: 1, completed: false, createdAt: timestamp(4, 9) },
  { id: cardIds.marketResearch, listId: listIds.product.todo, title: 'Complete market research', description: 'Compile competitor landscape report.', assigneeId: userIds.dolly, position: 2, completed: false, createdAt: timestamp(4, 10) },
  { id: cardIds.demoBuild, listId: listIds.product.inProgress, title: 'Build demo environment', description: 'Set up walkthrough environment with sample data.', assigneeId: userIds.alex, position: 1, completed: false, createdAt: timestamp(4, 11) },
  { id: cardIds.salesKit, listId: listIds.product.inProgress, title: 'Assemble sales kit', description: 'Draft enablement materials for sales team.', assigneeId: userIds.bobby, position: 2, completed: false, createdAt: timestamp(4, 12) },
  { id: cardIds.qcChecklist, listId: listIds.product.qa, title: 'Validate QA checklist', description: 'Verify release criteria with QA leads.', assigneeId: userIds.sofia, position: 1, completed: false, createdAt: timestamp(4, 13) },
  { id: cardIds.signoff, listId: listIds.product.qa, title: 'Schedule executive sign-off', description: 'Coordinate leadership review session.', assigneeId: userIds.loren, position: 2, completed: false, createdAt: timestamp(4, 14) },
  { id: cardIds.kickoffNotes, listId: listIds.product.done, title: 'Document kickoff notes', description: 'Capture key decisions from project kickoff.', assigneeId: userIds.alex, position: 1, completed: true, createdAt: timestamp(3, 9) },
  { id: cardIds.budgetApproval, listId: listIds.product.done, title: 'Record budget approval', description: 'Log finance approval confirmation.', assigneeId: userIds.dolly, position: 2, completed: true, createdAt: timestamp(3, 10) },
  { id: cardIds.wireframes, listId: listIds.website.todo, title: 'Create homepage wireframes', description: 'Prepare wireframes for hero, features, and pricing.', assigneeId: userIds.sofia, position: 1, completed: false, createdAt: timestamp(5, 9) },
  { id: cardIds.keywords, listId: listIds.website.todo, title: 'Research SEO keywords', description: 'Finalize target keywords for new pages.', assigneeId: userIds.bobby, position: 2, completed: false, createdAt: timestamp(5, 10) },
  { id: cardIds.homepageHero, listId: listIds.website.inProgress, title: 'Design homepage hero', description: 'Produce responsive hero assets.', assigneeId: userIds.alex, position: 1, completed: false, createdAt: timestamp(5, 11) },
  { id: cardIds.cmsIntegration, listId: listIds.website.inProgress, title: 'Integrate CMS content', description: 'Populate CMS entries for refreshed pages.', assigneeId: userIds.loren, position: 2, completed: false, createdAt: timestamp(5, 12) },
  { id: cardIds.responsivePass, listId: listIds.website.qa, title: 'Run responsive QA', description: 'Validate layouts across breakpoints.', assigneeId: userIds.dolly, position: 1, completed: false, createdAt: timestamp(5, 13) },
  { id: cardIds.accessibilityAudit, listId: listIds.website.qa, title: 'Complete accessibility audit', description: 'Review accessibility checklist and fix issues.', assigneeId: userIds.sofia, position: 2, completed: false, createdAt: timestamp(5, 14) },
  { id: cardIds.styleGuide, listId: listIds.website.done, title: 'Update style guide', description: 'Publish revised color and typography tokens.', assigneeId: userIds.alex, position: 1, completed: true, createdAt: timestamp(4, 8) },
  { id: cardIds.analyticsSetup, listId: listIds.website.done, title: 'Confirm analytics setup', description: 'Verify dashboards reflect new pages.', assigneeId: userIds.bobby, position: 2, completed: true, createdAt: timestamp(4, 9) },
];

// Generate UUIDs for tags
const tagIds = {
  design: randomUUID(),
  product: randomUUID(),
  engineering: randomUUID(),
  marketing: randomUUID(),
  qa: randomUUID(),
};

const tagsData = [
  { id: tagIds.design, name: 'Design', color: '#8B5CF6', createdAt: timestamp(1, 12) }, // Purple
  { id: tagIds.product, name: 'Product', color: '#EC4899', createdAt: timestamp(1, 13) }, // Pink
  { id: tagIds.engineering, name: 'Engineering', color: '#3B82F6', createdAt: timestamp(1, 14) }, // Blue
  { id: tagIds.marketing, name: 'Marketing', color: '#10B981', createdAt: timestamp(1, 15) }, // Green
  { id: tagIds.qa, name: 'QA', color: '#F59E0B', createdAt: timestamp(1, 16) }, // Amber
];

const cardTagsData = [
  { cardId: cardIds.productBrief, tagId: tagIds.product },
  { cardId: cardIds.productBrief, tagId: tagIds.marketing },
  { cardId: cardIds.marketResearch, tagId: tagIds.marketing },
  { cardId: cardIds.demoBuild, tagId: tagIds.engineering },
  { cardId: cardIds.salesKit, tagId: tagIds.product },
  { cardId: cardIds.salesKit, tagId: tagIds.marketing },
  { cardId: cardIds.qcChecklist, tagId: tagIds.qa },
  { cardId: cardIds.signoff, tagId: tagIds.product },
  { cardId: cardIds.kickoffNotes, tagId: tagIds.product },
  { cardId: cardIds.budgetApproval, tagId: tagIds.product },
  { cardId: cardIds.wireframes, tagId: tagIds.design },
  { cardId: cardIds.keywords, tagId: tagIds.marketing },
  { cardId: cardIds.homepageHero, tagId: tagIds.design },
  { cardId: cardIds.homepageHero, tagId: tagIds.product },
  { cardId: cardIds.cmsIntegration, tagId: tagIds.engineering },
  { cardId: cardIds.responsivePass, tagId: tagIds.qa },
  { cardId: cardIds.accessibilityAudit, tagId: tagIds.qa },
  { cardId: cardIds.styleGuide, tagId: tagIds.design },
  { cardId: cardIds.analyticsSetup, tagId: tagIds.engineering },
  { cardId: cardIds.analyticsSetup, tagId: tagIds.marketing },
];

// Generate UUIDs for comments
const commentIds = {
  comment001: randomUUID(),
  comment002: randomUUID(),
  comment003: randomUUID(),
  comment004: randomUUID(),
  comment005: randomUUID(),
  comment006: randomUUID(),
  comment007: randomUUID(),
  comment008: randomUUID(),
  comment009: randomUUID(),
  comment010: randomUUID(),
  comment011: randomUUID(),
  comment012: randomUUID(),
  comment013: randomUUID(),
  comment014: randomUUID(),
  comment015: randomUUID(),
  comment016: randomUUID(),
  comment017: randomUUID(),
  comment018: randomUUID(),
  comment019: randomUUID(),
  comment020: randomUUID(),
  comment021: randomUUID(),
  comment022: randomUUID(),
  comment023: randomUUID(),
  comment024: randomUUID(),
  comment025: randomUUID(),
  comment026: randomUUID(),
  comment027: randomUUID(),
  comment028: randomUUID(),
  comment029: randomUUID(),
  comment030: randomUUID(),
  comment031: randomUUID(),
  comment032: randomUUID(),
};

const comment = (id: string, cardId: string, userId: string, text: string, day: number, hour: number, minute = 0) => ({
  id,
  cardId,
  userId,
  text,
  createdAt: timestamp(day, hour, minute),
});

const commentsData = [
  comment(commentIds.comment001, cardIds.productBrief, userIds.loren, 'Initial outline drafted.', 6, 9),
  comment(commentIds.comment002, cardIds.productBrief, userIds.alex, 'Review scheduled for tomorrow.', 6, 11),
  comment(commentIds.comment003, cardIds.marketResearch, userIds.dolly, 'Collected competitor pricing.', 6, 12),
  comment(commentIds.comment004, cardIds.marketResearch, userIds.bobby, 'Will add win-loss insights.', 6, 14),
  comment(commentIds.comment005, cardIds.demoBuild, userIds.alex, 'Demo environment bootstrapped.', 6, 10),
  comment(commentIds.comment006, cardIds.demoBuild, userIds.sofia, 'QA will test walkthrough.', 6, 12),
  comment(commentIds.comment007, cardIds.salesKit, userIds.bobby, 'Draft slides uploaded.', 6, 13),
  comment(commentIds.comment008, cardIds.salesKit, userIds.loren, 'Adding launch messaging.', 6, 15),
  comment(commentIds.comment009, cardIds.qcChecklist, userIds.sofia, 'Checklist shared with leads.', 6, 16),
  comment(commentIds.comment010, cardIds.qcChecklist, userIds.dolly, 'Noted analytics validation.', 6, 18),
  comment(commentIds.comment011, cardIds.signoff, userIds.loren, 'Sent invite to executives.', 6, 17),
  comment(commentIds.comment012, cardIds.signoff, userIds.alex, 'Deck updated for review.', 6, 19),
  comment(commentIds.comment013, cardIds.kickoffNotes, userIds.alex, 'Kickoff notes published.', 5, 9),
  comment(commentIds.comment014, cardIds.kickoffNotes, userIds.sofia, 'Linked recording for reference.', 5, 11),
  comment(commentIds.comment015, cardIds.budgetApproval, userIds.dolly, 'Finance confirmed coverage.', 5, 10),
  comment(commentIds.comment016, cardIds.budgetApproval, userIds.bobby, 'Updated spreadsheet totals.', 5, 12),
  comment(commentIds.comment017, cardIds.wireframes, userIds.sofia, 'Wireframes ready for review.', 7, 9),
  comment(commentIds.comment018, cardIds.wireframes, userIds.alex, 'UI feedback added.', 7, 11),
  comment(commentIds.comment019, cardIds.keywords, userIds.bobby, 'Keyword list complete.', 7, 10),
  comment(commentIds.comment020, cardIds.keywords, userIds.dolly, 'Content briefs next.', 7, 12),
  comment(commentIds.comment021, cardIds.homepageHero, userIds.alex, 'Hero concept drafted.', 7, 13),
  comment(commentIds.comment022, cardIds.homepageHero, userIds.loren, 'Product copy added.', 7, 15),
  comment(commentIds.comment023, cardIds.cmsIntegration, userIds.loren, 'CMS entries published.', 7, 14),
  comment(commentIds.comment024, cardIds.cmsIntegration, userIds.sofia, 'QA will validate content.', 7, 16),
  comment(commentIds.comment025, cardIds.responsivePass, userIds.dolly, 'Tablet layout approved.', 7, 17),
  comment(commentIds.comment026, cardIds.responsivePass, userIds.bobby, 'Mobile tweaks needed.', 7, 18),
  comment(commentIds.comment027, cardIds.accessibilityAudit, userIds.sofia, 'Audit checklist in progress.', 7, 19),
  comment(commentIds.comment028, cardIds.accessibilityAudit, userIds.alex, 'Color contrast updated.', 7, 20),
  comment(commentIds.comment029, cardIds.styleGuide, userIds.alex, 'Style guide synced to repo.', 5, 8),
  comment(commentIds.comment030, cardIds.styleGuide, userIds.dolly, 'Design tokens verified.', 5, 10),
  comment(commentIds.comment031, cardIds.analyticsSetup, userIds.bobby, 'Dashboards refreshed.', 5, 9),
  comment(commentIds.comment032, cardIds.analyticsSetup, userIds.loren, 'KPIs pinned for launch.', 5, 11),
];

async function seed() {
  console.log('Seeding database...');

  // Clear existing data in correct order (respecting foreign keys)
  db.delete(cardTags).run();
  db.delete(comments).run();
  db.delete(cards).run();
  db.delete(lists).run();
  db.delete(boards).run();
  db.delete(tags).run();
  db.delete(users).run();

  // Insert new data
  db.insert(users).values(usersData).run();
  db.insert(boards).values(boardsData).run();
  db.insert(lists).values(listsData).run();
  db.insert(tags).values(tagsData).run();
  db.insert(cards).values(cardsData).run();
  db.insert(cardTags).values(cardTagsData).run();
  db.insert(comments).values(commentsData).run();

  console.log('Database seeded successfully!');
}

seed().catch(console.error);
