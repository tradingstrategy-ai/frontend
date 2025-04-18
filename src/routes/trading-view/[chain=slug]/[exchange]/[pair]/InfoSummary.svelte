<script lang="ts">
	import { CopyWidget, CryptoAddressWidget } from '$lib/components';
	import { getProfitInfo } from '$lib/components/Profitability.svelte';
	import { formatDollar } from '$lib/helpers/formatters';
	import { formatDistanceToNowStrict } from 'date-fns';

	export let summary: Record<string, string | number>;
	export let details: Record<string, string | number>;
	export let pageUrl: string;

	function formatTimeAgo(dateStr: string, options = {}) {
		if (!dateStr) return '(data unavailable)';
		const date = Date.parse(`${dateStr}Z`);
		return formatDistanceToNowStrict(date, { addSuffix: true, ...options });
	}

	// TODO: Fix this in the data source
	$: [baseTokenName, quoteTokenName] = summary.pair_name.split('-');

	$: priceChange = getProfitInfo(summary.price_change_24h);

	let copyWidget: CopyWidget;

	// Construct and copy identifier used in Python code (such as Jupyter notebooks); e.g.:
	// (ChainId.ethereum, "uniswap-v3", "WETH", "USDC", 0.0005) # Ether-USD Coin http://localhost:5173/trading-view/ethereum/uniswap-v3/eth-usdc-fee-5
	function copyPythonIdentifier(this: HTMLButtonElement) {
		const parts = [
			`ChainId.${summary.chain_slug}`,
			`"${summary.exchange_slug}"`,
			`"${summary.base_token_symbol}"`,
			`"${summary.quote_token_symbol}"`,
			summary.pair_swap_fee
		];
		const identifier = `(${parts.join(', ')}) # ${summary.pair_name} ${pageUrl}`;
		copyWidget?.copy(identifier);
		this.blur();
	}
</script>

<div class="summary">
	<p>
		The token pair
		<a href="/trading-view/{summary.chain_slug}/tokens/{summary.base_token_address}">
			{baseTokenName}
		</a>
		&ndash;
		<a href="/trading-view/{summary.chain_slug}/tokens/{summary.quote_token_address}">
			{quoteTokenName}
		</a>
		trades as the ticker <strong>{summary.pair_symbol}</strong> on
		<a href="/trading-view/{summary.chain_slug}/{summary.exchange_slug}">
			{summary.exchange_name} exchange
		</a>
		on
		<a href="/trading-view/{summary.chain_slug}">{summary.chain_name} blockchain</a>.
	</p>

	<p>
		The price of
		<a href="/trading-view/{summary.chain_slug}/tokens/{summary.base_token_address}">
			{summary.base_token_symbol}
		</a>
		in <strong>{summary.pair_symbol}</strong> pair is
		<strong class={priceChange.directionClass}>{formatDollar(summary.usd_price_latest)}</strong>
		and is
		<strong class={priceChange.directionClass}>
			{priceChange}
			{priceChange.getLabel('down', '', 'up')}
		</strong>
		against US Dollar for the last 24h.
	</p>

	<p>
		The pair has <strong>{formatDollar(summary.usd_volume_24h)}</strong>
		{#if summary.liquidity_type === 'xyliquidity'}
			24h trading volume with
			<strong>{formatDollar(summary.usd_liquidity_latest)}</strong> liquidity available at the moment.
		{:else if Number.isFinite(summary.pair_tvl)}
			24h trading volume with
			<strong>{formatDollar(summary.pair_tvl)}</strong> total value currently locked in the pool.
		{:else}
			24h trading volume.
		{/if}
		{#if details.first_trade_at}
			The trading of {summary.pair_symbol} started at
			<strong>{formatTimeAgo(details.first_trade_at, { unit: 'day' })}</strong>.
		{/if}
		{#if details.last_trade_at}
			The last trade was seen less than <strong>{formatTimeAgo(details.last_trade_at)}</strong>.
		{/if}
	</p>

	<p class="smart-contract">
		The trading pair pool smart contract address is
		<CryptoAddressWidget address={details.pair_contract_address} href={details.pair_explorer_link} />
	</p>

	<button class="get-python-identifier tile b" on:click={copyPythonIdentifier}>
		<span class="info">Get a Python identifier for use in Jupyter notebooks</span>
		<span class="cta tile d">
			Copy
			<CopyWidget bind:this={copyWidget} --icon-size="1rem" />
		</span>
	</button>
</div>

<style>
	.summary {
		display: grid;
		gap: 1.4em;
		align-self: start;
		font: var(--f-ui-large-roman);
	}

	strong {
		font-weight: 700;
	}

	a {
		font-weight: 700;
		text-decoration: underline;
	}

	.smart-contract {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		align-items: flex-start;
	}

	.get-python-identifier {
		display: flex;
		gap: 1rem;
		align-items: center;
		width: fit-content;
		padding: 0.75rem 1rem;
		border: none;
		cursor: pointer;
		text-align: left;

		.info {
			font: var(--f-ui-md-medium);
			letter-spacing: var(--f-ui-md-spacing, normal);
			color: var(--c-text-light);
		}

		.cta {
			display: inline-flex;
			gap: 0.375em;
			padding: 0.375rem 0.875rem;
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--f-ui-sm-spacing, normal);
			color: var(--c-text);
			transition: var(--transition-1);
			--background-hover: var(--c-text);
		}

		&:hover .cta {
			color: var(--c-text-inverted);
		}
	}
</style>
