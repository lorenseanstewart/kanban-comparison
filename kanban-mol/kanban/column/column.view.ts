namespace $.$$ {
	export class $kanban_column extends $.$kanban_column {
		column_title() {
			return this.list()?.title() ?? ''
		}

		card_count() {
			return String(this.list()?.cards().length ?? 0)
		}

		@$mol_mem
		card_rows() {
			const list = this.list()
			if (!list) return []
			return list.cards().map((card: $kanban_domain_card) => this.Card_drag(card.id()))
		}

		card(id: string) {
			const list = this.list()
			if (!list) return null
			return list.cards().find((c: $kanban_domain_card) => c.id() === id) ?? null
		}

		drag_card_id(id: string) {
			return id
		}

		transfer_adopt(transfer: DataTransfer) {
			const id = transfer.getData('text/plain')
			if (!id || !id.startsWith('card-')) return null
			return id
		}

		receive_card(card_id: string) {
			if (!card_id) return
			const domain = this.domain()
			const list = this.list()
			if (!list) return

			const from_list_id = domain.card_list_id(card_id)
			if (from_list_id === list.id()) return

			const card = this._find_card(card_id)
			if (!card) return

			domain.move_card(card, from_list_id, list.id())
		}

		receive_before(anchor_id: string, card_id: string) {
			if (!card_id || !anchor_id) return
			const domain = this.domain()
			const list = this.list()
			if (!list) return

			const from_list_id = domain.card_list_id(card_id)
			const card = this._find_card(card_id)
			if (!card) return

			const to_cards = list.cards()
			const anchor_index = to_cards.findIndex((c: $kanban_domain_card) => c.id() === anchor_id)

			if (from_list_id === list.id()) {
				const cards = to_cards.filter((c: $kanban_domain_card) => c !== card)
				const idx = cards.findIndex((c: $kanban_domain_card) => c.id() === anchor_id)
				cards.splice(idx, 0, card)
				domain.list_cards(list.id(), cards)
			} else {
				domain.move_card(card, from_list_id, list.id(), anchor_index)
			}
		}

		_find_card(card_id: string) {
			const domain = this.domain()
			const from_list_id = domain.card_list_id(card_id)
			const from_list_cards = domain.list_cards(from_list_id)
			return from_list_cards.find(c => c.id() === card_id) ?? null
		}

		card_click(id: string, event?: Event) {
			this.card_id(id)
		}

		add_card() {
			const list = this.list()
			if (!list) return
			this.domain().add_card(list.id(), 'New card')
		}
	}
}
