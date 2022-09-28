<script lang="ts">
	import { formatDollar, formatPriceChange } from '$lib/helpers/formatters';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { formatDistanceToNowStrict } from 'date-fns';
	import { SmartContractWidget } from '$lib/components';

	export let summary: any;
	export let details: any;

	function formatTimeAgo(dateStr: string, options = {}) {
		const date = Date.parse(`${dateStr}Z`);
		return formatDistanceToNowStrict(date, { addSuffix: true, ...options });
	}

	$: priceChangeColorClass = determinePriceChangeClass(summary.price_change_24h);

	// TODO: Fix this in the data source
	$: [baseTokenName, quoteTokenName] = summary.pair_name.split('-');
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
		<strong class={priceChangeColorClass}>{formatDollar(summary.usd_price_latest)}</strong>
		and is
		<strong class={priceChangeColorClass}>
			{formatPriceChange(summary.price_change_24h)}
			{summary.price_change_24h > 0 ? 'up' : 'down'}
		</strong>
		against US Dollar for the last 24h.
	</p>

	<p>
		The pair has <strong>{formatDollar(summary.usd_volume_24h)}</strong> 24h trading volume with
		<strong>{formatDollar(summary.usd_liquidity_latest)}</strong>
		liquidity available at the moment. The trading of {summary.pair_symbol} started at
		<strong>{formatTimeAgo(details.first_trade_at, { unit: 'day' })}</strong>. The last trade was seen less than
		<strong>{formatTimeAgo(details.last_trade_at)}</strong>.
	</p>

	{#if details.pair_contract_address}
		<p class="smart-contract-address">
			The trading pair pool smart contract address is:
			<SmartContractWidget address={details.pair_contract_address} href={details.pair_explorer_link} />
		</p>
	{/if}
</div>

<style lang="postcss">
	.summary {
		align-self: start;
		display: grid;
		font: var(--f-ui-large-roman);
		gap: 1.4em;
	}

	p {
		font: inherit;
	}

	strong {
		font-weight: 700;
	}

	a {
		font-weight: 700;
		text-decoration: underline;
	}

	.smart-contract-address {
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
