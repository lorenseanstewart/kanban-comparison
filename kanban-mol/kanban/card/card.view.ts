namespace $.$$ {
	export class $kanban_card extends $.$kanban_card {
		card_title() {
			return this.card()?.title() ?? ''
		}

		card_description() {
			const desc = this.card()?.description() ?? ''
			return desc.length > 80 ? desc.slice(0, 80) + '...' : desc
		}

		completed() {
			return this.card()?.completed() ?? false
		}

		assignee_name() {
			const user = this.card()?.assignee()
			return user ? user.name() : ''
		}

		@$mol_mem
		footer() {
			const items: $mol_view[] = []
			const card = this.card()
			if (!card) return items

			const tags = card.tags()
			for (const tag of tags) {
				items.push(this.Tag(tag.id()))
			}

			if (card.assignee()) {
				items.push(this.Assignee())
			}

			const comments = card.comments()
			if (comments.length > 0) {
				items.push(this.Comment_count())
			}

			return items
		}

		tag_title(id: string) {
			const card = this.card()
			if (!card) return ''
			const tag = card.tags().find((t: $kanban_domain_tag) => t.id() === id)
			return tag?.name() ?? ''
		}

		comment_count_text() {
			const count = this.card()?.comments().length ?? 0
			return `${count} comment${count !== 1 ? 's' : ''}`
		}
	}
}
