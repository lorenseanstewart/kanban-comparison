<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import type { PageData } from './$types';
	import type { BoardCard, BoardDetails } from '$lib/server/boards';
	import BoardOverview from '$lib/components/BoardOverview.svelte';
	import CardList from '$lib/components/CardList.svelte';
	import AddCardModal from '$lib/components/modals/AddCardModal.svelte';
	import type { DndEvent } from 'svelte-dnd-action';
	import { debounce } from '$lib/utils';

	let { data }: { data: PageData } = $props();

	// Local mutable copy for optimistic updates
	let board = $state<BoardDetails>(data.board);
	let isAddCardModalOpen = $state(false);
	let isUpdating = $state(false);

	// Sync local state with server data
	$effect(() => {
		board = data.board;
	});

	// Helper function to submit form actions
	async function submitAction(action: string, formData: FormData): Promise<Response> {
		const response = await fetch(`?/${action}`, {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			await invalidate('app:board');
		}

		return response;
	}

	// Debounced position update to avoid too many requests
	const debouncedUpdatePositions = debounce(async (cardIds: string[]) => {
		const formData = new FormData();
		cardIds.forEach((id) => formData.append('cardIds', id));

		try {
			await submitAction('updateCardPositions', formData);
		} catch (error) {
			console.error('Failed to update card positions:', error);
		}
	}, 300);

	// Handle drag and drop consider event (during drag)
	function handleConsider(listId: string, e: CustomEvent<DndEvent<BoardCard>>) {
		const { items } = e.detail;

		// Update board state optimistically during drag
		board = {
			...board,
			lists: board.lists.map((list) => (list.id === listId ? { ...list, cards: items } : list))
		};
	}

	// Handle drag and drop finalize event (on drop)
	async function handleFinalize(listId: string, e: CustomEvent<DndEvent<BoardCard>>) {
		const { items } = e.detail;

		// Find the list that was modified
		const targetList = board.lists.find((list) => list.id === listId);
		if (!targetList) return;

		// Update board state optimistically
		board = {
			...board,
			lists: board.lists.map((list) => (list.id === listId ? { ...list, cards: items } : list))
		};

		isUpdating = true;

		try {
			// Check if any card changed lists
			const cardMovedToNewList = items.find((card) => {
				// Find the original list for this card in data.board
				const originalList = data.board.lists.find((list) =>
					list.cards.some((c) => c.id === card.id)
				);
				return originalList && originalList.id !== listId;
			});

			// Submit changes to server
			if (cardMovedToNewList) {
				// Card moved to a different list
				const formData = new FormData();
				formData.append('cardId', cardMovedToNewList.id);
				formData.append('newListId', listId);

				const response = await submitAction('updateCardList', formData);

				if (!response.ok) {
					// Rollback on error - reload from server
					await invalidate('app:board');
					console.error('Failed to move card');
					return;
				}
			}

			// Update positions for all cards in the list (debounced)
			debouncedUpdatePositions(items.map((card) => card.id));
		} catch (error) {
			// Rollback on error - reload from server
			await invalidate('app:board');
			console.error('Failed to update cards:', error);
		} finally {
			isUpdating = false;
		}
	}
</script>

<main class="w-full p-8 space-y-10 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
	<div class="breadcrumbs text-sm">
		<ul>
			<li>
				<a href="/" class="link link-hover">Boards</a>
			</li>
			<li>
				<span class="text-base-content/60">{data.board.title}</span>
			</li>
		</ul>
	</div>

	<div class="space-y-8">
		<BoardOverview data={data.board} />

		<div class="flex justify-start mb-4">
			<button
				type="button"
				class="btn btn-primary"
				onclick={() => (isAddCardModalOpen = true)}
			>
				Add Card
			</button>
		</div>

		<section class="flex gap-7 overflow-x-auto pb-8 relative">
			{#if isUpdating}
				<div class="absolute top-2 right-2 z-10">
					<span class="loading loading-spinner loading-sm text-primary"></span>
				</div>
			{/if}
			{#each board.lists as list (list.id)}
				<CardList
					{list}
					users={data.users}
					allUsers={data.users}
					allTags={data.tags}
					onConsider={(e) => handleConsider(list.id, e)}
					onFinalize={(e) => handleFinalize(list.id, e)}
				/>
			{/each}
		</section>
	</div>

	<AddCardModal
		boardId={board.id}
		users={data.users}
		tags={data.tags}
		isOpen={isAddCardModalOpen}
		onClose={() => (isAddCardModalOpen = false)}
	/>
</main>
