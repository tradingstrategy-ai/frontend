<script lang="ts">
	import { page } from '$app/stores';
	import { Header, MenuItem, Section } from '$lib/components';
	import Search from '$lib/search/components/Search.svelte';

	$: currentPage = $page.url.pathname;
	$: showSearch = $page.url.pathname !== '/search';
</script>

<Section tag="header">
	<div class="nav-bar" style:overflow="visible">
		<Header>
			<svelte:fragment slot="menu">
				<MenuItem label="Strategies" targetUrl="/strategies" active={currentPage === '/strategies'} />
				<MenuItem label="Vaults" targetUrl="/trading-view/vaults" active={currentPage === '/trading-view/vaults'} />
				<MenuItem label="Data" targetUrl="/trading-view" active={currentPage === '/trading-view'} />
				<MenuItem label="Develop" external targetUrl="https://tradingstrategy.ai/docs/index.html" />
				<MenuItem label="Community" targetUrl="/community" active={currentPage === '/community'} />
				<MenuItem label="About" targetUrl="/about" active={currentPage === '/about'} />
			</svelte:fragment>

			<svelte:fragment slot="search">
				{#if showSearch}<Search />{/if}
			</svelte:fragment>
		</Header>
	</div>
</Section>
