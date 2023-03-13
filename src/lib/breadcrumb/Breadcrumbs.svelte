<!--
@component
Display breadcrumbs for a given page.

For Google breadcrumbs SEO metadata see:
https://developers.google.com/search/docs/data-types/breadcrumbs
Test at:
https://search.google.com/structured-data/testing-tool

#### Usage 
```tsx
	<Breadcrumbs labels={{ 'url-path-segment': 'Human Readable Name' }} />
```
-->
<script context="module" lang="ts">
	type BreadcrumbLabels = Record<string, string>;

	interface Breadcrumb {
		url: string;
		label: string;
	}

	const baseLabels: BreadcrumbLabels = {
		'trading-view': 'Trading data',
		backtesting: 'Historical data',
		exchanges: 'Decentralised exchanges',
		community: 'Community',
		blog: 'Blog',
		about: 'About',
		ethereum: 'Ethereum',
		bsc: 'BNB Chain',
		binance: 'BNB Chain',
		avalanche: 'Avalanche C-chain',
		polygon: 'Polygon',
		tokens: 'Tokens',
		strategies: 'Trading strategies',
		glossary: 'Trading and DeFi terminology'
	};
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import { Section } from '$lib/components';

	export let labels: BreadcrumbLabels = {};

	$: breadcrumbs = buildBreadcrumbs($page.url.pathname, labels);

	function buildBreadcrumbs(pagePath: string, labels: BreadcrumbLabels): Breadcrumb[] {
		const segments = pagePath.split('/');
		const allLabels = { ...baseLabels, ...labels };

		return segments.slice(1).map((segment, index) => {
			return {
				url: segments.slice(0, index + 2).join('/'),
				label: allLabels[segment] || segment
			};
		});
	}
</script>

<Section tag="nav" ariaAttrs={{ 'aria-label': 'breadcrumb' }}>
	<ol class="breadcrumbs" itemscope itemtype="http://schema.org/BreadcrumbList">
		{#each breadcrumbs as breadcrumb, index (breadcrumb.url)}
			{@const active = breadcrumb !== breadcrumbs.at(-1)}
			<li class:truncate={!active} itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem">
				{#if active}
					<a class="tile a" itemprop="item" href={breadcrumb.url} itemtype="http://schema.org/Thing">
						<span itemprop="name">{breadcrumb.label}</span>
					</a>
				{:else}
					<span>
						<span itemprop="name">{breadcrumb.label}</span>
					</span>
				{/if}
				<meta itemprop="position" content={index + 1} />
			</li>
		{/each}
	</ol>
</Section>

<style lang="postcss">
	ol {
		list-style-type: none;
		padding: var(--space-sl) 0;
		display: flex;
		margin-bottom: var(--space-sl);
		margin-left: calc(-1 * var(--space-sm));
		overflow: hidden;
		color: hsla(var(--hsl-text-extra-light));
		font: var(--f-ui-xs-medium);
		letter-spacing: var(--f-ui-xs-spacing, normal);

		@media (--viewport-md-up) {
			gap: var(--space-xxs);
			margin-left: calc(-1 * var(--space-sl));
			margin-bottom: var(--space-xl);
			padding-block: var(--space-md);
			font: var(--f-ui-md-medium);
			letter-spacing: var(--f-ui-md-spacing, normal);
		}
	}

	li {
		white-space: nowrap;

		& > * {
			padding: var(--space-ss) var(--space-sm);

			&:not(:hover) {
				background: transparent;
			}
		}

		& > span {
			color: hsla(var(--hsl-text));
		}

		&:not(:last-child)::after {
			content: '/';
		}
	}
</style>
