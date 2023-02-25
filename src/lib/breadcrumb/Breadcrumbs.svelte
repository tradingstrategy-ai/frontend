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
	interface BreadcrumbLabels {
		[key: string]: string;
	}

	interface Breadcrumb {
		url: string;
		label: string;
		activeLink: boolean;
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
	import Section from '$lib/components/Section.svelte';
	import type { SectionSizing } from '$lib/types';

	export let labels: BreadcrumbLabels = {};
	export let size: SectionSizing = '';

	$: breadcrumbs = buildBreadcrumbs($page.url.pathname, labels);

	function buildBreadcrumbs(pagePath: string, labels: BreadcrumbLabels): Breadcrumb[] {
		const segments = pagePath.split('/');
		const allLabels = { ...baseLabels, ...labels };

		return segments.slice(1).map((segment, index) => {
			return {
				url: segments.slice(0, index + 2).join('/'),
				label: allLabels[segment] || segment,
				activeLink: index < segments.length - 2
			};
		});
	}
</script>

<Section ariaLabel="breadcrumb" class="breadcrumbs" layout="boxed" {size} nav>
	<ol itemscope itemtype="http://schema.org/BreadcrumbList">
		{#each breadcrumbs as breadcrumb, idx (breadcrumb.url)}
			<li
				class={breadcrumb.activeLink ? '' : 'truncate'}
				itemprop="itemListElement"
				itemscope
				itemtype="http://schema.org/ListItem"
			>
				{#if breadcrumb.activeLink}
					<a class="tile a" itemprop="item" href={breadcrumb.url} itemtype="http://schema.org/Thing"
						><span itemprop="name">{breadcrumb.label}</span></a
					>
				{:else}
					<span itemprop="name">
						<span>
							{breadcrumb.label}
						</span>
					</span>
				{/if}
				<meta itemprop="position" content={idx + 1} />
			</li>
			{#if breadcrumb.activeLink}
				<span class="separator">/</span>
			{/if}
		{/each}
	</ol>
</Section>

<style lang="postcss">
	:global .breadcrumbs {
		display: flex;
		margin-bottom: var(--space-sl);

		& .grid {
			display: flex;
			width: 100%;

			& nav {
				width: 100%;
			}
		}
	}

	ol {
		list-style-type: none;
		padding: var(--space-sl) 0;
		display: flex;
		justify-content: start;
		margin-left: calc(-1 * var(--space-sm));
		overflow: hidden;
		color: var(--c-text-7-v1);
		font: var(--f-ui-xs-medium);
		letter-spacing: var(--f-ui-xs-spacing, normal);

		@media (--viewport-md-up) {
			gap: var(--space-xxs);
			margin-left: calc(-1 * var(--space-sl));
			margin-bottom: var(--space-ls);
			padding-block: var(--space-md);
			font: var(--f-ui-md-medium);
			letter-spacing: var(--f-ui-md-spacing, normal);
		}

		/* required to override bootstrap theme */
		& * {
			font: inherit;
		}
	}

	li {
		white-space: nowrap;

		& > :is(a, span:not(.separator)) {
			padding: var(--space-ss) var(--space-sm);

			&:not(:hover) {
				background: transparent;
			}
		}

		& a {
			color: hsla(var(--hsl-text-extra-light));
		}

		& > span {
			color: hsla(var(--hsl-text));
		}
	}
</style>
