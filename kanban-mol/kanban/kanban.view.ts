namespace $.$$ {

	export class $kanban extends $.$kanban {

		@ $mol_mem
		domain() {
			return new $kanban_domain_mock
		}

		@ $mol_mem
		board() {
			return this.domain().boards()[0] ?? null
		}

		card_id( next?: string ) {
			return $mol_state_arg.value( 'card', next ) ?? ''
		}

		@ $mol_mem
		selected_card() {
			const id = this.card_id()
			if( !id ) return null
			const board = this.board()
			if( !board ) return null
			for( const list of board.lists() ) {
				for( const card of list.cards() ) {
					if( card.id() === id ) return card
				}
			}
			return null
		}

		close_detail() {
			this.card_id( '' )
		}

		pages() {
			const pages: $mol_view[] = []

			const board = this.board()
			if( board ) pages.push( this.Board_page() )

			const card = this.selected_card()
			if( card ) pages.push( this.Detail_page() )

			return pages
		}

	}

}
