<script lang="ts">
	export let title: string;
</script>

<div class="summary-box">
	<header>
		<h2>{title}</h2>
		{#if $$slots.cta}
			<div class="cta">
				<slot name="cta" />
			</div>
		{/if}
	</header>
	<slot />
</div>

<style lang="postcss">
	.summary-box {
		display: grid;
		gap: 1rem;
		background: hsl(var(--hsla-box-1));
		border: 1px solid hsl(var(--hsla-box-3));
		border-radius: var(--radius-md);
		padding: 1.25rem;
	}

	header {
		display: grid;
		grid-auto-flow: column;
		grid-template-columns: 1fr;
		align-items: center;
		color: hsl(var(--hsl-text-ultra-light));
	}

	h2 {
		font: var(--f-heading-xs-medium);
		font-size: 1rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;

		@media (--viewport-sm-down) {
			font-size: 0.875rem;
		}
	}
</style>
