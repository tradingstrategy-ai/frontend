<script lang="ts">
	export let title: string;
	export let maxWidth: string = 'auto';
</script>

<section class="ds-container" style:--max-width={maxWidth}>
	<h3>{title}</h3>
	<div class="content"><slot /></div>
	<div class="cta"><slot name="cta" /></div>
</section>

<style>
	section {
		grid-template-columns: auto;
		gap: 2rem;
		justify-items: center;
		padding-top: 2.5rem;
		padding-bottom: 2.5rem;
		background-color: var(--c-background-1);
	}

	section > * {
		max-width: var(--max-width);
	}

	.content :global ul {
		margin: 0;
	}

	.content :global li {
		text-align: left;
	}

	.content :global p,
	.content :global li {
		font: 400 var(--fs-ui-xl);
	}

	.content :global p:not(:first-child),
	.content :global li {
		margin-top: 1.3em;
	}

	@media (--viewport-md-up) {
		section {
			gap: 3rem;
			padding-top: 5rem;
			padding-bottom: 5rem;
		}

		h3 {
			text-align: center;
		}
	}
</style>
