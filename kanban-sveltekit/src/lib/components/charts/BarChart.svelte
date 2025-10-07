<script lang="ts">
	let { data, colors, title }: {
		data: Array<{ label: string; value: number }>;
		colors: string[];
		title: string;
	} = $props();

	const maxValue = $derived(Math.max(...data.map((item) => item.value), 1));
</script>

<div class="card bg-base-100 shadow-lg">
	<div class="card-body p-4">
		<h3 class="card-title text-sm text-base-content mb-4">{title}</h3>

		<div
			class="grid gap-4"
			style={`grid-template-columns: repeat(${data.length}, 1fr);`}
		>
			{#each data as item, index}
				{@const heightPercent = (item.value / maxValue) * 100}
				<div class="flex flex-col items-center gap-2">
					<div class="w-full flex flex-col justify-end" style="height: 150px;">
						<div
							class="w-full rounded-t"
							style={`height: ${heightPercent}%; background-color: ${colors[index % colors.length]}; transition: height 500ms ease-out, background-color 500ms ease-out;`}
						>
							<div class="text-xs text-white font-semibold text-center pt-1">
								{item.value}
							</div>
						</div>
					</div>
					<div class="text-xs text-base-content text-center font-medium pt-3">
						{item.label}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
