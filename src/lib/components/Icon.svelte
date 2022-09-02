<script context="module" lang="ts">
	// Must use relative glob path; must be a string literal (not variable or expression).
	// See: https://v2.vitejs.dev/guide/features.html#glob-import
	const icons = import.meta.glob('../assets/icons/*.svg', { as: 'raw', eager: true });

	function rawSVG(name: string) {
		// Path must match glob path above.
		return icons[`../assets/icons/${name}.svg`];
	}

	const notFound = '‽';
</script>

<script lang="ts">
	export let name: string;
	export let size: string = undefined;
</script>

<div style:--size={size}>{@html rawSVG(name) || notFound}</div>

<style>
	div {
		display: contents;
		font-size: var(--icon-size, var(--size, auto));
	}

	div > :global(svg) {
		width: 1em;
		height: 1em;
	}

	div :global(.fill) {
		fill: currentcolor;
	}

	div :global(.stroke) {
		stroke: currentcolor;
	}
</style>
