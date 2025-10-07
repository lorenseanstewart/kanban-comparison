import { db } from '../lib/db';
import { users, boards, lists, cards, tags, cardTags, comments } from '../lib/db/schema';

const timestamp = (day: number, hour: number, minute = 0) =>
	new Date(Date.UTC(2024, 0, day, hour, minute));

const usersData = [
	{ id: 'user-loren', name: 'Loren' },
	{ id: 'user-alex', name: 'Alex' },
	{ id: 'user-dolly', name: 'Dolly' },
	{ id: 'user-bobby', name: 'Bobby' },
	{ id: 'user-sofia', name: 'Sofia' }
];

const boardsData = [
	{
		id: 'board-product',
		title: 'Product Launch',
		description: 'Launch prep checklist',
		createdAt: timestamp(1, 9)
	},
	{
		id: 'board-website',
		title: 'Website Refresh',
		description: 'Marketing site overhaul',
		createdAt: timestamp(1, 10)
	}
];

const listTitles = ['Todo', 'In-Progress', 'QA', 'Done'];

const listsData = boardsData.flatMap((board, boardIndex) =>
	listTitles.map((title, titleIndex) => ({
		id: `list-${boardIndex + 1}-${titleIndex + 1}`,
		boardId: board.id,
		title,
		position: titleIndex + 1,
		createdAt: timestamp(2 + boardIndex, 8 + titleIndex)
	}))
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
	{
		id: 'card-product-brief',
		listId: ensureListId('board-product', 'Todo'),
		title: 'Draft product brief',
		description: 'Summarize goals and success metrics.',
		assigneeId: 'user-loren',
		position: 1,
		completed: false,
		createdAt: timestamp(4, 9)
	},
	{
		id: 'card-market-research',
		listId: ensureListId('board-product', 'Todo'),
		title: 'Complete market research',
		description: 'Compile competitor landscape report.',
		assigneeId: 'user-dolly',
		position: 2,
		completed: false,
		createdAt: timestamp(4, 10)
	},
	{
		id: 'card-demo-build',
		listId: ensureListId('board-product', 'In-Progress'),
		title: 'Build demo environment',
		description: 'Set up walkthrough environment with sample data.',
		assigneeId: 'user-alex',
		position: 1,
		completed: false,
		createdAt: timestamp(4, 11)
	},
	{
		id: 'card-sales-kit',
		listId: ensureListId('board-product', 'In-Progress'),
		title: 'Assemble sales kit',
		description: 'Draft enablement materials for sales team.',
		assigneeId: 'user-bobby',
		position: 2,
		completed: false,
		createdAt: timestamp(4, 12)
	},
	{
		id: 'card-qc-checklist',
		listId: ensureListId('board-product', 'QA'),
		title: 'Validate QA checklist',
		description: 'Verify release criteria with QA leads.',
		assigneeId: 'user-sofia',
		position: 1,
		completed: false,
		createdAt: timestamp(4, 13)
	},
	{
		id: 'card-signoff',
		listId: ensureListId('board-product', 'QA'),
		title: 'Schedule executive sign-off',
		description: 'Coordinate leadership review session.',
		assigneeId: 'user-loren',
		position: 2,
		completed: false,
		createdAt: timestamp(4, 14)
	},
	{
		id: 'card-kickoff-notes',
		listId: ensureListId('board-product', 'Done'),
		title: 'Document kickoff notes',
		description: 'Capture key decisions from project kickoff.',
		assigneeId: 'user-alex',
		position: 1,
		completed: true,
		createdAt: timestamp(3, 9)
	},
	{
		id: 'card-budget-approval',
		listId: ensureListId('board-product', 'Done'),
		title: 'Record budget approval',
		description: 'Log finance approval confirmation.',
		assigneeId: 'user-dolly',
		position: 2,
		completed: true,
		createdAt: timestamp(3, 10)
	},
	{
		id: 'card-wireframes',
		listId: ensureListId('board-website', 'Todo'),
		title: 'Create homepage wireframes',
		description: 'Prepare wireframes for hero, features, and pricing.',
		assigneeId: 'user-sofia',
		position: 1,
		completed: false,
		createdAt: timestamp(5, 9)
	},
	{
		id: 'card-keywords',
		listId: ensureListId('board-website', 'Todo'),
		title: 'Research SEO keywords',
		description: 'Finalize target keywords for new pages.',
		assigneeId: 'user-bobby',
		position: 2,
		completed: false,
		createdAt: timestamp(5, 10)
	},
	{
		id: 'card-homepage-hero',
		listId: ensureListId('board-website', 'In-Progress'),
		title: 'Design homepage hero',
		description: 'Produce responsive hero assets.',
		assigneeId: 'user-alex',
		position: 1,
		completed: false,
		createdAt: timestamp(5, 11)
	},
	{
		id: 'card-cms-integration',
		listId: ensureListId('board-website', 'In-Progress'),
		title: 'Integrate CMS content',
		description: 'Populate CMS entries for refreshed pages.',
		assigneeId: 'user-loren',
		position: 2,
		completed: false,
		createdAt: timestamp(5, 12)
	},
	{
		id: 'card-responsive-pass',
		listId: ensureListId('board-website', 'QA'),
		title: 'Run responsive QA',
		description: 'Validate layouts across breakpoints.',
		assigneeId: 'user-dolly',
		position: 1,
		completed: false,
		createdAt: timestamp(5, 13)
	},
	{
		id: 'card-accessibility-audit',
		listId: ensureListId('board-website', 'QA'),
		title: 'Complete accessibility audit',
		description: 'Review accessibility checklist and fix issues.',
		assigneeId: 'user-sofia',
		position: 2,
		completed: false,
		createdAt: timestamp(5, 14)
	},
	{
		id: 'card-style-guide',
		listId: ensureListId('board-website', 'Done'),
		title: 'Update style guide',
		description: 'Publish revised color and typography tokens.',
		assigneeId: 'user-alex',
		position: 1,
		completed: true,
		createdAt: timestamp(4, 8)
	},
	{
		id: 'card-analytics-setup',
		listId: ensureListId('board-website', 'Done'),
		title: 'Confirm analytics setup',
		description: 'Verify dashboards reflect new pages.',
		assigneeId: 'user-bobby',
		position: 2,
		completed: true,
		createdAt: timestamp(4, 9)
	}
];

