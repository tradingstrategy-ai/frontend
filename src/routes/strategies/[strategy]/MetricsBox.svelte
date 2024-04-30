<script lang="ts">
	export let title = '';
</script>

<div class="summary-box">
	{#if title}
		<h2>{title}</h2>
	{/if}
	<slot />
</div>

<style lang="postcss">
	.summary-box {
		border: 1px solid var(--c-box-3);
		border-radius: var(--radius-md);
		padding: 1.25rem;
		background: var(--c-box-1);

		h2 {
			margin-bottom: 1rem;
			font: var(--f-heading-xs-medium);
			font-size: 1rem;
			letter-spacing: 0.06em;
			text-transform: uppercase;
			color: var(--c-text-ultra-light);

			@media (--viewport-sm-down) {
				font-size: 0.875rem;
			}
		}
	}
</style>
