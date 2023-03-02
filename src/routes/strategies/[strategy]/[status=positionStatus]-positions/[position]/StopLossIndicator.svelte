<script lang="ts">
	export let lg = false;

	$: size = lg ? 'lg' : 'md';
</script>

<span class="stop-loss size-{size}">stop loss</span>

<style lang="postcss">
	.stop-loss {
		display: flex;
		align-items: center;
		color: hsla(var(--hsl-bearish));
		background: hsla(var(--hsl-bearish), 0.12);
		border-radius: var(--space-sm);
		text-align: center;
		text-transform: uppercase;
	}

	.size-md {
		font: var(--f-ui-sm-bold);
		letter-spacing: var(--f-ui-sm-spacing, normal);
		padding: var(--space-ss) var(--space-md);

		@media (--viewport-sm-down) {
			font: var(--f-ui-xs-bold);
			letter-spacing: var(--f-ui-xs-spacing, normal);
			padding: var(--space-ss) var(--space-ms);
		}
	}

	.size-lg {
		font: var(--f-ui-md-bold);
		letter-spacing: var(--f-ui-md-spacing, normal);
		padding: var(--space-sm) var(--space-ml);

		@media (--viewport-sm-down) {
			font: var(--f-ui-sm-bold);
			letter-spacing: var(--f-ui-sm-spacing, normal);
			padding: var(--space-ss) var(--space-md);
		}
	}
</style>
