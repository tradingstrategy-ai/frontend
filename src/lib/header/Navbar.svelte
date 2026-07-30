<!--
@component
Primary site navigation and the site-wide vault search entry point.
-->
<script lang="ts">
	import { page } from '$app/state';
	import { Header, MenuItem, Section } from '$lib/components';
	import Search from '$lib/search/components/Search.svelte';

	let currentPage = $derived(page.url.pathname);
</script>

<Section tag="header">
	<div class="nav-bar" style:overflow="visible">
		{#snippet menu()}
			<MenuItem label="Top vaults" targetUrl="/vaults" active={currentPage === '/vaults'} />
			<MenuItem label="Our vaults" targetUrl="/strategies" active={currentPage === '/strategies'} />
			<MenuItem label="API" targetUrl="/vaults/api" active={currentPage === '/vaults/api'} />
			<MenuItem label="Pricing" targetUrl="/pricing" active={currentPage === '/pricing'} />
			<MenuItem label="Community" targetUrl="/community" active={currentPage === '/community'} />
			<MenuItem label="Blog" targetUrl="/blog" active={currentPage === '/blog'} />
		{/snippet}

		{#snippet search(menu: boolean, onNavigate: () => void)}
			<Search {menu} {onNavigate} />
		{/snippet}

		<Header {menu} {search} />
	</div>
</Section>
