<!--
@component
Summarise a token's identity, supply and smart-contract address.
-->
<script lang="ts">
	import type { TokenDetails } from '$lib/explorer/token-client.js';
	import { formatAmount } from '$lib/helpers/formatters';
	import { getTokenStandardName } from '$lib/chain/tokenstandard';
	import { CryptoAddressWidget } from '$lib/components';

	let { token }: { token: TokenDetails } = $props();
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

	<p class="smart-contract">
		The token smart contract address is
		<CryptoAddressWidget address={token.address} href={token.explorer_link} />
	</p>
</div>

<style>
	.summary {
		display: grid;
		gap: 1.4em;
		align-self: start;
		font: var(--f-ui-large-roman);

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
