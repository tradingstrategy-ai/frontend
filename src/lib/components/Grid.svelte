<script lang="ts">
	export let cols = 1;
	export let gap: '' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' = '';
</script>

<div class="grid cols-{cols}" style={gap ? `--grid-gap: var(--space-${gap});` : null}>
	<slot />
</div>

<style lang="postcss">
	.grid {
		display: grid;
		gap: var(--grid-gap);
	}

	.cols-2 {
		@media (--viewport-md-up) {
			grid-template-columns: 1fr 1fr;
		}
	}

	.cols-3 {
		@media (--viewport-lg-up) {
			grid-template-columns: 1fr 1fr 1fr;
		}
	}

	.cols-4 {
		@media (--viewport-lg-up) {
			grid-template-columns: 1fr 1fr;
		}
		@media (--viewport-xl-up) {
			grid-template-columns: 1fr 1fr 1fr 1fr;
		}
	}
</style>
