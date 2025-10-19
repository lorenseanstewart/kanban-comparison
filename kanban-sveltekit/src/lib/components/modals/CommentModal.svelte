<script lang="ts">
	import type { BoardCard, UsersList } from '$lib/server/boards';
	import { addComment } from '$lib/board.remote';

	let {
		card,
		boardId,
		users,
		isOpen,
		onClose
	}: {
		card: BoardCard;
		boardId: string;
		users: UsersList;
		isOpen: boolean;
		onClose: () => void;
	} = $props();
</script>

{#if isOpen}
	<dialog
		class="modal modal-open !mt-0"
		onclick={(e) => {
			if (e.target === e.currentTarget) onClose();
		}}
	>
		<div class="modal-backdrop bg-black/70"></div>
		<div class="modal-box bg-base-200 dark:bg-base-300 max-w-2xl">
			<button
				type="button"
				class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
				onclick={onClose}
				disabled={!!addComment.pending}
			>
				✕
			</button>

			<h3 class="font-bold text-lg mb-4">Comments</h3>

			<div class="mb-6 max-h-96 overflow-y-auto">
				{#if card.comments.length > 0}
					<div class="space-y-3">
						{#each card.comments as comment (comment.id)}
							{@const user = users.find((u) => u.id === comment.userId)}
							<div class="bg-base-100 dark:bg-base-200 rounded-lg p-4">
								<div class="flex items-center gap-2 mb-2">
									<span class="font-semibold text-base-content">
										{user?.name || 'Unknown'}
									</span>
									<span class="text-xs text-base-content/50">
										{new Date(comment.createdAt).toLocaleDateString()}
									</span>
								</div>
								<p class="text-sm text-base-content/80">{comment.text}</p>
							</div>
						{/each}
					</div>
				{:else}
					<div class="text-center py-8 text-base-content/60">
						No comments yet. Be the first to add one!
					</div>
				{/if}
			</div>

			<form
				{...addComment.enhance(async ({ form, data, submit }: any) => {
					try {
						await submit();
						form.reset();
						onClose();
					} catch (error) {
						console.error('Failed to add comment:', error);
					}
				})}
			>
				<input {...addComment.fields.cardId.as('hidden', card.id)} />
				<input {...addComment.fields.boardId.as('hidden', boardId)} />

				<div class="form-control w-full">
					<label class="label" for="comment-user-{card.id}">
						<span class="label-text">Comment as</span>
					</label>
					<select
						{...addComment.fields.userId.as('select')}
						id="comment-user-{card.id}"
						class="select select-bordered w-full"
						disabled={!!addComment.pending}
					>
						{#each users as user (user.id)}
							<option value={user.id}>{user.name}</option>
						{/each}
					</select>
				</div>

				<div class="form-control w-full mt-4">
					<label class="label" for="comment-text-{card.id}">
						<span class="label-text">Your comment</span>
					</label>
					<textarea
						{...addComment.fields.text.as('text')}
						id="comment-text-{card.id}"
						class="textarea textarea-bordered h-24 w-full"
						class:textarea-error={(addComment.fields.text.issues() || []).length > 0}
						placeholder="Write your comment..."
						required
						disabled={!!addComment.pending}
					></textarea>
					{#each addComment.fields.text.issues() as issue}
						<div class="label">
							<span class="label-text-alt text-error">{issue.message}</span>
						</div>
					{/each}
				</div>

				{#each addComment.fields.allIssues() as issue}
					<div class="alert alert-error mt-4">
						<span>{issue.message}</span>
					</div>
				{/each}

				<div class="modal-action">
					<button
						type="button"
						class="btn btn-ghost"
						onclick={onClose}
						disabled={!!addComment.pending}
					>
						Close
					</button>
					<button type="submit" class="btn btn-primary" disabled={!!addComment.pending}>
						{#if addComment.pending}
							<span class="loading loading-spinner"></span>
							Adding...
						{:else}
							Add Comment
						{/if}
					</button>
				</div>
			</form>
		</div>
	</dialog>
{/if}
