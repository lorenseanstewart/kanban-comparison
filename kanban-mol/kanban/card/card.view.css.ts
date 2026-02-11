namespace $.$$ {
	const { rem, px } = $mol_style_unit

	$mol_style_define($kanban_card, {
		display: 'block',
		background: {
			color: $mol_theme.card,
		},
		box: {
			shadow: [
				{
					inset: false,
					x: 0,
					y: px(1),
					blur: px(3),
					spread: 0,
					color: $mol_theme.shade,
				},
			],
		},
		border: {
			radius: $mol_gap.round,
		},
		padding: $mol_gap.block,
		margin: {
			bottom: px(4),
		},
		cursor: 'pointer',

		':hover': {
			box: {
				shadow: [
					{
						inset: false,
						x: 0,
						y: px(2),
						blur: px(6),
						spread: 0,
						color: $mol_theme.shade,
					},
				],
			},
		},

		Title: {
			font: {
				weight: 600,
				size: rem(0.875),
			},
			margin: {
				bottom: px(4),
			},
		},

		Description: {
			font: {
				size: rem(0.75),
			},
			opacity: 0.7,
			margin: {
				bottom: px(8),
			},
		},

		Footer: {
			flex: {
				wrap: 'wrap',
			},
			gap: px(4),
		},

		Tag: {
			font: {
				size: rem(0.7),
			},
			padding: {
				top: px(2),
				bottom: px(2),
				left: px(6),
				right: px(6),
			},
			border: {
				radius: $mol_gap.round,
			},
			background: {
				color: $mol_theme.hover,
			},
		},

		Assignee: {
			font: {
				size: rem(0.7),
				weight: 500,
			},
			opacity: 0.6,
		},

		Comment_count: {
			font: {
				size: rem(0.7),
			},
			opacity: 0.5,
		},
	})
}
