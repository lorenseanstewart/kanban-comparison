<script lang="ts">
	import type { BoardCard, BoardList } from '$lib/server/boards';
	import BoardOverview from '$lib/components/BoardOverview.svelte';
	import CardList from '$lib/components/CardList.svelte';
	import AddCardModal from '$lib/components/modals/AddCardModal.svelte';
	import { debounce } from '$lib/utils';
	import { getBoardData, updateCardList, updateCardPositions } from '$lib/board.remote';
	import { isHttpError } from '@sveltejs/kit';

	let { params } = $props();

	const bordData = $derived(await getBoardData(params.id));

	let isAddCardModalOpen = $state(false);
	let isUpdating = $state(false);

	// Create optimistic board derived from current data
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

	// Handle card drop
	async function handleCardDrop(cardId: string, newListId: string, newPosition: number) {
		isUpdating = true;

		try {
			// Find the card and its current list
			let source_list: BoardList | undefined;
			let card: BoardCard | undefined;

			for (const list of bordData.board.lists) {
				const found_card = list.cards.find((c) => c.id === cardId);
				if (found_card) {
					source_list = list;
					card = found_card;
					break;
				}
			}

			if (!card || !source_list) {
				console.error('Card not found');
				return;
			}

			// Update optimistically
			const optimistic_lists = optimisticBoard.lists.map((list) => {
				if (list.id === source_list!.id) {
					// Remove card from source list
					return {
						...list,
						cards: list.cards.filter((c) => c.id !== cardId)
					};
				} else if (list.id === newListId) {
					// Add card to target list at the specified position
					const new_cards = [...list.cards];
					new_cards.splice(newPosition, 0, card!);
					return {
						...list,
						cards: new_cards
					};
				}
				return list;
			});
			optimisticBoard = {
				...optimisticBoard,
				lists: optimistic_lists
			};

			// Update card list if it changed
			if (source_list.id !== newListId) {
				await updateCardList({
					cardId: cardId,
					newListId: newListId,
					boardId: params.id
				});
			}

			// Update positions for all cards in the target list
			const target_list = optimistic_lists.find((l) => l.id === newListId);
			if (target_list) {
				debouncedUpdatePositions(target_list.cards.map((c) => c.id));
			}
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
						onCardDrop={handleCardDrop}
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
