<script lang="ts">
	import type { PageData } from './$types';
	import AddBoardModal from '$lib/components/modals/AddBoardModal.svelte';

	const { data }: { data: PageData } = $props();
	let isAddBoardModalOpen = $state(false);
</script>

<main class="w-full max-w-4xl mx-auto p-8 space-y-10 rounded-[2.5rem] bg-base-100 dark:bg-base-200 shadow-xl">
	<header class="text-center space-y-3">
		<p class="text-sm uppercase tracking-wide text-secondary">Your workspace</p>
		<h1 class="text-4xl font-black text-primary">Boards</h1>
		<p class="text-base text-base-content/60">Choose a board to jump into your Kanban flow.</p>
	</header>

	<div class="flex justify-end">
		<button type="button" class="btn btn-primary" onclick={() => (isAddBoardModalOpen = true)}>
			Add Board
		</button>
	</div>

	<section class="grid gap-8 md:grid-cols-2">
		{#if data.boards.length === 0}
			<div class="card bg-base-200 dark:bg-base-300 shadow-xl">
				<div class="card-body items-center text-center">
					<h2 class="card-title text-secondary">No boards yet</h2>
					<p class="text-base-content/60">Create your first board to get started.</p>
				</div>
			</div>
		{:else}
			{#each data.boards as board (board.id)}
				<a
					href="/board/{board.id}"
					data-sveltekit-preload-data="hover"
					class="card bg-base-200 dark:bg-base-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
				>
					<div class="card-body">
						<h2 class="card-title text-primary">{board.title}</h2>
						{#if board.description}
							<p class="text-sm text-base-content/60">{board.description}</p>
						{:else}
							<p class="badge badge-secondary badge-outline w-fit shadow">No description</p>
						{/if}
						<div class="card-actions justify-end">
							<span class="btn btn-secondary btn-sm shadow-lg">Open board</span>
						</div>
					</div>
				</a>
			{/each}
		{/if}
	</section>

	<AddBoardModal bind:isOpen={isAddBoardModalOpen} />
</main>
