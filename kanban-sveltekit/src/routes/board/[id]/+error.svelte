<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="min-h-screen flex items-center justify-center bg-base-200 p-4">
	<div class="card bg-base-100 dark:bg-base-300 shadow-xl max-w-md w-full">
		<div class="card-body items-center text-center">
			{#if $page.status === 404}
				<h2 class="card-title text-error text-2xl">Board Not Found</h2>
				<p class="text-base-content/70 mt-2">
					The board you're looking for doesn't exist or has been deleted.
				</p>
			{:else}
				<h2 class="card-title text-error text-2xl">Error Loading Board</h2>
				<p class="text-base-content/70 mt-2">
					{$page.error?.message || 'An unexpected error occurred while loading the board'}
				</p>
			{/if}
			{#if $page.status}
				<div class="badge badge-error badge-outline mt-2">Error {$page.status}</div>
			{/if}
			<div class="card-actions mt-6">
				<a href="/" class="btn btn-primary">Back to Boards</a>
			</div>
		</div>
	</div>
</div>
