<script lang="ts">
	import type { BoardList, BoardCard, UsersList, TagsList } from '$lib/server/boards';
	import Card from './Card.svelte';
	import { dndzone } from 'svelte-dnd-action';
	import type { DndEvent } from 'svelte-dnd-action';

	const FLIP_DURATION_MS = 200;

	let {
		list,
		boardId,
		users,
		allUsers,
		allTags,
		onConsider,
		onFinalize
	}: {
		list: BoardList;
		boardId: string;
		users: UsersList;
		allUsers: UsersList;
		allTags: TagsList;
		onConsider?: (e: CustomEvent<DndEvent<BoardCard>>) => void;
		onFinalize?: (e: CustomEvent<DndEvent<BoardCard>>) => void;
	} = $props();
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
			class="min-h-[200px] space-y-4"
			use:dndzone={{ items: list.cards, flipDurationMs: FLIP_DURATION_MS }}
			onconsider={onConsider}
			onfinalize={onFinalize}
		>
			{#if list.cards.length > 0}
				{#each list.cards as card (card.id)}
					<div data-id={card.id}>
						<Card {card} {boardId} {users} {allUsers} {allTags} />
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
