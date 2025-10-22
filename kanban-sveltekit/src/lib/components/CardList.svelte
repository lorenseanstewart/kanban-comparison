<script lang="ts">
	import type { BoardList, UsersList, TagsList } from '$lib/server/boards';
	import Card from './Card.svelte';

	let {
		list,
		boardId,
		users,
		allUsers,
		allTags,
		onCardDrop
	}: {
		list: BoardList;
		boardId: string;
		users: UsersList;
		allUsers: UsersList;
		allTags: TagsList;
		onCardDrop: (cardId: string, newListId: string, newPosition: number) => void;
	} = $props();

	// Bind to the drop zone element
	let drop_zone_element: HTMLDivElement;

	function handle_drag_over(e: DragEvent) {
		e.preventDefault();
		if (drop_zone_element) {
			drop_zone_element.classList.add('bg-base-300', 'dark:bg-base-100');
		}
	}

	function handle_drag_leave(e: DragEvent) {
		if (drop_zone_element) {
			drop_zone_element.classList.remove('bg-base-300', 'dark:bg-base-100');
		}
	}

	function handle_drop(e: DragEvent) {
		e.preventDefault();
		if (drop_zone_element) {
			drop_zone_element.classList.remove('bg-base-300', 'dark:bg-base-100');
		}

		const card_id = e.dataTransfer?.getData('cardId')!;
		// Calculate drop position based on mouse position
		const drop_y = e.clientY;
		const cards_in_list = drop_zone_element.querySelectorAll('[data-card-draggable]');
		let insert_position = list.cards.length;

		for (let i = 0; i < cards_in_list.length; i++) {
			const card_element = cards_in_list[i] as HTMLElement;
			const rect = card_element.getBoundingClientRect();
			const card_middle = rect.top + rect.height / 2;

			if (drop_y < card_middle) {
				insert_position = i;
				break;
			}
		}

		onCardDrop(card_id, list.id, insert_position);
	}
</script>

<article class="card bg-base-200 dark:bg-base-300 min-w-[20rem] shadow-xl">
	<div class="card-body gap-4">
		<header class="flex items-center justify-between">
			<h2 class="card-title text-base-content">{list.title}</h2>
			<div class="badge badge-primary badge-outline badge-lg shadow">
				{list.cards.length} cards
			</div>
		</header>

		<div
			bind:this={drop_zone_element}
			class="min-h-[200px] space-y-4 rounded-lg transition-colors"
			role="region"
			ondragover={handle_drag_over}
			ondragleave={handle_drag_leave}
			ondrop={handle_drop}
		>
			{#if list.cards.length > 0}
				{#each list.cards as card (card.id)}
					<div data-card-draggable data-card-id={card.id}>
						<Card {card} {boardId} {users} {allUsers} {allTags} listId={list.id} />
					</div>
				{/each}
			{:else}
				<div class="alert alert-info text-sm">
					<span>No cards yet</span>
				</div>
			{/if}
		</div>
	</div>
</article>
