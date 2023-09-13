<script lang="ts">
	export let alignValues: 'left' | 'center' | 'right' = 'left';
</script>

<div class="wallet-info" style:--wallet-info-value-align={alignValues}>
	<ul><slot /></ul>
</div>

<style lang="postcss">
	.wallet-info {
		container-type: inline-size;
		width: 100%;
		overflow: hidden;

		ul {
			display: grid;
			gap: var(--space-md);
			padding: 0;

			@container (width >= 420px) {
				gap: var(--space-sl);
				padding: var(--space-sl) 0;
			}
		}
	}
</style>