const tagsData = [
	{ id: 'tag-design', name: 'Design', color: '#8B5CF6', createdAt: timestamp(1, 12) }, // Purple
	{ id: 'tag-product', name: 'Product', color: '#EC4899', createdAt: timestamp(1, 13) }, // Pink
	{ id: 'tag-engineering', name: 'Engineering', color: '#3B82F6', createdAt: timestamp(1, 14) }, // Blue
	{ id: 'tag-marketing', name: 'Marketing', color: '#10B981', createdAt: timestamp(1, 15) }, // Green
	{ id: 'tag-qa', name: 'QA', color: '#F59E0B', createdAt: timestamp(1, 16) } // Amber
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
	{ cardId: 'card-analytics-setup', tagId: 'tag-marketing' }
];

const comment = (
	id: string,
	cardId: string,
	userId: string,
	text: string,
	day: number,
	hour: number,
	minute = 0
) => ({
	id,
	cardId,
	userId,
	text,
	createdAt: timestamp(day, hour, minute)
});

const commentsData = [
	comment('comment-1', 'card-product-brief', 'user-alex', 'Can we align this with Q1 roadmap?', 4, 10, 30),
	comment('comment-2', 'card-product-brief', 'user-loren', 'Yes, I'll sync with PM team.', 4, 11, 15),
	comment('comment-3', 'card-market-research', 'user-bobby', 'Any competitor pricing data yet?', 4, 11, 0),
	comment('comment-4', 'card-market-research', 'user-dolly', 'Will include in report by EOW.', 4, 12, 30),
	comment('comment-5', 'card-demo-build', 'user-loren', 'Let me know when it's ready to review.', 4, 12, 0),
	comment('comment-6', 'card-demo-build', 'user-alex', 'Should be done by Thursday.', 4, 13, 45),
	comment('comment-7', 'card-sales-kit', 'user-sofia', 'Need help with product messaging?', 4, 13, 0),
	comment('comment-8', 'card-sales-kit', 'user-bobby', 'Yes, I'll set up a sync.', 4, 14, 15),
	comment('comment-9', 'card-qc-checklist', 'user-alex', 'Does this cover localization testing?', 4, 14, 0),
	comment('comment-10', 'card-qc-checklist', 'user-sofia', 'Not yet, adding that now.', 4, 15, 30),
	comment('comment-11', 'card-signoff', 'user-dolly', 'When is executive team available?', 4, 15, 0),
	comment('comment-12', 'card-signoff', 'user-loren', 'Checking calendars, will send invite.', 4, 16, 0),
	comment('comment-13', 'card-kickoff-notes', 'user-bobby', 'Great notes, thanks!', 3, 10, 0),
	comment('comment-14', 'card-kickoff-notes', 'user-alex', 'Happy to help!', 3, 11, 0),
	comment('comment-15', 'card-budget-approval', 'user-sofia', 'Budget confirmed with finance.', 3, 11, 0),
	comment('comment-16', 'card-budget-approval', 'user-dolly', 'Perfect, we're good to proceed.', 3, 12, 0),
	comment('comment-17', 'card-wireframes', 'user-loren', 'Looking forward to the drafts.', 5, 10, 0),
	comment('comment-18', 'card-wireframes', 'user-sofia', 'Should have first pass tomorrow.', 5, 11, 30),
	comment('comment-19', 'card-keywords', 'user-alex', 'Let's prioritize long-tail keywords.', 5, 11, 0),
	comment('comment-20', 'card-keywords', 'user-bobby', 'Agreed, compiling list now.', 5, 12, 15),
	comment('comment-21', 'card-homepage-hero', 'user-dolly', 'Can we test an A/B on the hero copy?', 5, 12, 0),
	comment('comment-22', 'card-homepage-hero', 'user-alex', 'Good idea, I'll coordinate with marketing.', 5, 13, 0),
	comment('comment-23', 'card-cms-integration', 'user-bobby', 'CMS credentials ready?', 5, 13, 0),
	comment('comment-24', 'card-cms-integration', 'user-loren', 'Yes, shared them via 1Password.', 5, 14, 30),
	comment('comment-25', 'card-responsive-pass', 'user-sofia', 'Focus on tablet breakpoint especially.', 5, 14, 0),
	comment('comment-26', 'card-responsive-pass', 'user-dolly', 'Will do, starting with iPad sizes.', 5, 15, 0),
	comment('comment-27', 'card-accessibility-audit', 'user-alex', 'Need WCAG 2.1 AA compliance.', 5, 15, 0),
	comment('comment-28', 'card-accessibility-audit', 'user-sofia', 'Yep, using Axe for audit.', 5, 16, 0),
	comment('comment-29', 'card-style-guide', 'user-bobby', 'New tokens look great!', 4, 9, 0),
	comment('comment-30', 'card-style-guide', 'user-alex', 'Thanks! Easier to maintain now.', 4, 10, 0),
	comment('comment-31', 'card-analytics-setup', 'user-loren', 'Are conversion funnels configured?', 4, 10, 0),
	comment('comment-32', 'card-analytics-setup', 'user-bobby', 'Yes, all set up and tested.', 4, 11, 0)
];

async function seed() {
	console.log('Seeding database...');

	// Clear existing data
	await db.delete(comments);
	await db.delete(cardTags);
	await db.delete(cards);
	await db.delete(lists);
	await db.delete(boards);
	await db.delete(tags);
	await db.delete(users);

	// Insert new data
	await db.insert(users).values(usersData);
	await db.insert(boards).values(boardsData);
	await db.insert(lists).values(listsData);
	await db.insert(tags).values(tagsData);
	await db.insert(cards).values(cardsData);
	await db.insert(cardTags).values(cardTagsData);
	await db.insert(comments).values(commentsData);

	console.log('Database seeded successfully!');
	process.exit(0);
}

seed().catch((error) => {
	console.error('Error seeding database:', error);
	process.exit(1);
});
