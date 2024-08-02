<script lang="ts">
	import type { LendingReserveDocument } from '$lib/search/trading-entities';
	import { formatAmount } from '$lib/helpers/formatters';
	import { getTokenStandardName } from '$lib/chain/tokenstandard';
	import { CryptoAddressWidget } from '$lib/components';

	export let token: any;
	export let reserves: LendingReserveDocument[];
</script>

<div class="summary">
	<p>
		<strong>{token.name}</strong> is a {getTokenStandardName(token.chain_slug)} token on
		<a href="/trading-view/{token.chain_slug}">{token.chain_name} blockchain</a>. It trades under
		<strong>{token.symbol}</strong> ticker.
	</p>

	<p>
		<strong>{token.name}</strong> token supply is {formatAmount(token.total_supply)}
		<strong>{token.symbol}s</strong>.
		{#if token.pair_count}
			There are total {formatAmount(token.pair_count)} pairs trading against <strong>{token.symbol}</strong>.
		{/if}
	</p>

	{#if reserves.length}
		<p>
			<strong>{token.symbol}</strong> tokens may be supplied (to earn interst) or borrowed (with collateral) using an
			{#each reserves as reserve, idx}
				{idx > 0 ? ' or ' : ''}
				<a href={reserve.url_path}>{reserve.lending_protocol}</a>
			{/each}
			lending reserve.
		</p>
	{/if}

	<p class="smart-contract">
		The token smart contract address is
		<CryptoAddressWidget address={token.address} href={token.explorer_link} />
	</p>
</div>

<style lang="postcss">
	.summary {
		display: grid;
		font: var(--f-ui-large-roman);
		gap: 1.4em;

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
	}
</style>
