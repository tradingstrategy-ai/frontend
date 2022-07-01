<script lang="ts">
	import favicon from '$lib/assets/brand-mark.svg';
	import FontPreloadHints from './FontPreloadHints.svelte';
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" sizes="any" />
	<link rel="icon" type="image/svg+xml" href={favicon} />
	<link rel="alternate" type="application/rss+xml" title="RSS Feed for tradingstrategy.ai" href="/blog/rss.xml" />
	<FontPreloadHints />
</svelte:head>
