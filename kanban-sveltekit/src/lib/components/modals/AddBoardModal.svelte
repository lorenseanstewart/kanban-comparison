<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';

	let { isOpen = $bindable() }: { isOpen: boolean } = $props();

	let dialog = $state<HTMLDialogElement>();
	let formElement = $state<HTMLFormElement>();
	let error = $state<string | null>(null);
	let isSubmitting = $state(false);

	function close() {
		isOpen = false;
		error = null;
	}

	$effect(() => {
		if (isOpen && dialog) {
			dialog.showModal();
			error = null;
		} else if (dialog && !isOpen) {
			dialog.close();
		}
	});
</script>

{#if isOpen}
	<dialog
		bind:this={dialog}
		class="modal !mt-0"
		onclick={(e) => {
			if (e.target === e.currentTarget) close();
		}}
	>
		<div class="modal-backdrop bg-black/70"></div>
		<div class="modal-box bg-base-200 dark:bg-base-300">
			<form
				bind:this={formElement}
				method="POST"
				action="?/createBoard"
				use:enhance={() => {
					isSubmitting = true;
					error = null;

					return async ({ result, update }) => {
						isSubmitting = false;

						if (result.type === 'success' && result.data?.success) {
							formElement?.reset();
							close();
							await invalidate('app:boards');
						} else if (result.type === 'failure' && result.data?.error) {
							error = result.data.error;
						} else {
							error = 'Failed to create board';
						}

						update();
					};
				}}
			>
				<button
					type="button"
					class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
					onclick={close}
					disabled={isSubmitting}
				>
					✕
				</button>
				<h3 class="font-bold text-lg mb-4">Add New Board</h3>

				{#if error}
					<div class="alert alert-error mb-4">
						<span>{error}</span>
					</div>
				{/if}

				<div class="form-control w-full mb-4">
					<label class="label" for="board-title">
						<span class="label-text">Title</span>
					</label>
					<input
						id="board-title"
						type="text"
						name="title"
						class="input input-bordered w-full"
						placeholder="Enter board title"
						required
						disabled={isSubmitting}
					/>
				</div>

				<div class="form-control w-full mb-4">
					<label class="label" for="board-description">
						<span class="label-text">Description</span>
					</label>
					<textarea
						id="board-description"
						name="description"
						class="textarea textarea-bordered h-24 w-full"
						placeholder="Enter board description (optional)"
						disabled={isSubmitting}
					></textarea>
				</div>

				<div class="modal-action">
					<button type="button" class="btn btn-ghost" onclick={close} disabled={isSubmitting}> Cancel </button>
					<button type="submit" class="btn btn-primary" disabled={isSubmitting}>
						{isSubmitting ? 'Adding...' : 'Add Board'}
					</button>
				</div>
			</form>
		</div>
	</dialog>
{/if}
