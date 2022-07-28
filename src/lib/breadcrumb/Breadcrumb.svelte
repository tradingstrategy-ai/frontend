<!--
@component
Display breadcrumbs in the page header. See breadcrumb/builder.ts for data structure.

For Google breadcrumbs SEO metadata see:
https://developers.google.com/search/docs/data-types/breadcrumbs
Test at:
https://search.google.com/structured-data/testing-tool

#### Usage 
```tsx
	<Breadcrumb breadcrumbs={[...]} />
```
-->
<script lang="ts">
	export let breadcrumbs = [];

	function activeLink(breadcrumb, position) {
		return position < breadcrumbs.length && breadcrumb.url;
	}
</script>

<nav aria-label="breadcrumb" data-testid="breadcrumb">
	<ol itemscope itemtype="http://schema.org/BreadcrumbList">
		{#each breadcrumbs as breadcrumb, idx (breadcrumb.url)}
			{@const position = idx + 1}
			<li itemprop="itemListElement" itemscope itemtype="http://schema.org/ListItem">
				{#if activeLink(breadcrumb, position)}
					<a itemprop="item" href={breadcrumb.url} itemtype="http://schema.org/Thing">
						<span itemprop="name">
							{breadcrumb.name}
						</span>
					</a>
				{:else}
					<span itemprop="item" href={breadcrumb.url} itemtype="http://schema.org/Thing">
						<span itemprop="name">
							{breadcrumb.name}
						</span>
					</span>
				{/if}
				<meta itemprop="position" content={position} />
			</li>
		{/each}
	</ol>
</nav>

<style>
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
	@media (min-width: 768px) {
		ol {
			margin: 1rem 0 2rem 0;
			font: 500 var(--fs-ui-md);
			letter-spacing: 0.01em;
		}
	}
</style>
