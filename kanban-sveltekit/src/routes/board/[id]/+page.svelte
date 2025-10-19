<script lang="ts">
	import type { BoardCard } from '$lib/server/boards';
	import BoardOverview from '$lib/components/BoardOverview.svelte';
	import CardList from '$lib/components/CardList.svelte';
	import AddCardModal from '$lib/components/modals/AddCardModal.svelte';
	import type { DndEvent } from 'svelte-dnd-action';
	import { debounce } from '$lib/utils';
	import { getBoardData, updateCardList, updateCardPositions } from '$lib/board.remote';
	import { isHttpError } from '@sveltejs/kit';

	let { params } = $props();

	const bordData = $derived(await getBoardData(params.id));

	let isAddCardModalOpen = $state(false);
	let isUpdating = $state(false);

	// Local state for optimistic updates during drag
	let optimisticBoard = $derived(bordData.board);

	// Debounced position update to avoid too many requests
	const debouncedUpdatePositions = debounce(async (cardIds: string[]) => {
		try {
			await updateCardPositions({
				cardIds: cardIds,
				boardId: params.id
			});
		} catch (error) {
			console.error('Failed to update card positions:', error);
		}
	}, 300);

	// Handle drag and drop consider event (during drag)
	function handleConsider(listId: string, e: CustomEvent<DndEvent<BoardCard>>) {
		const { items } = e.detail;

		// Update board state optimistically during drag
		optimisticBoard = {
			...optimisticBoard,
			lists: optimisticBoard.lists.map((list) =>
				list.id === listId ? { ...list, cards: items } : list
			)
		};
	}

	// Handle drag and drop finalize event (on drop)
	async function handleFinalize(listId: string, e: CustomEvent<DndEvent<BoardCard>>) {
		const { items } = e.detail;

		// Find the list that was modified
		const targetList = optimisticBoard.lists.find((list) => list.id === listId);
		if (!targetList) return;

		// Update board state optimistically
		optimisticBoard = {
			...optimisticBoard,
			lists: optimisticBoard.lists.map((list) =>
				list.id === listId ? { ...list, cards: items } : list
			)
		};

		isUpdating = true;

		try {
			// Check if any card changed lists
			const cardMovedToNewList = items.find((card) => {
				// Find the original list for this card in board_data.board
				const originalList = bordData.board.lists.find((list) =>
					list.cards.some((c) => c.id === card.id)
				);
				return originalList && originalList.id !== listId;
			});

			// Submit changes to server
			if (cardMovedToNewList) {
				// Card moved to a different list
				await updateCardList({
					cardId: cardMovedToNewList.id,
					newListId: listId,
					boardId: params.id
				});
			}

			// Update positions for all cards in the list (debounced)
			debouncedUpdatePositions(items.map((card) => card.id));
		} catch (error) {
			// Rollback on error - reload from server
			getBoardData(params.id).refresh();
			console.error('Failed to update cards:', error);
		} finally {
			isUpdating = false;
		}
	}
</script>

<svelte:boundary>
	{#snippet failed(error: unknown)}
		<div class="w-full p-8 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
			<div class="alert alert-error">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="stroke-current shrink-0 h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span>Error: {isHttpError(error) ? error.body.message : 'Internal error'}</span>
			</div>
		</div>
	{/snippet}

	<main class="w-full p-8 space-y-10 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
		<div class="breadcrumbs text-sm">
			<ul>
				<li>
					<a href="/" class="link link-hover">Boards</a>
				</li>
				<li>
					<span class="text-base-content/60">{bordData.board.title}</span>
				</li>
			</ul>
		</div>

		<div class="space-y-8">
			<BoardOverview data={bordData.board} />

			<div class="flex justify-start mb-4">
				<button type="button" class="btn btn-primary" onclick={() => (isAddCardModalOpen = true)}>
					Add Card
				</button>
			</div>

			<section class="flex gap-7 overflow-x-auto pb-8 relative">
				{#if isUpdating}
					<div class="absolute top-2 right-2 z-10">
						<span class="loading loading-spinner loading-sm text-primary"></span>
					</div>
				{/if}
				{#each optimisticBoard.lists as list (list.id)}
					<CardList
						{list}
						boardId={params.id}
						users={bordData.users}
						allUsers={bordData.users}
						allTags={bordData.tags}
						onConsider={(e) => handleConsider(list.id, e)}
						onFinalize={(e) => handleFinalize(list.id, e)}
					/>
				{/each}
			</section>
		</div>

		<AddCardModal
			boardId={bordData.board.id}
			users={bordData.users}
			tags={bordData.tags}
			isOpen={isAddCardModalOpen}
			onClose={() => (isAddCardModalOpen = false)}
		/>
	</main>
</svelte:boundary>
