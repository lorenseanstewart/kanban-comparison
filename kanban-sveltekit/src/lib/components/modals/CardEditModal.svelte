<script lang="ts">
	import type { BoardCard, UsersList, TagsList } from '$lib/server/boards';
	import { updateCard, deleteCard } from '$lib/board.remote';

	let {
		card,
		boardId,
		users,
		tags,
		isOpen,
		onClose
	}: {
		card: BoardCard;
		boardId: string;
		users: UsersList;
		tags: TagsList;
		isOpen: boolean;
		onClose: () => void;
	} = $props();

	const isDisabled = $derived(!!updateCard.pending || !!deleteCard.pending);

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this card?')) {
			return;
		}

		try {
			await deleteCard({ cardId: card.id, boardId });
			onClose();
		} catch (err) {
			console.error('Failed to delete card:', err);
		}
	}
</script>

{#if isOpen}
	<dialog
		class="modal modal-open !mt-0"
		onclick={(e) => {
			if (e.target === e.currentTarget) onClose();
		}}
	>
		<div class="modal-backdrop bg-black/70"></div>
		<div class="modal-box bg-base-200 dark:bg-base-300">
			<form
				{...updateCard.enhance(async ({ form, submit }: any) => {
					try {
						await submit();
						form.reset();
						onClose();
					} catch (error) {
						console.error('Failed to update card:', error);
					}
				})}
			>
				<button
					type="button"
					class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
					onclick={onClose}
					disabled={isDisabled}
				>
					✕
				</button>
				<h3 class="font-bold text-lg mb-4">Edit Card</h3>

				{#each updateCard.fields.allIssues() as issue}
					<div class="alert alert-error mb-4">
						<span>{issue.message}</span>
					</div>
				{/each}

				<input {...updateCard.fields.cardId.as('hidden', card.id)} />
				<input {...updateCard.fields.boardId.as('hidden', boardId)} />

				<div class="form-control w-full mb-4">
					<label class="label" for="edit-card-title-{card.id}">
						<span class="label-text">Title</span>
					</label>
					<input
						{...updateCard.fields.title.as('text')}
						id="edit-card-title-{card.id}"
						class="input input-bordered w-full"
						class:input-error={(updateCard.fields.title.issues() || []).length > 0}
						value={card.title}
						required
						disabled={isDisabled}
					/>
					{#each updateCard.fields.title.issues() as issue}
						<div class="label">
							<span class="label-text-alt text-error">{issue.message}</span>
						</div>
					{/each}
				</div>

				<div class="form-control w-full mb-4">
					<label class="label" for="edit-card-description-{card.id}">
						<span class="label-text">Description</span>
					</label>
					<textarea
						{...updateCard.fields.description.as('text')}
						id="edit-card-description-{card.id}"
						class="textarea textarea-bordered h-24 w-full"
						value={card.description || ''}
						disabled={isDisabled}
					></textarea>
				</div>

				<div class="form-control w-full mb-4">
					<label class="label" for="edit-card-assignee-{card.id}">
						<span class="label-text">Assignee</span>
					</label>
					<select
						{...updateCard.fields.assigneeId.as('select')}
						id="edit-card-assignee-{card.id}"
						class="select select-bordered w-full"
						disabled={isDisabled}
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
							<label
								class="tag-checkbox-label badge border-2 font-semibold cursor-pointer transition-all hover:scale-105"
								style="--tag-color: {tag.color};"
							>
								<input
									{...updateCard.fields.tagIds.as('checkbox', tag.id)}
									class="sr-only"
									disabled={isDisabled}
									checked={card.tags.some((t) => t.id === tag.id)}
								/>
								{tag.name}
							</label>
						{/each}
					</div>
				</div>

				<div class="modal-action justify-between">
					<button type="button" class="btn btn-error" onclick={handleDelete} disabled={isDisabled}>
						{deleteCard.pending ? 'Deleting...' : 'Delete Card'}
					</button>
					<div class="flex gap-2">
						<button type="button" class="btn btn-ghost" onclick={onClose} disabled={isDisabled}>
							Cancel
						</button>
						<button type="submit" class="btn btn-primary" disabled={isDisabled}>
							{updateCard.pending ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
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
