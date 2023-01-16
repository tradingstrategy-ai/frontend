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

<div class="summary-box {classes}" class:has-both-ctas={$$slots.footerCta && $$slots.headerCta}>
	<div class="main">
		<header class:has-cta={$$slots.headerCta || $$slots.cta}>
			<div class="description">
				<h3>{title}</h3>
				{#if subtitle}
					<p>{subtitle}</p>
				{/if}
			</div>
			{#if $$slots.headerCta}
				<div class="cta">
					<slot name="headerCta" />
				</div>
			{:else if $$slots.cta}
				<div class="cta">
					<slot name="cta" />
				</div>
			{/if}
		</header>
		<div class="inner">
			<slot />
		</div>
	</div>
	{#if $$slots.footerCta || $$slots.cta || $$slots.footer}
		<footer>
			<slot name="footer" />
			{#if $$slots.footerCta}
				<div class="cta">
					<slot name="footerCta" />
				</div>
			{:else if $$slots.cta}
				<div class="cta">
					<slot name="cta" />
				</div>
			{/if}
		</footer>
	{/if}
</div>

<style lang="postcss">
	.summary-box {
		background: hsla(var(--hsl-box), var(--a-box-a));
		border-radius: var(--radius-md);
		padding: var(--space-lg) var(--space-lg);
		@media (--viewport-md-down) {
			padding: var(--space-ls) var(--space-md);
		}

		&.has-both-ctas {
			@media (--viewport-xl-up) {
				& footer {
					display: none;
				}
			}
		}

		& .main {
			gap: var(--space-ls);
		}

		&,
		& .main,
		& .inner {
			display: grid;
			place-content: space-between stretch;
		}

		& .description {
			display: grid;
			gap: var(--space-sm);
		}

		& header {
			display: grid;
			gap: var(--space-ss);
			margin-bottom: var(--space-xxxs);

			& h3 {
				font: var(--f-heading-md-medium);
				letter-spacing: var(--f-ui-md-spacing, normal);
			}

			& p {
				color: hsla(var(--hsl-text-extra-light));
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

		& .inner :global {
			gap: var(--inner-gap, var(--space-ls));
			padding: var(--inner-padding);

			& p,
			& li {
				font: var(--f-ui-lg-roman);
			}

			& li {
				margin-bottom: var(--space-md);
			}
		}

		& footer {
			margin-top: var(--space-md);

			& .cta :global {
				& .button {
					width: 100%;
				}
			}
		}
	}
	h3 {
		font: var(--f-ui-xxl-medium);
	}
</style>
