<script lang="ts">
	export let title: MaybeString = undefined;
	export let prefix: MaybeString = undefined;
	export let description: MaybeString = undefined;

	$: hasIcon = Boolean($$slots.icon);
	$: hasPrefix = Boolean(prefix ?? $$slots.prefix);
</script>

<header class="page-heading" class:hasIcon class:hasPrefix>
	{#if hasIcon}
		<div class="icon">
			<slot name="icon" />
		</div>
	{/if}
	<div class="content">
		<h1>
			{#if hasPrefix}
				<span class="prefix">
					<slot name="prefix">{prefix}</slot>
				</span>
			{/if}
			<slot name="title">{title}</slot>
		</h1>
		{#if description}
			<p>{description}</p>
		{/if}
	</div>
	<slot name="cta" />
</header>

<style lang="postcss">
	.page-heading {
		--gap: 1rem 2rem;
		--grid-auto-flow: column;
		--padding-bottom: 2rem;
		--icon-size: 8rem;
		--prefix-font: var(--f-heading-md-medium);
		--prefix-spacing: var(--f-heading-md-spacing);
		--title-font: var(--f-heading-xl-medium);
		--title-spacing: var(--f-heading-xl-spacing);
		--title-with-prefix-font: var(--f-heading-xxxl-medium);
		--title-with-prefix-spacing: var(--f-heading-xxxl-spacing);
		--desc-font: var(--f-ui-xl-roman);
		--desc-spacing: var(--f-ui-xl-spacing);

		@media (--viewport-md-down) {
			--gap: 0.5rem 1.5rem;
			--padding-bottom: 1.5rem;
			--icon-size: 6rem;
			--prefix-font: var(--f-heading-sm-medium);
			--prefix-spacing: var(--f-heading-sm-spacing);
			--title-font: var(--f-heading-lg-medium);
			--title-spacing: var(--f-heading-lg-spacing);
			--title-with-prefix-font: var(--f-heading-xl-medium);
			--title-with-prefix-spacing: var(--f-heading-xl-spacing);
			--desc-font: var(--f-ui-lg-roman);
			--desc-spacing: var(--f-ui-lg-spacing);
		}

		@media (--viewport-xs) {
			--content-display: contents;
			--gap: 0.5rem 1rem;
			--grid-auto-flow: row;
			--padding-bottom: 1rem;
			--icon-size: 4.75rem;
			--prefix-font: var(--f-heading-xs-medium);
			--prefix-spacing: var(--f-heading-xs-spacing);
			--title-font: var(--f-heading-md-medium);
			--title-spacing: var(--f-heading-md-spacing);
			--title-with-prefix-font: var(--f-heading-lg-medium);
			--title-with-prefix-spacing: var(--f-heading-lg-spacing);
			--desc-font: var(--f-ui-md-roman);
			--desc-spacing: var(--f-ui-me-spacing);
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
		background: hsla(var(--hsla-box-1));
		border-radius: var(--icon-size);
		height: var(--icon-size);
		width: var(--icon-size);
		overflow: hidden;
		text-align: center;
	}

	.content {
		display: var(--content-display, grid);
		gap: inherit;
	}

	h1 {
		font: var(--title-font);
		letter-spacing: var(--title-spacing, normal);
		margin: 0;

		.hasPrefix & {
			font: var(--title-with-prefix-font);
			letter-spacing: var(--title-with-prefix-spacing, normal);
		}

		.prefix {
			display: block;
			color: var(--c-text-ultra-light);
			font: var(--prefix-font);
			letter-spacing: var(--prefix-spacing, normal);
			margin-bottom: var(--space-ss);

			:global a:hover {
				text-decoration: underline;
			}
		}
	}

	p {
		font: var(--desc-font);
		letter-spacing: var(--desc-spacing, normal);
		grid-column: 1/-1;
	}
</style>
