<script lang="ts">
	import appCss from '../app.css?inline';

	let { children } = $props();
</script>

<svelte:head>
	{@html `<style>${appCss}</style>`}
</svelte:head>

<div class="min-h-screen bg-base-200">
	{@render children?.()}
</div>
