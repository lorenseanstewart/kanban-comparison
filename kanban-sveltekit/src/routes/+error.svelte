<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="min-h-screen flex items-center justify-center bg-base-200 p-4">
	<div class="card bg-base-100 dark:bg-base-300 shadow-xl max-w-md w-full">
		<div class="card-body items-center text-center">
			<h2 class="card-title text-error text-2xl">Something went wrong</h2>
			<p class="text-base-content/70 mt-2">
				{$page.error?.message || 'An unexpected error occurred'}
			</p>
			{#if $page.status}
				<div class="badge badge-error badge-outline mt-2">Error {$page.status}</div>
			{/if}
			<div class="card-actions mt-6">
				<a href="/" class="btn btn-primary">Back to Home</a>
			</div>
		</div>
	</div>
</div>
