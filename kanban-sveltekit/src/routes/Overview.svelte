<script lang="ts">
	import { getBoards } from '$lib/boards.remote.js';
	import AddBoardModal from '$lib/components/modals/AddBoardModal.svelte';

	const boards = $derived(await getBoards());
</script>

<AddBoardModal />

<section class="grid gap-8 md:grid-cols-2">
	{#if boards.length === 0}
		<div class="card bg-base-200 dark:bg-base-300 shadow-xl">
			<div class="card-body items-center text-center">
				<h2 class="card-title text-secondary">No boards yet</h2>
				<p class="text-base-content/60">Create your first board to get started.</p>
			</div>
		</div>
	{:else}
		{#each boards as board (board.id)}
			<a
				href="/board/{board.id}"
				data-sveltekit-preload-data="hover"
				class="card bg-base-200 dark:bg-base-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
			>
				<div class="card-body">
					<h2 class="card-title text-primary">{board.title}</h2>
					{#if board.description}
						<p class="text-sm text-base-content/60">
							{board.description}
						</p>
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
