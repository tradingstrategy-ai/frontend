<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import TokenIndexExplorer from '$lib/explorer/TokenIndexExplorer.svelte';
	import { PageHeader } from '$lib/components';

	const chainSlug = $page.params.chain;
	const chainName = chainSlug[0].toUpperCase() + chainSlug.slice(1);
</script>

<svelte:head>
	<title>Tokens on {chainName}</title>
	<meta name="description" content="Top tokens on {chainName} blockchain" />
</svelte:head>

<Breadcrumbs />

<main>
	<PageHeader title="Tokens">
		Browse supported decentralised tokens across
		<a href="/trading-view/blockchains">{chainName} blockchain</a>
	</PageHeader>

	<section class="ds-container">
		<TokenIndexExplorer
			enabledColumns={['name', 'symbol', 'liquidity_latest', 'volume_24h']}
			orderColumnIndex={2}
			{chainSlug}
		/>
	</section>
</main>

<style lang="postcss">
	main {
		display: grid;
		gap: var(--space-md);
	}

	section :global {
		& .col-exchange {
			padding-left: 0;
		}

		& .col-volume {
			width: 10%;
		}

		& .col-chain-name {
			width: 25%;
		}
	}
</style>
