<script context="module" lang="ts">
	// Must use relative glob path; must be a string literal (not variable or expression).
	// See: https://v2.vitejs.dev/guide/features.html#glob-import
	const icons = import.meta.glob('../assets/icons/*.svg', { as: 'raw' });

	function rawSVG(name: string) {
		// Path must match glob path above.
		return icons[`../assets/icons/${name}.svg`];
	}
</script>

<script lang="ts">
	export let name: string;
	const notFound = '‽';
</script>

<div>{@html rawSVG(name) || notFound}</div>

<style>
	div {
		display: contents;
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
