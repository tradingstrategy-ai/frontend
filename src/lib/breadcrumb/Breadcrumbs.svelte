<!--
@component
Display breadcrumbs for a given page.

For Google breadcrumbs SEO metadata see:
https://developers.google.com/search/docs/data-types/breadcrumbs
Test at:
https://search.google.com/structured-data/testing-tool

@example

```svelte
	<Breadcrumbs labels={{ 'url-path-segment': 'Human Readable Name' }} />
```
-->
<script lang="ts">
	import { page } from '$app/stores';
	import { Section } from '$lib/components';

	type Props = {
		labels?: Record<string, string>;
		startAt?: number;
	};

	let { labels = {}, startAt = 0 }: Props = $props();

	const baseLabels: Record<string, string> = {
		about: 'About',
		backtesting: 'Historical data',
		blog: 'Blog',
		community: 'Community',
		exchanges: 'Decentralised exchanges',
		glossary: 'Trading and DeFi terminology',
		strategies: 'Trading strategies',
		tokens: 'Tokens',
		'trading-view': 'Trading data'
	};

	let breadcrumbs = $derived.by(() => {
		const segments = $page.url.pathname.split('/');
		return segments.slice(startAt + 1).map((segment, index) => ({
			href: segments.slice(0, index + startAt + 2).join('/'),
			label: labels[segment] ?? baseLabels[segment] ?? segment
		}));
	});
</script>

<Section tag="nav" ariaAttrs={{ 'aria-label': 'breadcrumb' }}>
	<ol class="breadcrumbs" itemscope itemtype="http://schema.org/BreadcrumbList">
		{#each breadcrumbs as { href, label }, index (href)}
			{@const active = index !== breadcrumbs?.length - 1}
			<li class:truncate={!active} itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem">
				{#if active}
					<a class="tile a" itemprop="item" {href} itemtype="http://schema.org/Thing">
						<span itemprop="name">{label}</span>
					</a>
				{:else}
					<span>
						<span itemprop="name">{label}</span>
					</span>
				{/if}
				<meta itemprop="position" content={String(index + 1)} />
			</li>
		{/each}
	</ol>
</Section>

<style>
	ol {
		list-style-type: none;
		padding: var(--space-sl) 0;
		display: flex;
		margin-bottom: var(--space-sl);
		margin-left: calc(-1 * var(--space-sm));
		overflow: hidden;
		color: var(--c-text-extra-light);
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

		> * {
			padding: var(--space-ss) var(--space-sm);

			&:not(:hover) {
				background: transparent;
			}
		}

		> span {
			color: var(--c-text);
		}

		&:not(:last-child)::after {
			content: '/';
		}
	}
</style>
