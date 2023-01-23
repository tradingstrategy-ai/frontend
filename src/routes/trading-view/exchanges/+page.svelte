<!--
	Render listing of all available exchanges
-->
<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import ExchangeExplorer from '$lib/explorer/ExchangeExplorer.svelte';
	import { PageHeader } from '$lib/components';
</script>

<svelte:head>
	<title>Decentralised exchanges</title>
	<meta name="description" content="Top decentralised exchanges" />
</svelte:head>

<Breadcrumbs />

<main>
	<PageHeader
		title="Decentralised exchanges"
		description="Browse supported decentralised exchanges across all blockchains"
	/>

	<section class="ds-container">
		<ExchangeExplorer
			enabledColumns={['human_readable_name', 'chain_name', 'pair_count', 'usd_volume_30d']}
			orderColumnIndex={3}
			filterJunk={false}
		/>
	</section>
</main>

<style lang="postcss">
	main {
		display: grid;
		gap: var(--space-md);
	}
</style>
