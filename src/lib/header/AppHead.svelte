<!--
@component
Site-wide `<head>` entries: the canonical URL, favicons, the RSS feed link and the optional
robots directive.

Every page gets exactly one `<link rel="canonical">`: origin + pathname with no query string,
so parameterised views (`?timeBucket=`, table sort / paging params, …) resolve to one
indexable URL. Page loaders adjust it through `page.data`:

- `lowercaseCanonical: true` — for routes keyed by EVM addresses accepted in any casing
- `canonical: '/path?x=y'` — full override (path or absolute URL) when the query string is
  part of the page identity, e.g. vault comparisons
- `robots: 'noindex,follow'` — keep the page out of search engine indexes

All follow `page.data`, so they update on client-side navigation.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { getCanonicalUrl } from '$lib/helpers/canonical';
	import favicon from '$lib/assets/brand-mark.svg';

	let canonical = $derived(
		page.data.canonical
			? new URL(page.data.canonical, page.url.origin).href
			: getCanonicalUrl(page.url, { lowercasePath: page.data.lowercaseCanonical })
	);
</script>

<svelte:head>
	<link rel="canonical" href={canonical} />
	{#if page.data.robots}
		<meta name="robots" content={page.data.robots} />
	{/if}
	<link rel="icon" href="/favicon.ico" sizes="any" />
	<link rel="icon" type="image/svg+xml" href={favicon} />
	<link rel="alternate" type="application/rss+xml" title="RSS Feed for tradingstrategy.ai" href="/blog/rss.xml" />
</svelte:head>
