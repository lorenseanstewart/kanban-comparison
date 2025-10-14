<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import type { BoardCard, UsersList } from '$lib/server/boards';

	let {
		card,
		users,
		isOpen,
		onClose
	}: {
		card: BoardCard;
		users: UsersList;
		isOpen: boolean;
		onClose: () => void;
	} = $props();

	let selectedUserId = $state(users[0]?.id || '');
	let error = $state<string | null>(null);
	let isSubmitting = $state(false);

	function handleClose() {
		error = null;
		selectedUserId = users[0]?.id || '';
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
		<div class="modal-box bg-base-200 dark:bg-base-300 max-w-2xl">
			<button
				type="button"
				class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
				onclick={handleClose}
				disabled={isSubmitting}
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
				method="POST"
				action="?/addComment"
				use:enhance={({ formData }) => {
					isSubmitting = true;
					error = null;

					return async ({ result, update }) => {
						isSubmitting = false;

						if (result.type === 'success' && result.data?.success) {
							const textarea = document.getElementById(`comment-text-${card.id}`) as HTMLTextAreaElement | null;
							textarea?.form?.reset();
							await invalidate('app:board');
							handleClose();
						} else if (result.type === 'failure' && result.data?.error) {
							error = result.data.error;
						} else {
							error = 'Failed to add comment';
						}

						update();
					};
				}}
			>
				<input type="hidden" name="cardId" value={card.id} />

				<div class="form-control w-full">
					<label class="label" for="comment-user-{card.id}">
						<span class="label-text">Comment as</span>
					</label>
					<select
						name="userId"
						id="comment-user-{card.id}"
						class="select select-bordered w-full"
						bind:value={selectedUserId}
						disabled={isSubmitting}
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
						name="text"
						id="comment-text-{card.id}"
						class="textarea textarea-bordered h-24 w-full"
						placeholder="Write your comment..."
						required
						disabled={isSubmitting}
					></textarea>
				</div>

				{#if error}
					<div class="alert alert-error mt-4">
						<span>{error}</span>
					</div>
				{/if}

				<div class="modal-action">
					<button type="button" class="btn btn-ghost" onclick={handleClose} disabled={isSubmitting}>
						Close
					</button>
					<button type="submit" class="btn btn-primary" disabled={isSubmitting}>
						{#if isSubmitting}
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
