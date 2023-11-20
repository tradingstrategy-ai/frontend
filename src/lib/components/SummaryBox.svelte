<!--
@component
Display a summary content box with title, optional subtitle and and optional CTA (using `cta` slot).
Possible `ctaPosition` values include: top, bottom, toggle (default).

#### Usage
```tsx
	<SummaryBox title="Fruits" subtitle="These are fruits that are worth trying">
		<Button slot="cta" label="Find More Fruit" href="http://example.org/fruit" />
		<DataBox label="Banana" value="Minions favorite" />
	</SummaryBox>
```
-->
<script lang="ts">
	let classes: string = '';
	export { classes as class };
	export let title = '';
	export let subtitle = '';
	export let ctaPosition: 'top' | 'bottom' | 'toggle' = 'toggle';
</script>

<div class="summary-box cta-{ctaPosition} {classes}">
	<slot name="header">
		<header>
			<h3>{title}</h3>
			{#if subtitle}
				<p>{subtitle}</p>
			{/if}
			{#if $$slots.cta}
				<div class="cta">
					<slot name="cta" position="header" />
				</div>
			{/if}
		</header>
	</slot>

	<div class="main">
		<slot />
	</div>

	<footer>
		{#if $$slots.cta}
			<div class="cta">
				<slot name="cta" position="footer" />
			</div>
		{/if}
	</footer>
</div>

<style lang="postcss">
	.summary-box {
		container-type: inline-size;
		display: grid;
		grid-template-rows: auto 1fr auto;
		background: hsl(var(--hsla-box-1));
		border-radius: var(--radius-md);
		padding: var(--space-lg) var(--space-lg);

		@media (--viewport-md-down) {
			padding: var(--space-md);
		}

		.main {
			display: grid;
			align-content: flex-start;
			gap: var(--space-ls);

			:global(p) {
				font: var(--f-ui-lg-roman);
				letter-spacing: var(--f-ui-lg-spacing, normal);
			}
		}

		:global header {
			display: grid;
			grid-template-columns: 1fr auto;
			gap: var(--space-sm) var(--space-lg);
			padding-bottom: var(--space-xxxs);
			margin-bottom: var(--space-ls);

			@media (--viewport-md-down) {
				margin-bottom: var(--space-sm);
			}

			h3 {
				align-self: center;
				font: var(--f-heading-md-medium);
				letter-spacing: var(--f-heading-md-spacing, normal);
			}

			p {
				/* grid-area: 2 / 1 / auto / span 2; */
				grid-column: 1 / span 2;
				color: hsl(var(--hsl-text-extra-light));
				font: var(--f-ui-md-medium);
				letter-spacing: var(--f-ui-md-spacing, normal);
			}
		}
	}

	/*
		CTA styles based on ctaPosition (top, bottom, toggle)
	*/

	/* default footer CTA */
	footer .cta {
		display: grid;
		margin-top: var(--space-md);

		@container (width <= 576px) {
			margin-top: var(--space-ms);
		}
	}

	/* default header CTA */
	header .cta {
		grid-column: 1 / span 2;
		display: grid;
		margin-top: var(--space-sl);
	}

	/* hide header cta when position=bottom / footer cta when position=top  */
	.cta-bottom header .cta,
	.cta-top footer .cta {
		display: none;
	}

	/* container query for wide summary box */
	@container (width > 576px) {
		/* position CTA in header first row */
		:is(.cta-toggle, .cta-top) header .cta {
			grid-area: 1 / 2;
			align-items: flex-start;
			display: flex;
			margin: 0;
		}

		/* hide footer CTA for position=toggle */
		.cta-toggle footer .cta {
			display: none;
		}
	}

	/* container query for narrow summary boxe */
	@container (width <= 576px) {
		/* hide header CTA when position=toggle (footer shown instead) */
		.cta-toggle header .cta {
			display: none;
		}
	}
</style>
