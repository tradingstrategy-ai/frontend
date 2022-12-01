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
		strategies: 'Trading strategies'
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

<nav class="ds-container" aria-label="breadcrumb">
	<ol itemscope itemtype="http://schema.org/BreadcrumbList">
		{#each breadcrumbs as breadcrumb, idx (breadcrumb.url)}
			<li itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem">
				{#if breadcrumb.activeLink}
					<a itemprop="item" href={breadcrumb.url} itemtype="http://schema.org/Thing"
						><span itemprop="name">{breadcrumb.label}</span></a
					>
				{:else}
					<span itemprop="name">{breadcrumb.label}</span>
				{/if}
				<meta itemprop="position" content={idx + 1} />
			</li>
		{/each}
	</ol>
</nav>

<style lang="postcss">
	ol {
		list-style-type: none;
		margin-bottom: 0.75rem;
		padding: 0.75rem 0;
		display: grid;
		grid-auto-flow: column;
		justify-content: start;
		overflow: hidden;
		color: var(--c-text-7-v1);
		font: var(--f-ui-xs-medium);
		letter-spacing: var(--f-ui-xs-spacing, normal);

		@media (--viewport-md-up) {
			margin-bottom: 1.25rem;
			padding-block: 1rem;
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

		&:last-child {
			overflow: hidden;
			text-overflow: ellipsis;
		}

		& a {
			&:hover span {
				text-decoration: underline;
			}

			&::after {
				content: '/';
				margin: 0 0.5em;
			}
		}

		& > span {
			color: var(--c-text-1-v1);
		}
	}
</style>
