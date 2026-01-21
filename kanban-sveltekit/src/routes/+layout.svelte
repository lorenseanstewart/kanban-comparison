<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<!-- CSS now handled by Vite at build time instead of runtime injection -->

<div class="min-h-screen bg-base-200">
	{@render children?.()}
</div>
