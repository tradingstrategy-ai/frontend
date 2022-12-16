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

<section class="summary-box {classes}">
	<header class:has-cta={$$slots.cta}>
		<h3>{title}</h3>
		{#if subtitle}
			<p>{subtitle}</p>
		{/if}
		{#if $$slots.cta}
			<div class="cta">
				<slot name="cta" />
			</div>
		{/if}
	</header>
	<div class="inner">
		<slot />
	</div>
</section>

<style lang="postcss">
	.summary-box {
		background: var(--c-background-5);
		border-radius: 1.25rem;
		padding: 1.5rem 1.5rem;

		@media (--viewport-md-down) {
			padding: 1.25rem 1rem;
		}

		& header {
			display: grid;
			gap: 0.5rem;
			margin-bottom: 0.125rem;

			& h3 {
				font: var(--f-ui-xxl-medium);

				@media (--viewport-md-down) {
					font: var(--f-ui-xl-medium);
				}
			}

			& p {
				color: var(--c-text-extra-light);
				font: var(--f-ui-md-medium);
				letter-spacing: var(--f-ui-md-spacing);
			}

			&.has-cta {
				grid-template-columns: auto 1fr;

				& h3 {
					grid-column: 1/2;
					grid-row: 1/2;
				}

				& p {
					grid-column: 1/2;
					grid-row: 2/3;
				}
			}

			& .cta {
				place-self: start end;
			}
		}

		&,
		& .inner {
			display: grid;
			gap: 1.25rem;
			place-content: start stretch;

			@media (--viewport-md-down) {
				gap: 1rem;
			}
		}

		& :global .data-box {
			background: var(--c-background-4);
		}
	}
</style>
