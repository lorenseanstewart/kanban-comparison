<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import type { UsersList, TagsList } from '$lib/server/boards';

	let {
		boardId,
		users,
		tags,
		isOpen,
		onClose
	}: {
		boardId: string;
		users: UsersList;
		tags: TagsList;
		isOpen: boolean;
		onClose: () => void;
	} = $props();

	let selectedTagIds = $state(new Set<string>());
	let formElement = $state<HTMLFormElement>();
	let error = $state<string | null>(null);
	let isSubmitting = $state(false);

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
		selectedTagIds = new Set();
		error = null;
		onClose();
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
				bind:this={formElement}
				method="POST"
				action="?/createCard"
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
							formElement?.reset();
							handleClose();
							await invalidate('app:board');
						} else if (result.type === 'failure' && result.data?.error) {
							error = result.data.error;
						} else {
							error = 'Failed to create card';
						}

						update();
					};
				}}
			>
				<button
					type="button"
					class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
					onclick={handleClose}
					disabled={isSubmitting}
				>
					✕
				</button>
				<h3 class="font-bold text-lg mb-4">Add New Card</h3>

				{#if error}
					<div class="alert alert-error mb-4">
						<span>{error}</span>
					</div>
				{/if}

				<input type="hidden" name="boardId" value={boardId} />

				<div class="form-control w-full mb-4">
					<label class="label" for="add-card-title">
						<span class="label-text">Title</span>
					</label>
					<input
						type="text"
						name="title"
						id="add-card-title"
						class="input input-bordered w-full"
						placeholder="Enter card title"
						required
						disabled={isSubmitting}
					/>
				</div>

				<div class="form-control w-full mb-4">
					<label class="label" for="add-card-description">
						<span class="label-text">Description</span>
					</label>
					<textarea
						name="description"
						id="add-card-description"
						class="textarea textarea-bordered h-24 w-full"
						placeholder="Enter card description (optional)"
						disabled={isSubmitting}
					></textarea>
				</div>

				<div class="form-control w-full mb-4">
					<label class="label" for="add-card-assignee">
						<span class="label-text">Assignee</span>
					</label>
					<select name="assigneeId" id="add-card-assignee" class="select select-bordered w-full" disabled={isSubmitting}>
						<option value="">Unassigned</option>
						{#each users as user (user.id)}
							<option value={user.id}>{user.name}</option>
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
								disabled={isSubmitting}
							>
								{tag.name}
							</button>
						{/each}
					</div>
				</div>

				<div class="modal-action">
					<button type="button" class="btn btn-ghost" onclick={handleClose} disabled={isSubmitting}>
						Cancel
					</button>
					<button type="submit" class="btn btn-primary" disabled={isSubmitting}>
						{isSubmitting ? 'Adding...' : 'Add Card'}
					</button>
				</div>
			</form>
		</div>
	</dialog>
{/if}
