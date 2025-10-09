<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import CardEditModal from '$lib/components/modals/CardEditModal.svelte';
	import CommentModal from '$lib/components/modals/CommentModal.svelte';
	import EditPencil from '$lib/components/icons/EditPencil.svelte';
	import type { BoardCard, UsersList, TagsList } from '$lib/server/boards';

	let { card, users, allUsers, allTags }: {
		card: BoardCard;
		users: UsersList;
		allUsers: UsersList;
		allTags: TagsList;
	} = $props();

	let isEditModalOpen = $state(false);
	let isCommentModalOpen = $state(false);
</script>

<div>
	<div class="card bg-base-100 dark:bg-neutral shadow-lg transition-all duration-300 ease-in-out">
		<div class="card-body gap-3 p-4">
			<div class="flex items-start justify-between gap-2">
				<h3 class="card-title text-lg text-base-content">{card.title}</h3>
				{#if card.completed}
					<span class="badge badge-success badge-outline">Done</span>
				{/if}
				<button
					type="button"
					class="btn btn-ghost btn-xs btn-circle"
					onclick={() => (isEditModalOpen = true)}
					aria-label="Edit card"
				>
					<EditPencil />
				</button>
			</div>

			{#if card.assigneeId}
				<div class="badge badge-outline badge-secondary badge-sm">
					Assigned to {users.find((u) => u.id === card.assigneeId)?.name ?? 'Unassigned'}
				</div>
			{/if}

			{#if card.description}
				<p class="text-sm text-base-content/70 bg-base-200 dark:bg-base-100 rounded-xl px-3 py-2">
					{card.description}
				</p>
			{/if}

			{#if card.tags.length > 0}
				<div class="flex flex-wrap gap-2.5 rounded-xl px-3 py-2 bg-base-200 dark:bg-base-100">
					{#each card.tags as tag (tag.id)}
						<span
							class="badge border-0 shadow font-semibold text-white"
							style={`background-color: ${tag.color};`}
						>
							{tag.name}
						</span>
					{/each}
				</div>
			{/if}

			<div class="rounded-2xl bg-base-200 dark:bg-base-100 p-3 space-y-2 shadow-inner">
				<div class="flex items-center justify-between">
					<p class="text-xs font-semibold text-base-content/50">Comments</p>
					<button
						type="button"
						class="btn btn-ghost btn-xs btn-circle"
						onclick={() => (isCommentModalOpen = true)}
						aria-label="Add comment"
					>
						+
					</button>
				</div>
				{#if card.comments.length === 0}
					<p class="text-sm text-base-content/70">No comments yet</p>
				{:else}
					<ul class="space-y-1 text-sm text-base-content/70">
						{#each card.comments as comment (comment.id)}
							<li>
								<span class="font-semibold text-base-content">
									{users.find((u) => u.id === comment.userId)?.name ?? 'Unknown'}:
								</span>
								{comment.text}
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	</div>

	<CardEditModal
		card={card}
		users={allUsers}
		tags={allTags}
		isOpen={isEditModalOpen}
		onClose={() => (isEditModalOpen = false)}
	/>
	<CommentModal
		card={card}
		users={allUsers}
		isOpen={isCommentModalOpen}
		onClose={() => (isCommentModalOpen = false)}
	/>
</div>
