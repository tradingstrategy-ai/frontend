<!--
	Render the token page
-->
<script context="module">
	import config from '$lib/config';
	import getApiError from '$lib/chain/getApiError';

	// load core token data server-side
	export async function load({ params, fetch }) {
		const chain_slug = params.chain;
		const address = params.token;

		const encoded = new URLSearchParams({ chain_slug, address });
		const apiUrl = `${config.backendUrl}/token/details?${encoded}`;

		const resp = await fetch(apiUrl);

		if (!resp.ok) {
			return getApiError(resp, 'token', [chain_slug, address]);
		}

		const tokenDetails = await resp.json();
		console.log('Token page > token details:', tokenDetails);

		return {
			// Cache the pair data pages for 30 minutes at the Cloudflare edge so the
			// pages are served really fast if they get popular, and also for speed test
			cache: {
				maxage: 30 * 60, // 30 minutes
				private: false
			},
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

<Breadcrumbs labels={{ [address]: tokenDetails.name }} />

<main>
	<header class="ds-container">
		<h1>{tokenDetails.name} ({tokenDetails.symbol})</h1>
	</header>

	<section class="ds-container token-info">
		<TokenInfoTable summary={tokenDetails} />

		<div class="text-summary">
			<p>
				<strong>{tokenDetails.name}</strong> is a {tokenStandardName} token on
				<a class="body-link" href="/trading-view/{chain_slug}">{tokenDetails.chain_name} blockchain</a>. It trades under
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

			<p class="smart-contract-address">
				The token smart contract address is
				<a class="body-link" href={tokenDetails.explorer_link}> {tokenDetails.address}</a>.
			</p>

			<p>
				The information on this page is for <a class="body-link" href="/trading-view/{chain_slug}"
					>{tokenDetails.chain_name}</a
				>.
				<strong>{tokenDetails.symbol}</strong> presentations bridged and wrapped on other blockchains are not included in
				the figures.
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
			tokenSymbol={tokenDetails.symbol}
			tokenAddress={address}
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
