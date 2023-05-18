<script lang="ts">
	import { formatAmount } from '$lib/helpers/formatters';
	import { getTokenStandardName } from '$lib/chain/tokenstandard';
	import { CryptoAddressWidget } from '$lib/components';

	export let data: any;
</script>

<div class="summary">
	<p>
		<strong>{data.name}</strong> is a {getTokenStandardName(data.chain_slug)} token on
		<a href="/trading-view/{data.chain_slug}">{data.chain_name} blockchain</a>. It trades under
		<strong>{data.symbol}</strong> ticker.
	</p>

	<p>
		<strong>{data.name}</strong> token supply is {formatAmount(parseFloat(data.total_supply))}
		<strong>{data.symbol}s</strong>.
		{#if data.pair_count}
			There are total {formatAmount(data.pair_count)} pairs trading against <strong>{data.symbol}</strong>.
		{/if}
	</p>

	<p class="smart-contract">
		The token smart contract address is
		<CryptoAddressWidget address={data.address} href={data.explorer_link} />
	</p>

	<p>
		The information on this page is for <a href="/trading-view/{data.chain_slug}">{data.chain_name}</a>.
		<strong>{data.symbol}</strong> presentations bridged and wrapped on other blockchains are not included in the figures.
	</p>
</div>

<style lang="postcss">
	.summary {
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
