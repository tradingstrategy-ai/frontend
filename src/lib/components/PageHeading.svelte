<script>
	export let title = '';
	export let subtitle = '';
</script>

<header class="page-heading">
	{@html title}
	{@html subtitle}
</header>

<style>
	.page-heading {
		padding: 1.25rem 0 2rem;
	}

	.page-heading :global(h1) {
		font: var(--fs-heading-xl);
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.page-heading :global(p) {
		font: var(--fs-ui-xl);
	}
</style>
