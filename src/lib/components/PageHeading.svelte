<script lang="ts">
	export let title: MaybeString = undefined;
	export let prefix: MaybeString = undefined;
	export let description: MaybeString = undefined;

	$: hasIcon = Boolean($$slots.icon);
</script>

<header class="page-heading" class:hasIcon>
	{#if hasIcon}
		<div class="icon">
			<slot name="icon" />
		</div>
	{/if}
	<div class="content">
		<h1>
			{#if prefix || $$slots.prefix}
				<span class="prefix">
					<slot name="prefix">{prefix}</slot>
				</span>
			{/if}
			<slot name="title">{title}</slot>
		</h1>
		{#if description}
			<p class="description">{description}</p>
		{/if}
	</div>
	<slot name="cta" />
</header>

<style lang="postcss">
	.page-heading {
		--gap: 0.625rem 1.25rem;
		--grid-auto-flow: column;
		--padding-bottom: 2rem;
		--icon-size: 6rem;
		--title-font: var(--f-heading-xxl-medium);
		--title-spacing: var(--f-heading-xxl-spacing);
		--secondary-font: var(--f-ui-lg-medium);
		--secondary-spacing: var(--f-ui-lg-spacing);

		@media (--viewport-md-down) {
			--gap: 0.5rem 1rem;
			--padding-bottom: 1.5rem;
			--icon-size: 5rem;
			--title-font: var(--f-heading-xl-medium);
			--title-spacing: var(--f-heading-xl-spacing);
			--secondary-font: var(--f-ui-md-medium);
			--secondary-spacing: var(--f-ui-md-spacing);
		}

		@media (--viewport-xs) {
			--content-display: contents;
			--gap: 0.5rem 1rem;
			--grid-auto-flow: row;
			--padding-bottom: 1rem;
			--icon-size: 4.5rem;
			--title-font: var(--f-heading-lg-medium);
			--title-spacing: var(--f-heading-lg-spacing);
			--secondary-font: var(--f-ui-md-medium);
			--secondary-spacing: var(--f-ui-md-spacing);
		}

		display: grid;
		grid-template-columns: 1fr;
		grid-auto-flow: var(--grid-auto-flow);
		gap: var(--gap);
		align-items: center;
		padding-bottom: var(--padding-bottom);

		&.hasIcon {
			grid-template-columns: auto 1fr;
		}
	}

	.icon {
		background: var(--c-box-1);
		border-radius: 100%;
		height: var(--icon-size);
		width: var(--icon-size);
		overflow: hidden;
		text-align: center;

		:global(:is(object, img)) {
			height: inherit;
			width: inherit;
		}
	}

	.content {
		display: var(--content-display, grid);
		gap: inherit;
	}

	h1 {
		display: grid;
		gap: inherit;
		font: var(--title-font);
		letter-spacing: var(--title-spacing, normal);
		margin: 0;
	}

	:is(.prefix, .description) {
		font: var(--secondary-font);
		letter-spacing: var(--secondary-spacing, normal);
		color: var(--c-text-extra-light);
	}

	.prefix :global(a:hover) {
		text-decoration: underline;
	}

	.description {
		grid-column: 1/-1;
	}
</style>
