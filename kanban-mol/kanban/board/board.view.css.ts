namespace $.$$ {
	const { px } = $mol_style_unit

	$mol_style_define($kanban_board, {
		Body: {
			overflow: 'auto',
		},

		Columns: {
			flex: {
				wrap: 'nowrap',
			},
			align: {
				items: 'stretch',
			},
			gap: px(8),
			padding: px(8),
		},
	})
}
