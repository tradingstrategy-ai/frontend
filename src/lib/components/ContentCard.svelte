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

<svelte:element this={tag} {href} class="content-card tile b">
	{#if iconName}
		<div class="symbol tile c">
			<Icon size={iconSize} name={iconName} />
		</div>
	{/if}
	{#if title || $$slots.title}
		<h3 class="title">
			<slot name="title">
				{@html title}
			</slot>
		</h3>
	{/if}
	{#if subtitle || $$slots.subtitle}
		<p class="subtitle">
			<slot name="subtitle">
				{@html subtitle}
			</slot>
		</p>
	{/if}
	{#if summaryLabel || summaryValue}
		<div class="summary">
			<div class="label">
				{summaryLabel}
			</div>
			<div class="value">
				{summaryValue}
			</div>
		</div>
	{/if}
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
			gap: var(--space-lg);
		}

		& h3,
		& p {
			margin-bottom: 0;
		}

		& p {
			font: var(--f-ui-md-roman);
		}
	}

	.content-card .symbol {
		border-radius: 100%;
		display: flex;
		padding: var(--space-ls);
		margin-bottom: var(--space-md);
		place-self: start;
	}

	.content-card .title {
		@media (--viewport-sm-up) {
			font: var(--f-heading-lg-medium) !important;
		}
	}

	.content-card .summary {
		display: grid;
		gap: var(--space-xs);

		& .label {
			color: hsl(var(--hsl-text-extra-light));
			font: var(--f-ui-sm-medium);
		}

		& .value {
			font: var(--f-ui-xl-medium);
			@media (--viewport-sm-up) {
				font: var(--f-ui-xxl-medium);
			}
		}
	}
</style>
