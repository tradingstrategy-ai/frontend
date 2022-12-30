<!--
@component
Uses together with DataBox to display a set of summary properties / statistics.
Supports optional "cta" slot to include a button CTA.

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
	export let title: string;
	export let subtitle: string = '';
</script>

<div class="summary-box {classes}">
	<header class:has-cta={$$slots.cta}>
		<div class="description">
			<h3>{title}</h3>
			{#if subtitle}
				<p>{subtitle}</p>
			{/if}
		</div>
		{#if $$slots.cta}
			<div class="cta">
				<slot name="cta" />
			</div>
		{/if}
	</header>
	<div class="inner">
		<slot />
	</div>
	{#if $$slots.cta || $$slots.footer}
		<footer>
			<slot name="footer" />
			<div class="cta">
				<slot name="cta" />
			</div>
		</footer>
	{/if}
</div>

<style lang="postcss">
	.summary-box {
		background: hsla(var(--hsl-v2-box), var(--a-v2-box-b));
		border-radius: var(--radius-md);
		gap: var(--space-ls);
		padding: var(--space-lg) var(--space-lg);

		&,
		& .inner {
			display: grid;
			place-content: start stretch;
		}

		& .description {
			display: grid;
			gap: var(--space-sm);
		}

		& :global .data-box {
			background: var(--c-background-4);
		}

		@media (--viewport-md-down) {
			padding: var(--space-ls) var(--space-md);
		}

		& header {
			display: grid;
			gap: var(--space-ss);
			margin-bottom: var(--space-xxxs);

			& h3 {
				font: var(--f-ui-xxl-medium);
				letter-spacing: var(--f-ui-xxl-spacing, normal);

				@media (--viewport-md-down) {
					font: var(--f-ui-xl-medium);
					letter-spacing: var(--f-ui-xl-spacing, normal);
				}
			}

			& p {
				color: var(--c-text-extra-light);
				font: var(--f-ui-md-medium);
				letter-spacing: var(--f-ui-md-spacing, normal);
			}

			&.has-cta {
				@media (--viewport-md-up) {
					grid-template-columns: 1fr auto;

					& h3 {
						grid-column: 1/2;
					}

					& p {
						grid-column: 1/3;
					}
				}

				@media (--viewport-md-down) {
					& :global(.button) {
						margin: var(--space-sl) 0 0;
						width: 100%;
					}
				}
			}

			& .cta {
				@media (--viewport-lg-down) {
					display: none;
				}
			}
		}

		& .inner {
			gap: var(--inner-gap, var(--space-ls));
			padding: var(--inner-padding);
		}

		& footer {
			& .cta :global {
				@media (--viewport-xl-up) {
					display: none;
				}

				& .button {
					width: 100%;
				}
			}
		}
	}
	h3 {
		font: var(--f-ui-xxl-medium);

		&,
		& .inner {
			display: grid;
			gap: var(--space-ls);
			place-content: start stretch;

			@media (--viewport-md-down) {
				gap: var(--space-md);
			}
		}
	}
</style>
