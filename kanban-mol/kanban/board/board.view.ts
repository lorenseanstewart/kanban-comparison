namespace $.$$ {
	export class $kanban_board extends $.$kanban_board {
		board_title() {
			return this.board()?.title() ?? 'Kanban'
		}

		@$mol_mem
		columns() {
			const board = this.board()
			if (!board) return []
			return board.lists().map((list: $kanban_domain_list) => this.Column(list.id()))
		}

		list(id: string) {
			const board = this.board()
			if (!board) return null
			return board.lists().find((l: $kanban_domain_list) => l.id() === id) ?? null
		}
	}
}
