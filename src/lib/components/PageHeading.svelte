<script lang="ts">
	let classes = '';
	export { classes as class };
	export let level = 1;
	export let title = '';
	export let subtitle = '';
</script>

<header class="page-heading level-{level} {classes}">
	{@html title}
	{@html subtitle}
</header>

<style>
	.page-heading {
		padding-top: 1.25rem;
		padding-bottom: 2rem;
	}

	.level-1 :global(h1) {
		font: var(--f-heading-xl-medium);
		margin-bottom: 1rem;
	}

	.page-heading:global(p) {
		font: var(--f-ui-xl-medium);
	}

	.level-2 :global(h1) {
		color: var(--c-text-ultra-light);
		font: var(--f-heading-md-medium);
		margin: 0 0 0.5rem;
	}

	.level-2 :global(h2) {
		font: var(--f-heading-xxxl-medium);
		margin: 0;
	}

	@media all and (max-width: 767px) {
		.level-2 :global(h1) {
			font: var(--f-heading-xs-medium);
			margin: 0 0 0.75rem;
		}

		.level-2 :global(h2) {
			font: var(--f-heading-xl-medium);
		}
	}
</style>
