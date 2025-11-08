<script lang="ts">
	import chartsCss from 'charts.css?inline';

	let {
		data,
		colors,
		title
	}: {
		data: Array<{ label: string; value: number }>;
		colors: string[];
		title: string;
	} = $props();

	let totalValue = $derived(data.reduce((sum, item) => sum + item.value, 0));
</script>

<svelte:head>
	{@html `<style>${chartsCss}</style>`}
</svelte:head>

<div class="card bg-base-100 shadow-lg">
	<div class="card-body p-4 flex flex-col items-center">
		<h3 class="card-title text-sm text-base-content mb-2 w-full">
			{title}
		</h3>
		<table
			class="charts-css pie mx-auto mb-3"
			style="height: 120px; width: 120px; --labels-size: 0;"
		>
			<tbody>
				{#each data as item, index}
					{@const startValue = data
						.slice(0, index)
						.reduce((sum, d) => sum + d.value / totalValue, 0)}
					{@const endValue = startValue + (totalValue > 0 ? item.value / totalValue : 0)}
					<tr>
						<td
							style="--start: {startValue}; --end: {endValue}; --color: {colors[
								index % colors.length
							]};"
						></td>
					</tr>
				{/each}
			</tbody>
		</table>
		<!-- Legend -->
		<div class="flex flex-col gap-1 w-full">
			{#each data as item, index}
				{@const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0}
				<div class="flex items-center gap-2 justify-between">
					<div class="flex items-center gap-2">
						<div
							class="w-2.5 h-2.5 rounded-sm flex-shrink-0"
							style="background-color: {colors[index % colors.length]};"
						></div>
						<span class="text-xs text-base-content">{item.label}</span>
					</div>
					<span class="text-xs font-semibold text-base-content">
						{percentage.toFixed(0)}%
					</span>
				</div>
			{/each}
		</div>
	</div>
</div>
