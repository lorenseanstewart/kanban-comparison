<script lang="ts">
	import type { UsersList, TagsList } from '$lib/server/boards';
	import { createCard } from '$lib/board.remote';

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

	let formElement = $state<HTMLFormElement>();

	function handleClose() {
		createCard.fields.set({
			boardId: boardId,
			title: '',
			description: undefined,
			assigneeId: undefined,
			tagIds: []
		});
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
				{...createCard.enhance(async ({ form, data, submit }: any) => {
					try {
						await submit();
						form.reset();
						handleClose();
					} catch (error) {
						console.error('Failed to create card:', error);
					}
				})}
			>
				<button
					type="button"
					class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
					onclick={handleClose}
					disabled={!!createCard.pending}
				>
					✕
				</button>
				<h3 class="font-bold text-lg mb-4">Add New Card</h3>

				{#each createCard.fields.allIssues() as issue}
					<div class="alert alert-error mb-4">
						<span>{issue.message}</span>
					</div>
				{/each}

				<input {...createCard.fields.boardId.as('hidden', boardId)} />

				<div class="form-control w-full mb-4">
					<label class="label" for="add-card-title">
						<span class="label-text">Title</span>
					</label>
					<input
						{...createCard.fields.title.as('text')}
						id="add-card-title"
						class="input input-bordered w-full"
						class:input-error={(createCard.fields.title.issues() || []).length > 0}
						placeholder="Enter card title"
						required
						disabled={!!createCard.pending}
					/>
					{#each createCard.fields.title.issues() as issue}
						<div class="label">
							<span class="label-text-alt text-error">{issue.message}</span>
						</div>
					{/each}
				</div>

				<div class="form-control w-full mb-4">
					<label class="label" for="add-card-description">
						<span class="label-text">Description</span>
					</label>
					<textarea
						{...createCard.fields.description.as('text')}
						id="add-card-description"
						class="textarea textarea-bordered h-24 w-full"
						placeholder="Enter card description (optional)"
						disabled={!!createCard.pending}
					></textarea>
				</div>

				<div class="form-control w-full mb-4">
					<label class="label" for="add-card-assignee">
						<span class="label-text">Assignee</span>
					</label>
					<select
						{...createCard.fields.assigneeId.as('select')}
						id="add-card-assignee"
						class="select select-bordered w-full"
						disabled={!!createCard.pending}
					>
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
							<label
								class="tag-checkbox-label badge border-2 font-semibold cursor-pointer transition-all hover:scale-105"
								style="--tag-color: {tag.color};"
							>
								<input
									{...createCard.fields.tagIds.as('checkbox', tag.id)}
									class="sr-only"
									disabled={!!createCard.pending}
								/>
								{tag.name}
							</label>
						{/each}
					</div>
				</div>

				<div class="modal-action">
					<button
						type="button"
						class="btn btn-ghost"
						onclick={handleClose}
						disabled={!!createCard.pending}
					>
						Cancel
					</button>
					<button type="submit" class="btn btn-primary" disabled={!!createCard.pending}>
						{createCard.pending ? 'Adding...' : 'Add Card'}
					</button>
				</div>
			</form>
		</div>
	</dialog>
{/if}

<style>
	.tag-checkbox-label {
		color: var(--tag-color);
		border-color: var(--tag-color);
		background-color: transparent;
	}

	.tag-checkbox-label:has(input:checked) {
		background-color: var(--tag-color);
		color: white;
	}

	.tag-checkbox-label:has(input:disabled) {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
