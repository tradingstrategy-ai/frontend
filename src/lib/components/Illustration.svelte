<script context="module" lang="ts">
	// Must use relative glob path; must be a string literal (not variable or expression).
	// See: https://v2.vitejs.dev/guide/features.html#glob-import
	const illustrations = import.meta.glob('../assets/illustrations/*.svg', {
		query: '?raw',
		import: 'default',
		eager: true
	});

	function rawSVG(name: string) {
		// Path must match glob path above.
		return illustrations[`../assets/illustrations/${name}.svg`];
	}

	const notFound = '‽';
</script>

<script lang="ts">
	export let height: string | undefined = undefined;
	export let name: string;
	export let width: string | undefined = undefined;
</script>

<div class="illustration" style:--illustration-height={height} style:--illustration-width={width}>
	{@html rawSVG(name) || notFound}
</div>

<style lang="postcss">
	div {
		display: contents;
		font-size: var(--illustration-size, var(--size, auto));
	}

	div > :global svg {
		height: var(--illustration-height);
		width: var(--illustration-height);

		> * {
			fill: currentColor;
		}
	}
</style>
