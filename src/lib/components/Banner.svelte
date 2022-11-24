<script lang="ts">
	export let title: string;
	export let secondary = false;
	export let maxWidth: string = 'auto';
</script>

<section class="ds-container" class:secondary style:--max-width={maxWidth}>
	<h3>{title}</h3>
	{#if $$slots.default}
		<div class="content"><slot /></div>
	{/if}
	{#if $$slots.cta}
		<div class="cta"><slot name="cta" /></div>
	{/if}
</section>

<style lang="postcss">
	section {
		gap: 2rem;
		justify-items: center;
		padding-block: 2.5rem;

		@media (--viewport-md-up) {
			gap: 3rem;
			padding-block: 5rem;
		}

		&:not(.secondary) {
			background: var(--c-background-1);
		}

		& > * {
			max-width: var(--max-width);
		}
	}

	h3 {
		@media (--viewport-md-up) {
			text-align: center;
		}
	}

	.content :global {
		& p,
		& li {
			font: var(--f-ui-xl-roman);
			letter-spacing: var(--f-ui-xl-spacing, normal);
		}

		& p:not(:first-child),
		& li {
			margin-top: 1.3em;
		}
	}

	.cta {
		display: flex;
		flex-wrap: wrap;
		gap: 2rem;
		justify-content: center;
	}
</style>
