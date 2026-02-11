namespace $.$$ {
	const { rem, px } = $mol_style_unit

	$mol_style_define($kanban_detail, {
		flex: {
			basis: px(400),
			shrink: 0,
			grow: 1,
		},

		Comments_title: {
			font: {
				weight: 600,
				size: rem(1),
			},
			margin: {
				top: px(16),
				bottom: px(8),
			},
		},

		Comment_row: {
			padding: $mol_gap.block,
			background: {
				color: $mol_theme.hover,
			},
			border: {
				radius: $mol_gap.round,
			},
			margin: {
				bottom: px(4),
			},
		},

		Comment_author: {
			font: {
				weight: 600,
				size: rem(0.75),
			},
			margin: {
				right: px(8),
			},
		},

		Comment_text: {
			font: {
				size: rem(0.8),
			},
		},

		Add_comment: {
			margin: {
				top: px(8),
			},
		},

		Tags_row: {
			flex: {
				wrap: 'wrap',
			},
			gap: px(4),
		},

		Delete: {
			color: $mol_theme.focus,
		},
	})
}
