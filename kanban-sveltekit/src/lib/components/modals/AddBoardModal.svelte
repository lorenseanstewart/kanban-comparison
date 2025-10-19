<script lang="ts">
	import { addBoard, getBoards } from './boards.remote';

	let dialog: HTMLDialogElement;

	function close() {
		dialog.close();
	}

	const { title, description } = addBoard.fields;
</script>

<div class="flex justify-end">
	<button class="btn btn-primary" onclick={() => dialog.showModal()}>
		Add Board
	</button>
</div>

<dialog
	bind:this={dialog}
	class="modal !mt-0"
	onclick={(e) => {
		if (e.target === e.currentTarget) dialog.close();
	}}
>
	<div class="modal-box bg-base-200 dark:bg-base-300">
		<button
			type="button"
			class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
			onclick={close}
			disabled={!!addBoard.pending}
		>
			✕
		</button>
		<form
			{...addBoard.enhance(async ({ form, submit }) => {
				await submit();
				close();
				form.reset();
			})}
		>
			<h3 class="font-bold text-lg mb-4">Add New Board</h3>

			{#if addBoard.fields.issues()}
				<div class="alert alert-error mb-4">
					{#each addBoard.fields.issues() as issue}
						<span>{issue}</span>
					{/each}
				</div>
			{/if}

			<div class="form-control w-full mb-4">
				<label class="label" for="board-title">
					<span class="label-text">Title</span>
				</label>
				<input
					id="board-title"
					{...title.as('text')}
					class="input input-bordered w-full"
					placeholder="Enter board title"
					required
					disabled={!!addBoard.pending}
				/>
			</div>

			<div class="form-control w-full mb-4">
				<label class="label" for="board-description">
					<span class="label-text">Description</span>
				</label>
				<textarea
					id="board-description"
					{...description.as('text')}
					class="textarea textarea-bordered h-24 w-full"
					placeholder="Enter board description (optional)"
					disabled={!!addBoard.pending}
				></textarea>
			</div>

			<div class="modal-action">
				<button
					type="button"
					class="btn btn-ghost"
					onclick={close}
					disabled={!!addBoard.pending}
				>
					Cancel
				</button>
				<button
					type="submit"
					class="btn btn-primary"
					disabled={!!addBoard.pending}
				>
					{!!addBoard.pending ? 'Adding...' : 'Add Board'}
				</button>
			</div>
		</form>
	</div>
</dialog>
