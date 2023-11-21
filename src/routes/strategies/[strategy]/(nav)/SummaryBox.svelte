<script lang="ts">
	export let title: string;
</script>

<div class="summary-box">
	<h2>{title}</h2>
	<slot />
</div>

<style lang="postcss">
	.summary-box {
		display: grid;
		gap: 1rem;
		background: hsl(var(--hsla-box-1));
		border-radius: var(--radius-md);
		padding: 1.25rem;
	}

	h2 {
		font: var(--f-heading-xs-medium);
		font-size: 1rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: hsl(var(--hsl-text-ultra-light));

		@media (--viewport-sm-down) {
			font-size: 0.875rem;
		}
	}
</style>
