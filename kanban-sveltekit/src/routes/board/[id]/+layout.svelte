<script lang="ts">
	import BoardOverview from '$lib/components/BoardOverview.svelte';
	import { isHttpError } from '@sveltejs/kit';

	let { children } = $props();
</script>

<svelte:boundary>
	{#snippet failed(error: unknown)}
		<div class="w-full p-8 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
			<div class="alert alert-error">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="stroke-current shrink-0 h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<span>Error: {isHttpError(error) ? error.body.message : 'Internal error'}</span>
			</div>
		</div>
	{/snippet}

	{@render children()}

	{#snippet pending()}
		<main class="w-full p-8 space-y-10 rounded-3xl bg-base-100 dark:bg-base-200 shadow-xl">
			<div class="breadcrumbs text-sm">
				<ul>
					<li>
						<a href="/" class="link link-hover">Boards</a>
					</li>
					<li>
						<span class="text-base-content/60">...</span>
					</li>
				</ul>
			</div>

			<div class="space-y-8">
				<BoardOverview data={{ description: '...', id: '', lists: [], title: '' }} />

				<div class="flex justify-start mb-4"></div>

				<section class="flex gap-7 overflow-x-auto pb-8 relative">
					{#each Array(3) as _}
						<article
							class="card bg-base-200 dark:bg-base-300 min-w-[20rem] h-[20rem] shadow-xl"
						></article>
					{/each}
				</section>
			</div>
		</main>
	{/snippet}
</svelte:boundary>
