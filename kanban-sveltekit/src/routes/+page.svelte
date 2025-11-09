<script lang="ts">
	import Overview from './Overview.svelte';
</script>

<main
	class="w-full max-w-4xl mx-auto p-8 space-y-10 rounded-[2.5rem] bg-base-100 dark:bg-base-200 shadow-xl"
>
	<header class="text-center space-y-3">
		<p class="text-sm uppercase tracking-wide text-secondary">Your workspace</p>
		<h1 class="text-4xl font-black text-primary">Boards</h1>
		<p class="text-base text-base-content/60">Choose a board to jump into your Kanban flow.</p>
	</header>

	<svelte:boundary>
		<Overview />
		{#snippet pending()}
			<section class="grid gap-8 md:grid-cols-2 mt-[7.5rem]">
				{#each Array(2) as _}
					<div class="card bg-base-200 dark:bg-base-300 shadow-xl h-[8rem]">
						<div class="card-body items-center text-center">...</div>
					</div>
				{/each}
			</section>
		{/snippet}
	</svelte:boundary>
</main>
