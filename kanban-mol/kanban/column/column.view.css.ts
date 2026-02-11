namespace $.$$ {
	const { rem, px } = $mol_style_unit

	$mol_style_define($kanban_column, {
		flex: {
			basis: px(300),
			shrink: 0,
			grow: 0,
		},

		minHeight: px(400),

		Card_count: {
			opacity: 0.5,
			font: {
				size: rem(0.875),
			},
		},
	})
}
