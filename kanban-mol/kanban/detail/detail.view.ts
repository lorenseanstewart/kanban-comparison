namespace $.$$ {
	export class $kanban_detail extends $.$kanban_detail {
		card_title_text() {
			return this.card()?.title() ?? 'Card'
		}

		card_title(next?: string) {
			const card = this.card()
			if (!card) return ''
			if (next !== undefined) card.title(next)
			return card.title()
		}

		card_description(next?: string) {
			const card = this.card()
			if (!card) return ''
			if (next !== undefined) card.description(next)
			return card.description()
		}

		card_completed(next?: boolean) {
			const card = this.card()
			if (!card) return false
			if (next !== undefined) card.completed(next)
			return card.completed()
		}

		assignee_id(next?: string) {
			const card = this.card()
			if (!card) return ''
			if (next !== undefined) {
				const user =
					this.domain()
						.users()
						.find((u: $kanban_domain_user) => u.id() === next) ?? null
				card.assignee(user)
			}
			return card.assignee()?.id() ?? ''
		}

		@$mol_mem
		assignee_dictionary() {
			const dict: Record<string, string> = { '': 'None' }
			for (const user of this.domain().users()) {
				dict[user.id()] = user.name()
			}
			return dict
		}

		@$mol_mem
		assignee_options() {
			return [
				'',
				...this.domain()
					.users()
					.map((u: $kanban_domain_user) => u.id()),
			]
		}

		@$mol_mem
		tag_buttons() {
			return this.domain()
				.tags()
				.map((tag: $kanban_domain_tag) => this.Tag_button(tag.id()))
		}

		tag_button_title(id: string) {
			const tag = this.domain()
				.tags()
				.find((t: $kanban_domain_tag) => t.id() === id)
			return tag?.name() ?? ''
		}

		tag_checked(id: string, next?: boolean) {
			const card = this.card()
			if (!card) return false
			const tags = card.tags()
			const tag = this.domain()
				.tags()
				.find((t: $kanban_domain_tag) => t.id() === id)
			if (!tag) return false

			if (next !== undefined) {
				if (next) {
					card.tags([...tags, tag])
				} else {
					card.tags(tags.filter((t: $kanban_domain_tag) => t.id() !== id))
				}
			}

			return card.tags().some((t: $kanban_domain_tag) => t.id() === id)
		}

		@$mol_mem
		comment_rows() {
			const card = this.card()
			if (!card) return []
			return card.comments().map((c: $kanban_domain_comment) => this.Comment_row(c.id()))
		}

		comment_author(id: string) {
			const card = this.card()
			if (!card) return ''
			const comment = card.comments().find((c: $kanban_domain_comment) => c.id() === id)
			return comment?.author()?.name() ?? 'Anonymous'
		}

		comment_text(id: string) {
			const card = this.card()
			if (!card) return ''
			const comment = card.comments().find((c: $kanban_domain_comment) => c.id() === id)
			return comment?.text() ?? ''
		}

		new_comment_text(next?: string) {
			return next ?? ''
		}

		submit_comment() {
			const card = this.card()
			if (!card) return
			const text = this.new_comment_text()
			if (!text.trim()) return

			const user = this.domain().users()[0]
			this.domain().add_comment(card.id(), user, text)
			this.new_comment_text('')
		}

		delete_card() {
			const card = this.card()
			if (!card) return
			this.domain().delete_card(card)
			this.back()
		}
	}
}
