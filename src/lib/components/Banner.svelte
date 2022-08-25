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

<style>
	section {
		gap: 2rem;
		justify-items: center;
		padding-block: 2.5rem;
	}

	section:not(.secondary) {
		background: var(--c-background-1);
	}

	section > * {
		max-width: var(--max-width);
	}

	.content :global p,
	.content :global li {
		font: 400 var(--fs-ui-xl);
	}

	.content :global p:not(:first-child),
	.content :global li {
		margin-top: 1.3em;
	}

	.cta {
		display: flex;
		flex-wrap: wrap;
		gap: 2rem;
		justify-content: center;
	}

	@media (--viewport-md-up) {
		section {
			gap: 3rem;
			padding-block: 5rem;
		}

		h3 {
			text-align: center;
		}
	}
</style>
