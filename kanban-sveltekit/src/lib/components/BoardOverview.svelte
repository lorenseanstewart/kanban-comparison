<script lang="ts">
	import { onMount } from 'svelte';
	import type { BoardDetails } from '$lib/server/boards';
	import BarChart from './charts/BarChart.svelte';
	import PieChart from './charts/PieChart.svelte';

	let { data }: { data: BoardDetails } = $props();

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	const pastelColors = ['#fbbf24', '#f472b6', '#a78bfa', '#60a5fa'];
	const chartData = $derived(data.lists.map((list) => ({ label: list.title, value: list.cards.length })));
</script>

<section class="bg-base-200 dark:bg-base-300 shadow-xl rounded-3xl p-8 space-y-6">
	<!-- Header Section -->
	<div class="space-y-3">
		<div class="badge badge-secondary badge-outline">Board overview</div>
		<h1 class="text-4xl font-black text-primary">{data.title}</h1>
		{#if data.description}
			<p class="text-base text-base-content/60 max-w-2xl">
				{data.description}
			</p>
		{/if}
	</div>

	<!-- Charts Section -->
	{#if mounted}
		<div
			class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-6 max-w-[1190px] mx-auto items-start"
		>
			<BarChart data={chartData} colors={pastelColors} title="Cards per List" />
			<PieChart data={chartData} colors={pastelColors} title="Distribution" />
		</div>
	{:else}
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h3 class="card-title text-base-content mb-4">Cards per List</h3>
					<div class="flex justify-center items-center h-[250px]">
						<span class="loading loading-spinner loading-lg text-primary"></span>
					</div>
				</div>
			</div>
			<div class="card bg-base-100 shadow-lg">
				<div class="card-body">
					<h3 class="card-title text-base-content mb-4">Distribution</h3>
					<div class="flex justify-center items-center h-[250px]">
						<span class="loading loading-spinner loading-lg text-primary"></span>
					</div>
				</div>
			</div>
		</div>
	{/if}
</section>
