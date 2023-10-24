<script lang="ts">
	import { fromUnixTime } from 'date-fns';
	import { formatAmount, formatDollar } from '$lib/helpers/formatters';
	import { CryptoAddressWidget } from '$lib/components';

	export let details: any;
</script>

<div class="summary">
	<p>
		<strong>{details.human_readable_name}</strong> is a decentralised exchange on
		<a href="/trading-view/{details.chain_slug}">{details.chain_name} blockchain</a>.
	</p>

	<p>
		{details.human_readable_name} has 30 days trade volume of
		<strong>{formatDollar((details.buy_volume_30d || 0) + (details.sell_volume_30d || 0))}</strong>
		and all-time volume of
		<strong>{formatDollar((details.buy_volume_all_time || 0) + (details.sell_volume_all_time || 0))}</strong>.
		{#if details.first_trade_at}
			The first trade happened on <strong>{fromUnixTime(details.first_trade_at).toDateString()}</strong>.
		{/if}
	</p>

	<p>
		{details.human_readable_name} has <strong>{formatAmount(details.pair_count)}</strong>
		token trading pairs of which <strong>{formatAmount(details.active_pair_count)}</strong> are
		<a href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html" rel="external">actively tracked</a>
		by Trading Strategy.
	</p>

	<p class="smart-contract">
		The factory smart contract address for {details.human_readable_name} is
		<CryptoAddressWidget address={details.address} href={details.blockchain_explorer_link} />
	</p>
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

	.smart-contract {
		display: grid;
		gap: var(--space-md);
		justify-content: flex-start;
	}
</style>
