<!--
@component
Displaying a summary content box with title, optional subtitle and and optional header/footer.
CTA slots `headerCta` and `footerCta` may also be provided (if both, only one is displayed
based on viewport size).

#### Usage
```tsx
	<SummaryBox title="Fruits" subtitle="These are fruits that are worth trying">
		<DataBox label="Banana" value="Minions favorite" />
		<Button slot="footerCta" label="Find More Fruit" href="http://example.org/fruit" />
	</SummaryBox>
```
-->
<script lang="ts">
	let classes: string = '';
	export { classes as class };
	export let title: string;
	export let subtitle: string = '';
</script>

<div
	class="summary-box {classes}"
	class:has-footer={$$slots.footer}
	class:has-both-ctas={$$slots.footerCta && $$slots.headerCta}
>
	<div class="main">
		<header class:has-cta={$$slots.headerCta}>
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
			{/if}
		</header>
		<div class="inner">
			<slot />
		</div>
	</div>
	{#if $$slots.footer || $$slots.footerCta}
		<footer>
			<slot name="footer" />
			{#if $$slots.footerCta}
				<div class="cta">
					<slot name="footerCta" />
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
			padding: var(--space-md);
		}

		& .main {
			gap: var(--space-ls);

			@media (--viewport-md-down) {
				gap: var(--space-sm);
			}
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
				letter-spacing: var(--f-heading-md-spacing, normal);
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

		& .inner {
			gap: var(--inner-gap, var(--space-ls));
			padding: var(--inner-padding);

			& :global(p) {
				font: var(--f-ui-lg-roman);
				letter-spacing: var(--f-ui-lg-spacing, normal);
			}
		}

		& footer {
			margin-top: var(--space-md);
			@media (--viewport-md-down) {
				margin-top: var(--space-ms);
			}

			& .cta :global .button {
				width: 100%;
			}
		}

		/*
		  Hide footer CTA when header CTA is visible (i.e., on larger displays).
			- hides the whole footer when there's no other footer content
			- hides just the footer CTA when other footer content is present
		 */
		&.has-both-ctas {
			&:not(.has-footer) footer,
			&.has-footer footer .cta {
				@media (--viewport-xl-up) {
					display: none;
				}
			}
		}
	}
</style>
