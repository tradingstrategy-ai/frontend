<!--

  Sveltestrap Navbar did not work with our theme, as it changes some core Bootstrap CSS rules.
  We have now in-house hacked together navbar.

-->
<script lang="ts">
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import MenuItem from '$lib/components/MenuItem.svelte';

	$: currentPage = $page.url.pathname;

	// TODO: wire search into new design-system navbar
	import Search from '$lib/search/Search.svelte';
	$: showSearch = $page.url.pathname !== '/search';
</script>

<section class="ds-container">
	<Header>
		<MenuItem label="Trading data" targetUrl="/trading-view" active={currentPage === '/trading-view'} />
		<MenuItem label="About" targetUrl="/about" active={currentPage === '/about'} />
		<MenuItem label="Documentation" targetUrl="https://tradingstrategy.ai/docs/index.html" />
		<MenuItem label="Community" targetUrl="/community" active={currentPage === '/community'} />
		<MenuItem label="Blog" targetUrl="/blog" active={currentPage === '/blog'} />
	</Header>
</section>
