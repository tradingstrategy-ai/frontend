<!--
@component
Site-wide `<head>` entries: favicons, the RSS feed link and the optional robots directive.

A page loader can return `robots: 'noindex,follow'` (or any robots content) to keep that
page out of search engine indexes; the tag follows `page.data`, so it updates on
client-side navigation.
-->
<script lang="ts">
	import { page } from '$app/state';
	import favicon from '$lib/assets/brand-mark.svg';
</script>

<svelte:head>
	{#if page.data.robots}
		<meta name="robots" content={page.data.robots} />
	{/if}
	<link rel="icon" href="/favicon.ico" sizes="any" />
	<link rel="icon" type="image/svg+xml" href={favicon} />
	<link rel="alternate" type="application/rss+xml" title="RSS Feed for tradingstrategy.ai" href="/blog/rss.xml" />
</svelte:head>
