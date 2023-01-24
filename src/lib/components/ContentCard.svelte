<!--
@component
Display a card with icon, title and additional elements. The entire card is an anchor if `href`
prop is included. Typically used inside ContentCardsSection to show a responsive collection.

### Usage:
```tsx
	<ContentCard
		iconName="newspaper"
		title="Content card 1"
		subtitle="More information about the content card"
		href="/destination/page"
	/>
```
-->
<script lang="ts">
	import { Icon } from '$lib/components';
	export let href = '';
	export let iconName = '';
	export let iconSize = '1.75rem';
	export let title = '';
	export let subtitle = '';
	export let summaryLabel = '';
	export let summaryValue = '';

	$: tag = href ? 'a' : 'div';
</script>

<svelte:element this={tag} {href} class="content-card tile b" on:click>
	{#if iconName}
		<div class="symbol tile c">
			<Icon size={iconSize} name={iconName} />
		</div>
	{/if}
	{#if title}
		<h3>{@html title}</h3>
	{/if}
	{#if subtitle}
		<p>{@html subtitle}</p>
	{/if}
	<dl>
		<dt>{summaryLabel}</dt>
		<dd>{summaryValue}</dd>
	</dl>
	{#if $$slots.cta}
		<div class="cta"><slot name="cta" /></div>
	{/if}
</svelte:element>

<style lang="postcss">
	.content-card {
		display: grid;
		gap: var(--space-md);
		padding: var(--space-lg);

		@media (--viewport-xs) {
			padding: var(--space-ls);
		}

		@media (--viewport-sm-up) {
			gap: var(--space-ls);
		}

		& * {
			margin-bottom: 0;
		}

		& .symbol {
			border-radius: 100%;
			display: flex;
			padding: var(--space-ls);
			margin-bottom: var(--space-md);
			place-self: start;

			@media (--viewport-sm-up) {
				margin-bottom: var(--space-ml);
			}
		}

		/* title */
		& h3 {
			font: var(--f-heading-lg-medium);

			@media (--viewport-xs) {
				font: var(--f-heading-md-medium);
			}
		}

		/* subtitle */
		& p {
			font: var(--f-ui-lg-roman);
			letter-spacing: var(--f-ui-md-spacing, normal);

			@media (--viewport-xs) {
				font: var(--f-ui-sm-roman);
				letter-spacing: var(--f-ui-sm-spacing, normal);
			}
		}

		/* summary label/value */
		& dl {
			display: grid;
			gap: var(--space-xs);

			@media (--viewport-sm-up) {
				gap: var(--space-xs);
			}
		}

		/* summaryLabel */
		& dt {
			color: hsl(var(--hsl-text-extra-light));
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--f-ui-sm-spacing, normal);
		}

		/* summaryValue */
		& dd {
			font: var(--f-ui-xl-medium);
			letter-spacing: var(--f-ui-xl-spacing, normal);

			@media (--viewport-sm-up) {
				font: var(--f-ui-xxl-medium);
				letter-spacing: var(--f-ui-xxl-spacing, normal);
			}
		}

		/* display CTA button as hovered/focused when tile is hovered/focused */
		&:hover,
		&:focus {
			& .cta :global .button {
				background: hsla(var(--hsl-text), 1) !important;
				color: hsla(var(--hsl-text-inverted));
			}
		}

		& .cta {
			@media (--viewport-sm-down) {
				& :global .button {
					width: 100%;
				}
			}
		}
	}
</style>
