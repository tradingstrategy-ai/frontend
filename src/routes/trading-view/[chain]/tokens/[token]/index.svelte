<!--
	Render the token page
-->
<script context="module">
	import getApiError from '$lib/chain/getApiError';

	// load core token data server-side
	export async function load({ params, fetch, session }) {
		const { backendUrl } = session.config;
		const chain_slug = params.chain;
		const address = params.token;

		const encoded = new URLSearchParams({ chain_slug, address });
		const apiUrl = `${backendUrl}/token/details?${encoded}`;

		const resp = await fetch(apiUrl);

		if (!resp.ok) {
			return getApiError(resp, 'token', [chain_slug, address]);
		}

		const tokenDetails = await resp.json();
		console.log('Token page > token details:', tokenDetails);

		return {
			// Cache the pair data pages for 30 minutes at the Cloudflare edge so the
			// pages are served really fast if they get popular, and also for speed test
			maxage: 30 * 60, // 30 minutes,
			props: { chain_slug, address, tokenDetails }
		};
	}
</script>

<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import TokenInfoTable from '$lib/content/TokeninfoTable.svelte';
	import StaleDataWarning from '$lib/chain/StaleDataWarning.svelte';
	import PairExplorer from '$lib/explorer/PairExplorer.svelte';
	import { getTokenStandardName } from '$lib/chain/tokenstandard';
	import { formatAmount } from '$lib/helpers/formatters';

	export let chain_slug;
	export let address;
	export let tokenDetails;

	$: tokenStandardName = getTokenStandardName(chain_slug);
</script>

<svelte:head>
	<title>
		{tokenDetails.symbol} on {tokenDetails.chain_name}
	</title>
	<meta
		name="description"
		content={`${tokenDetails.name} (${tokenDetails.symbol} ${tokenStandardName} on ${tokenDetails.chain_name}`}
	/>
</svelte:head>

<div class="container">
	<Breadcrumbs labels={{ [address]: tokenDetails.name }} />

	<div class="text-section">
		<div class="row">
			<div class="col-md-12">
				<h1>
					{tokenDetails.name} ({tokenDetails.symbol})
				</h1>
			</div>
		</div>

		<div class="row">
			<div class="col-lg-5">
				<TokenInfoTable summary={tokenDetails} />
			</div>

			<div class="col-lg-7">
				<p>
					<strong>{tokenDetails.name}</strong> is a {tokenStandardName} token on
					<a class="body-link" href="/trading-view/{chain_slug}">{tokenDetails.chain_name} blockchain</a>. It trades
					under
					<strong>{tokenDetails.symbol}</strong> ticker.
				</p>

				<p>
					<strong>{tokenDetails.name}</strong> token supply is
					{formatAmount(parseFloat(tokenDetails.total_supply))}
					<strong>{tokenDetails.symbol}s</strong>.
				</p>

				{#if tokenDetails.pair_count}
					<p>
						There are total {formatAmount(tokenDetails.pair_count)} pairs trading against
						<strong>{tokenDetails.symbol}</strong>.
					</p>
				{/if}

				<p>
					The token smart contract address is
					<a class="body-link" href={tokenDetails.explorer_link}> {tokenDetails.address}</a>.
				</p>

				<p>
					The information on this page is for <a class="body-link" href="/trading-view/{chain_slug}"
						>{tokenDetails.chain_name}</a
					>.
					<strong>{tokenDetails.symbol}</strong> presentations bridged and wrapped on other blockchains are not included
					in the figures.
				</p>
			</div>
		</div>
	</div>

	<div class="pair-explorer-wrapper">
		<h1>Trading pairs</h1>

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
			tokenSymbol={tokenDetails.symbol}
			tokenAddress={address}
		/>

		<p>
			<small>
				* Trading pairs with complications, like the lack of liquidity, might not be displayed.
				<a class="body-link" rel="external" href="https://tradingstrategy.ai/docs/programming/tracking.html">
					Read the rules for tracked trading pairs.
				</a>
			</small>
		</p>
	</div>
</div>

<style>
	h1 {
		font-size: 2rem;
		margin-bottom: 20px;
	}

	.text-section {
		margin-top: 20px;
	}

	.pair-explorer-wrapper {
		margin-bottom: 60px;
	}

	small {
		opacity: 0.3;
	}
</style>
