<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
	};

	let { children }: Props = $props();
</script>

<div class="series-content">
	{@render children()}
</div>

<style>
	.series-content {
		position: absolute;
		inset: 0;
		z-index: 2;
		pointer-events: none;
	}
</style>
