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
	export let size: string | undefined = undefined;
</script>

<div class="icon" style:--size={size}>{@html rawSVG(name) || notFound}</div>

<style lang="postcss">
	.icon {
		display: contents;
		font-size: var(--icon-size, var(--size, auto));

		:global svg {
			height: 1em;
			width: 1em;
			path {
				stroke: var(--icon-color, currentcolor);

				&.fill {
					stroke: none;
					fill: var(--icon-color, currentcolor);
				}
			}
		}
	}
</style>
