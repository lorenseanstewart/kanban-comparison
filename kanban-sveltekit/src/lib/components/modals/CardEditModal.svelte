<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import type { BoardCard, UsersList, TagsList } from '$lib/server/boards';

	let {
		card,
		users,
		tags,
		isOpen,
		onClose
	}: {
		card: BoardCard;
		users: UsersList;
		tags: TagsList;
		isOpen: boolean;
		onClose: () => void;
	} = $props();

	let selectedTagIds = $state(new Set<string>(card.tags.map((t) => t.id)));
	let error = $state<string | null>(null);
	let isSubmitting = $state(false);
	let isDeleting = $state(false);

	// Reset selected tags when card changes
	$effect(() => {
		selectedTagIds = new Set(card.tags.map((t) => t.id));
	});

	function toggleTag(tagId: string) {
		const newSet = new Set(selectedTagIds);
		if (newSet.has(tagId)) {
			newSet.delete(tagId);
		} else {
			newSet.add(tagId);
		}
		selectedTagIds = newSet;
	}

	function handleClose() {
		selectedTagIds = new Set(card.tags.map((t) => t.id));
		error = null;
		onClose();
	}

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this card?')) {
			return;
		}

		isDeleting = true;
		error = null;

		try {
			const formData = new FormData();
			formData.append('cardId', card.id);

			const response = await fetch('?/deleteCard', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.type === 'success' && result.data?.success) {
				handleClose();
				await invalidate('app:board');
			} else if (result.type === 'failure' && result.data?.error) {
				error = result.data.error;
			} else {
				error = 'Failed to delete card';
			}
		} catch (err) {
			error = 'Failed to delete card. Please try again.';
		} finally {
			isDeleting = false;
		}
	}
</script>

{#if isOpen}
	<dialog
		class="modal modal-open !mt-0"
		onclick={(e) => {
			if (e.target === e.currentTarget) handleClose();
		}}
	>
		<div class="modal-backdrop bg-black/70"></div>
		<div class="modal-box bg-base-200 dark:bg-base-300">
			<form
				method="POST"
				action="?/updateCard"
				use:enhance={({ formData }) => {
					isSubmitting = true;
					error = null;

					formData.delete('tagIds');
					selectedTagIds.forEach((tagId) => {
						formData.append('tagIds', tagId);
					});

					return async ({ result, update }) => {
						isSubmitting = false;

						if (result.type === 'success' && result.data?.success) {
							handleClose();
							await invalidate('app:board');
						} else if (result.type === 'failure' && result.data?.error) {
							error = result.data.error;
						} else {
							error = 'Failed to update card';
						}

						update();
					};
				}}
			>
				<button
					type="button"
					class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
					onclick={handleClose}
					disabled={isSubmitting || isDeleting}
				>
					✕
				</button>
				<h3 class="font-bold text-lg mb-4">Edit Card</h3>

				{#if error}
					<div class="alert alert-error mb-4">
						<span>{error}</span>
					</div>
				{/if}

				<input type="hidden" name="cardId" value={card.id} />

				<div class="form-control w-full mb-4">
					<label class="label" for="edit-card-title-{card.id}">
						<span class="label-text">Title</span>
					</label>
					<input
						type="text"
						name="title"
						id="edit-card-title-{card.id}"
						class="input input-bordered w-full"
						value={card.title}
						required
						disabled={isSubmitting || isDeleting}
					/>
				</div>

				<div class="form-control w-full mb-4">
					<label class="label" for="edit-card-description-{card.id}">
						<span class="label-text">Description</span>
					</label>
					<textarea
						name="description"
						id="edit-card-description-{card.id}"
						class="textarea textarea-bordered h-24 w-full"
						value={card.description || ''}
						disabled={isSubmitting || isDeleting}
					></textarea>
				</div>

				<div class="form-control w-full mb-4">
					<label class="label" for="edit-card-assignee-{card.id}">
						<span class="label-text">Assignee</span>
					</label>
					<select
						name="assigneeId"
						id="edit-card-assignee-{card.id}"
						class="select select-bordered w-full"
						disabled={isSubmitting || isDeleting}
					>
						<option value="">Unassigned</option>
						{#each users as user (user.id)}
							<option value={user.id} selected={user.id === card.assigneeId}>
								{user.name}
							</option>
						{/each}
					</select>
				</div>

				<div class="form-control w-full mb-4">
					<div class="label">
						<span class="label-text">Tags</span>
					</div>
					<div class="flex flex-wrap gap-2 p-4 border border-base-300 rounded-lg">
						{#each tags as tag (tag.id)}
							<button
								type="button"
								class="badge border-2 font-semibold cursor-pointer transition-all hover:scale-105"
								class:badge-outline={!selectedTagIds.has(tag.id)}
								class:text-white={selectedTagIds.has(tag.id)}
								style={selectedTagIds.has(tag.id)
									? `background-color: ${tag.color}; border-color: ${tag.color};`
									: `color: ${tag.color}; border-color: ${tag.color};`}
								onclick={() => toggleTag(tag.id)}
								disabled={isSubmitting || isDeleting}
							>
								{tag.name}
							</button>
						{/each}
					</div>
				</div>

				<div class="modal-action justify-between">
					<button
						type="button"
						class="btn btn-error"
						onclick={handleDelete}
						disabled={isSubmitting || isDeleting}
					>
						{isDeleting ? 'Deleting...' : 'Delete Card'}
					</button>
					<div class="flex gap-2">
						<button
							type="button"
							class="btn btn-ghost"
							onclick={handleClose}
							disabled={isSubmitting || isDeleting}
						>
							Cancel
						</button>
						<button type="submit" class="btn btn-primary" disabled={isSubmitting || isDeleting}>
							{isSubmitting ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
				</div>
			</form>
		</div>
	</dialog>
{/if}
