<script lang="ts">
	import svg from '$lib/assets/logo-horizontal.svg?raw';
</script>

<div>
	{@html svg}
</div>

<style>
	div {
		display: contents;
	}

	div :global(svg) {
		width: var(--logo-width, auto);
		height: var(--logo-height, auto);
	}

	div :global(.logotype) {
		fill: var(--c-logotype);
	}
</style>
