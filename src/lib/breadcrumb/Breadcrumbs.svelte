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
		polygon: 'Polygon',
		tokens: 'Tokens'
	};
</script>

<script lang="ts">
	import { page } from '$app/stores';

	export let labels: BreadcrumbLabels = {};

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

<nav aria-label="breadcrumb" data-testid="breadcrumb">
	<ol itemscope itemtype="http://schema.org/BreadcrumbList">
		{#each breadcrumbs as breadcrumb, idx (breadcrumb.url)}
			<li itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem">
				{#if breadcrumb.activeLink}
					<a itemprop="item" href={breadcrumb.url} itemtype="http://schema.org/Thing"
						><span itemprop="name">{breadcrumb.label}</span></a
					>
				{:else}
					<span itemprop="item" href={breadcrumb.url} itemtype="http://schema.org/Thing"
						><span itemprop="name">{breadcrumb.label}</span></span
					>
				{/if}
				<meta itemprop="position" content={idx + 1} />
			</li>
		{/each}
	</ol>
</nav>

<style>
	nav {
		width: 100%;
		overflow: hidden;
	}

	ol {
		list-style-type: none;
		margin: 0.75rem 0;
		padding: 0;
		display: grid;
		grid-auto-flow: column;
		justify-content: start;
		color: var(--c-text-2);
		font: 500 var(--fs-ui-xs);
		letter-spacing: 0.02em;
	}

	/* required to override bootstrap theme */
	ol * {
		font: inherit;
	}

	li {
		white-space: nowrap;
	}

	a:hover span {
		text-decoration: underline;
	}

	a::after {
		content: '/';
		margin: 0 0.5em;
	}

	li > span {
		color: var(--c-text-1);
	}

	/* Desktop */
	@media (--viewport-md-up) {
		ol {
			margin: 1rem 0 2rem 0;
			font: 500 var(--fs-ui-md);
			letter-spacing: 0.01em;
		}
	}
</style>
