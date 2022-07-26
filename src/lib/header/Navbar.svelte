<script lang="ts">
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import MenuItem from '$lib/components/MenuItem.svelte';
	import Search from '$lib/search/Search.svelte';

	$: currentPage = $page.url.pathname;
	$: showSearch = $page.url.pathname !== '/search';
</script>

<section class="ds-container">
	<Header>
		<svelte:fragment slot="menu">
			<MenuItem label="Trading data" targetUrl="/trading-view" active={currentPage === '/trading-view'} />
			<MenuItem label="About" targetUrl="/about" active={currentPage === '/about'} />
			<MenuItem label="Documentation" targetUrl="https://tradingstrategy.ai/docs/index.html" />
			<MenuItem label="Community" targetUrl="/community" active={currentPage === '/community'} />
			<MenuItem label="Blog" targetUrl="/blog" active={currentPage === '/blog'} />
		</svelte:fragment>

		<svelte:fragment slot="search">
			{#if showSearch}<Search />{/if}
		</svelte:fragment>
	</Header>
</section>
