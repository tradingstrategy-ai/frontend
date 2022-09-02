<script lang="ts">
	import type { PageData } from './$types';
	import { getTokenStandardName } from '$lib/chain/tokenstandard';
	import { formatAmount } from '$lib/helpers/formatters';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import TokenInfoTable from '$lib/content/TokeninfoTable.svelte';
	import StaleDataWarning from '$lib/chain/StaleDataWarning.svelte';
	import PairExplorer from '$lib/explorer/PairExplorer.svelte';

	export let data: PageData;

	$: tokenStandardName = getTokenStandardName(data.chain_slug);
</script>

<svelte:head>
	<title>
		{data.symbol} on {data.chain_name}
	</title>
	<meta name="description" content={`${data.name} (${data.symbol} ${tokenStandardName} on ${data.chain_name}`} />
</svelte:head>

<Breadcrumbs labels={{ [data.address]: data.name }} />

<main>
	<header class="ds-container">
		<h1>{data.name} ({data.symbol})</h1>
	</header>

	<section class="ds-container token-info">
		<TokenInfoTable summary={data} />

		<div class="text-summary">
			<p>
				<strong>{data.name}</strong> is a {tokenStandardName} token on
				<a class="body-link" href="/trading-view/{data.chain_slug}">{data.chain_name} blockchain</a>. It trades under
				<strong>{data.symbol}</strong> ticker.
			</p>

			<p>
				<strong>{data.name}</strong> token supply is
				{formatAmount(parseFloat(data.total_supply))}
				<strong>{data.symbol}s</strong>.
			</p>

			{#if data.pair_count}
				<p>
					There are total {formatAmount(data.pair_count)} pairs trading against
					<strong>{data.symbol}</strong>.
				</p>
			{/if}

			<p class="smart-contract-address">
				The token smart contract address is
				<a class="body-link" href={data.explorer_link}> {data.address}</a>.
			</p>

			<p>
				The information on this page is for <a class="body-link" href="/trading-view/{data.chain_slug}"
					>{data.chain_name}</a
				>.
				<strong>{data.symbol}</strong> presentations bridged and wrapped on other blockchains are not included in the figures.
			</p>
		</div>
	</section>

	<section class="ds-container" style:gap="0.5rem">
		<h2>Trading pairs</h2>

		<StaleDataWarning allChains={true} />

		<PairExplorer
			enabledColumns={[
				'pair_name',
				'exchange_name',
				'usd_price_latest',
				'price_change_24h',
				'usd_volume_30d',
				'usd_liquidity_latest',
				'liquidity_change_24h'
			]}
			orderColumnIndex={4}
			pageLength={50}
			tokenSymbol={data.symbol}
			tokenAddress={data.address}
		/>
	</section>

	<section class="ds-container">
		<p>
			<small>
				* Trading pairs with complications, like the lack of liquidity, might not be displayed.
				<a class="body-link" rel="external" href="https://tradingstrategy.ai/docs/programming/tracking.html">
					Read the rules for tracked trading pairs.
				</a>
			</small>
		</p>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: 1rem;
	}

	h1,
	h2 {
		font: var(--f-h3-medium);
	}

	.text-summary {
		align-self: start;
		display: grid;
		gap: 1rem;
	}

	.smart-contract-address {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	small {
		opacity: 0.3;
	}

	@media (--viewport-lg-up) {
		.token-info {
			grid-template-columns: 4fr 5fr;
		}
	}
</style>
