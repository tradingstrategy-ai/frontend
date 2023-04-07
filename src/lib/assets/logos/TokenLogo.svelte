<script context="module" lang="ts">
	// Must use relative glob path; must be a string literal (not variable or expression).
	// See: https://v2.vitejs.dev/guide/features.html#glob-import
	const icons = import.meta.glob('../../../../node_modules/cryptocurrency-icons/svg/color/*.svg', {
		as: 'raw',
		eager: true
	});

	function rawSVG(name: string) {
		// Path must match glob path above.
		return icons[`../../../../node_modules/cryptocurrency-icons/svg/color/${name.toLowerCase()}.svg`];
	}

	const notFound = '‽';
</script>

<script lang="ts">
	export let name: string;
	export let size: string | undefined = undefined;
</script>

<div class="token-logo" style:--size={size}>{@html rawSVG(name.toLowerCase()) || notFound}</div>

<style lang="postcss">
	.token-logo {
		display: contents;
		font-size: var(--icon-size, var(--size, auto));

		& :global svg {
			height: 1em;
			width: 1em;
		}
	}
</style>
