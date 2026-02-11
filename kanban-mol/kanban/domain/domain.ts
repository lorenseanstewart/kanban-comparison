namespace $ {
	export class $kanban_domain_user extends $mol_object {
		id() {
			return ''
		}
		name() {
			return ''
		}
		avatar() {
			return ''
		}
	}

	export class $kanban_domain_tag extends $mol_object {
		id() {
			return ''
		}
		name() {
			return ''
		}
		color() {
			return ''
		}
	}

	export class $kanban_domain_comment extends $mol_object {
		id() {
			return ''
		}
		author() {
			return null as null | $kanban_domain_user
		}
		text() {
			return ''
		}
		created() {
			return new $mol_time_moment()
		}
	}

	export class $kanban_domain_card extends $mol_object {
		id() {
			return ''
		}
		title(next?: string) {
			return next ?? ''
		}
		description(next?: string) {
			return next ?? ''
		}
		assignee(next?: $kanban_domain_user | null) {
			return next ?? null
		}
		completed(next?: boolean) {
			return next ?? false
		}
		position(next?: number) {
			return next ?? 0
		}

		tags(next?: $kanban_domain_tag[]) {
			return next ?? ([] as $kanban_domain_tag[])
		}
		comments(next?: $kanban_domain_comment[]) {
			return next ?? ([] as $kanban_domain_comment[])
		}

		list_id(next?: string) {
			return next ?? ''
		}
	}

	export class $kanban_domain_list extends $mol_object {
		id() {
			return ''
		}
		title() {
			return ''
		}
		board_id() {
			return ''
		}
		position() {
			return 0
		}
		cards(next?: $kanban_domain_card[]) {
			return next ?? ([] as $kanban_domain_card[])
		}
	}

	export class $kanban_domain_board extends $mol_object {
		id() {
			return ''
		}
		title() {
			return ''
		}
		description() {
			return ''
		}
		lists() {
			return [] as $kanban_domain_list[]
		}
	}

	export class $kanban_domain_mock extends $mol_object {
		@$mol_mem
		users() {
			const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve']
			return names.map((name, i) =>
				$kanban_domain_user.make({
					id: $mol_const(`user-${i + 1}`),
					name: $mol_const(name),
					avatar: $mol_const(name[0]),
				}),
			)
		}

		@$mol_mem
		tags() {
			const data = [
				{ name: 'Bug', color: '#ef4444' },
				{ name: 'Feature', color: '#3b82f6' },
				{ name: 'Urgent', color: '#f97316' },
				{ name: 'Design', color: '#a855f7' },
				{ name: 'Backend', color: '#22c55e' },
				{ name: 'Frontend', color: '#06b6d4' },
			]
			return data.map((d, i) =>
				$kanban_domain_tag.make({
					id: $mol_const(`tag-${i + 1}`),
					name: $mol_const(d.name),
					color: $mol_const(d.color),
				}),
			)
		}

		@$mol_mem
		boards() {
			return [this.board('board-1')]
		}

		@$mol_mem_key
		board(id: string) {
			return $kanban_domain_board.make({
				id: $mol_const(id),
				title: $mol_const('Project Alpha'),
				description: $mol_const('Main development board'),
				lists: () => this.lists(id),
			})
		}

		@$mol_mem_key
		lists(board_id: string) {
			const titles = ['Backlog', 'Todo', 'In Progress', 'Done']
			return titles.map((title, i) => {
				const list_id = `list-${i + 1}`
				return $kanban_domain_list.make({
					id: $mol_const(list_id),
					title: $mol_const(title),
					board_id: $mol_const(board_id),
					position: $mol_const(i),
					cards: (next?: $kanban_domain_card[]) => this.list_cards(list_id, next),
				})
			})
		}

		@$mol_mem_key
		list_cards(list_id: string, next?: $kanban_domain_card[]): $kanban_domain_card[] {
			if (next) return next
			return this._initial_cards()
				.filter(c => c.list_id() === list_id)
				.sort((a, b) => a.position() - b.position())
		}

		@$mol_mem
		_initial_cards() {
			const cards_data = [
				{
					id: 'card-1',
					list: 'list-1',
					title: 'Research competitors',
					desc: 'Analyze top 5 competitors and create a comparison report',
					assignee: 0,
					tags: [1, 3],
					pos: 0,
				},
				{
					id: 'card-2',
					list: 'list-1',
					title: 'Write technical spec',
					desc: 'Document API endpoints and data models',
					assignee: 1,
					tags: [1],
					pos: 1,
				},
				{
					id: 'card-3',
					list: 'list-1',
					title: 'Design system audit',
					desc: 'Review existing components for consistency',
					assignee: 3,
					tags: [3],
					pos: 2,
				},
				{
					id: 'card-4',
					list: 'list-1',
					title: 'Setup CI/CD pipeline',
					desc: 'Configure GitHub Actions for automated testing',
					assignee: 2,
					tags: [4],
					pos: 3,
				},
				{
					id: 'card-5',
					list: 'list-1',
					title: 'Database migration plan',
					desc: 'Plan migration from MySQL to PostgreSQL',
					assignee: 4,
					tags: [4],
					pos: 4,
				},
				{
					id: 'card-6',
					list: 'list-2',
					title: 'Implement auth flow',
					desc: 'OAuth2 + JWT token management',
					assignee: 1,
					tags: [1, 4],
					pos: 0,
				},
				{
					id: 'card-7',
					list: 'list-2',
					title: 'Create landing page',
					desc: 'Hero section, features, pricing',
					assignee: 3,
					tags: [3, 5],
					pos: 1,
				},
				{
					id: 'card-8',
					list: 'list-2',
					title: 'Fix memory leak',
					desc: 'Event listeners not cleaned up in dashboard',
					assignee: 2,
					tags: [0, 2],
					pos: 2,
				},
				{
					id: 'card-9',
					list: 'list-2',
					title: 'Add dark mode',
					desc: 'CSS custom properties based theming',
					assignee: 3,
					tags: [3, 5],
					pos: 3,
				},
				{
					id: 'card-10',
					list: 'list-3',
					title: 'User profile page',
					desc: 'Avatar upload, settings, preferences',
					assignee: 0,
					tags: [1, 5],
					pos: 0,
				},
				{
					id: 'card-11',
					list: 'list-3',
					title: 'API rate limiting',
					desc: 'Implement token bucket algorithm',
					assignee: 1,
					tags: [4],
					pos: 1,
				},
				{
					id: 'card-12',
					list: 'list-3',
					title: 'Search functionality',
					desc: 'Full-text search with Elasticsearch',
					assignee: 4,
					tags: [1, 4],
					pos: 2,
				},
				{
					id: 'card-13',
					list: 'list-4',
					title: 'Setup monitoring',
					desc: 'Grafana dashboards and alerting',
					assignee: 2,
					tags: [4],
					pos: 0,
				},
				{
					id: 'card-14',
					list: 'list-4',
					title: 'Onboarding flow',
					desc: 'Step-by-step wizard for new users',
					assignee: 0,
					tags: [1, 3],
					pos: 1,
				},
				{
					id: 'card-15',
					list: 'list-4',
					title: 'Performance audit',
					desc: 'Lighthouse CI integration',
					assignee: 4,
					tags: [5],
					pos: 2,
				},
				{
					id: 'card-16',
					list: 'list-4',
					title: 'Write unit tests',
					desc: '80% coverage target for core modules',
					assignee: 1,
					tags: [4],
					pos: 3,
				},
			]
			return cards_data.map(d => this.card(d.id, d))
		}

		@$mol_mem_key
		card(
			id: string,
			init?: {
				list: string
				title: string
				desc: string
				assignee: number
				tags: number[]
				pos: number
			},
		) {
			return $kanban_domain_card.make({
				id: $mol_const(id),
				title: (next?: string) => this.card_title(id, next),
				description: (next?: string) => this.card_description(id, next),
				assignee: (next?: $kanban_domain_user | null) => this.card_assignee(id, next),
				completed: (next?: boolean) => this.card_completed(id, next),
				position: (next?: number) => this.card_position(id, next),
				tags: (next?: $kanban_domain_tag[]) => this.card_tags(id, next),
				comments: (next?: $kanban_domain_comment[]) => this.card_comments(id, next),
				list_id: (next?: string) => this.card_list_id(id, next),
			})
		}

		@$mol_mem_key
		card_title(id: string, next?: string) {
			const init = this._card_init(id)
			return next ?? init?.title ?? ''
		}

		@$mol_mem_key
		card_description(id: string, next?: string) {
			const init = this._card_init(id)
			return next ?? init?.desc ?? ''
		}

		@$mol_mem_key
		card_assignee(id: string, next?: $kanban_domain_user | null): $kanban_domain_user | null {
			if (next !== undefined) return next
			const init = this._card_init(id)
			return init ? this.users()[init.assignee] : null
		}

		@$mol_mem_key
		card_completed(id: string, next?: boolean) {
			return next ?? false
		}

		@$mol_mem_key
		card_position(id: string, next?: number) {
			const init = this._card_init(id)
			return next ?? init?.pos ?? 0
		}

		@$mol_mem_key
		card_tags(id: string, next?: $kanban_domain_tag[]): $kanban_domain_tag[] {
			if (next) return next
			const init = this._card_init(id)
			const all_tags = this.tags()
			return init ? init.tags.map(i => all_tags[i]) : []
		}

		@$mol_mem_key
		card_comments(id: string, next?: $kanban_domain_comment[]): $kanban_domain_comment[] {
			if (next) return next
			return []
		}

		@$mol_mem_key
		card_list_id(id: string, next?: string) {
			const init = this._card_init(id)
			return next ?? init?.list ?? ''
		}

		_card_init(id: string) {
			const cards_data: Record<
				string,
				{ list: string; title: string; desc: string; assignee: number; tags: number[]; pos: number }
			> = {
				'card-1': {
					list: 'list-1',
					title: 'Research competitors',
					desc: 'Analyze top 5 competitors and create a comparison report',
					assignee: 0,
					tags: [1, 3],
					pos: 0,
				},
				'card-2': {
					list: 'list-1',
					title: 'Write technical spec',
					desc: 'Document API endpoints and data models',
					assignee: 1,
					tags: [1],
					pos: 1,
				},
				'card-3': {
					list: 'list-1',
					title: 'Design system audit',
					desc: 'Review existing components for consistency',
					assignee: 3,
					tags: [3],
					pos: 2,
				},
				'card-4': {
					list: 'list-1',
					title: 'Setup CI/CD pipeline',
					desc: 'Configure GitHub Actions for automated testing',
					assignee: 2,
					tags: [4],
					pos: 3,
				},
				'card-5': {
					list: 'list-1',
					title: 'Database migration plan',
					desc: 'Plan migration from MySQL to PostgreSQL',
					assignee: 4,
					tags: [4],
					pos: 4,
				},
				'card-6': {
					list: 'list-2',
					title: 'Implement auth flow',
					desc: 'OAuth2 + JWT token management',
					assignee: 1,
					tags: [1, 4],
					pos: 0,
				},
				'card-7': {
					list: 'list-2',
					title: 'Create landing page',
					desc: 'Hero section, features, pricing',
					assignee: 3,
					tags: [3, 5],
					pos: 1,
				},
				'card-8': {
					list: 'list-2',
					title: 'Fix memory leak',
					desc: 'Event listeners not cleaned up in dashboard',
					assignee: 2,
					tags: [0, 2],
					pos: 2,
				},
				'card-9': {
					list: 'list-2',
					title: 'Add dark mode',
					desc: 'CSS custom properties based theming',
					assignee: 3,
					tags: [3, 5],
					pos: 3,
				},
				'card-10': {
					list: 'list-3',
					title: 'User profile page',
					desc: 'Avatar upload, settings, preferences',
					assignee: 0,
					tags: [1, 5],
					pos: 0,
				},
				'card-11': {
					list: 'list-3',
					title: 'API rate limiting',
					desc: 'Implement token bucket algorithm',
					assignee: 1,
					tags: [4],
					pos: 1,
				},
				'card-12': {
					list: 'list-3',
					title: 'Search functionality',
					desc: 'Full-text search with Elasticsearch',
					assignee: 4,
					tags: [1, 4],
					pos: 2,
				},
				'card-13': {
					list: 'list-4',
					title: 'Setup monitoring',
					desc: 'Grafana dashboards and alerting',
					assignee: 2,
					tags: [4],
					pos: 0,
				},
				'card-14': {
					list: 'list-4',
					title: 'Onboarding flow',
					desc: 'Step-by-step wizard for new users',
					assignee: 0,
					tags: [1, 3],
					pos: 1,
				},
				'card-15': {
					list: 'list-4',
					title: 'Performance audit',
					desc: 'Lighthouse CI integration',
					assignee: 4,
					tags: [5],
					pos: 2,
				},
				'card-16': {
					list: 'list-4',
					title: 'Write unit tests',
					desc: '80% coverage target for core modules',
					assignee: 1,
					tags: [4],
					pos: 3,
				},
			}
			return cards_data[id]
		}

		_next_card_id = 17

		add_card(list_id: string, title: string) {
			const id = `card-${this._next_card_id++}`
			const cards = this.list_cards(list_id)
			const card = $kanban_domain_card.make({
				id: $mol_const(id),
				title: (next?: string) => this.card_title(id, next),
				description: (next?: string) => this.card_description(id, next),
				assignee: (next?: $kanban_domain_user | null) => this.card_assignee(id, next),
				completed: (next?: boolean) => this.card_completed(id, next),
				position: (next?: number) => this.card_position(id, next),
				tags: (next?: $kanban_domain_tag[]) => this.card_tags(id, next),
				comments: (next?: $kanban_domain_comment[]) => this.card_comments(id, next),
				list_id: (next?: string) => this.card_list_id(id, next),
			})
			this.card_title(id, title)
			this.card_list_id(id, list_id)
			this.card_position(id, cards.length)
			this.list_cards(list_id, [...cards, card])
			return card
		}

		move_card(card: $kanban_domain_card, from_list_id: string, to_list_id: string, position?: number) {
			const from_cards = this.list_cards(from_list_id).filter(c => c !== card)
			this.list_cards(from_list_id, from_cards)

			const to_cards = [...this.list_cards(to_list_id)]
			if (position !== undefined) {
				to_cards.splice(position, 0, card)
			} else {
				to_cards.push(card)
			}
			this.list_cards(to_list_id, to_cards)
			this.card_list_id(card.id(), to_list_id)
		}

		delete_card(card: $kanban_domain_card) {
			const list_id = card.list_id()
			const cards = this.list_cards(list_id).filter(c => c !== card)
			this.list_cards(list_id, cards)
		}

		add_comment(card_id: string, user: $kanban_domain_user, text: string) {
			const comments = this.card_comments(card_id)
			const comment = $kanban_domain_comment.make({
				id: $mol_const(`comment-${Date.now()}`),
				author: $mol_const(user),
				text: $mol_const(text),
				created: $mol_const(new $mol_time_moment()),
			})
			this.card_comments(card_id, [...comments, comment])
			return comment
		}
	}
}
