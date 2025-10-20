<script lang="ts">
	import type { VaultInfo } from './schemas';
	import { Timestamp } from '$lib/components';
	import { getChain } from '$lib/helpers/chain';
	import {
		formatPercent,
		formatNumber,
		formatDollar,
		formatValue,
		formatAmount,
		formatShortAddress
	} from '$lib/helpers/formatters';

	interface Props {
		vault: VaultInfo;
	}

	const { vault }: Props = $props();
	const chain = getChain(vault.chain);
</script>

<tr>
	<td>
		<div class="vault-name">
			<strong>{vault.name}</strong>
			{#if vault.protocol}
				<span class="protocol">{vault.protocol}</span>
			{/if}
		</div>
	</td>
	<td>
		{#if chain}
			<a class="chain-link" href={`/trading-view/${chain.slug}`}>{chain.name}</a>
		{:else}
			Chain {vault.chain}
		{/if}
	</td>
	<td>{formatPercent(vault['1m_return'], 2)}</td>
	<td>{formatPercent(vault['1m_return_ann'], 2)}</td>
	<td>{formatPercent(vault['3m_return_ann'], 2)}</td>
	<td>{formatNumber(vault['3m_sharpe'])}</td>
	<td>{formatPercent(vault.lifetime_return_ann, 2)}</td>
	<td>{formatDollar(vault.current_tvl_usd, 2, 2)}</td>
	<td>{formatNumber(vault.age_years, 2, 4)}</td>
	<td>{formatValue(vault.denomination)}</td>
	<td>{formatDollar(vault.peak_tvl_usd, 2, 2)}</td>
	<td>{formatPercent(vault['3m_return'], 2)}</td>
	<td>{formatPercent(vault.lifetime_return, 2)}</td>
	<td>{formatPercent(vault['3m_volatility'], 4)}</td>
	<td>{formatAmount(vault.deposit_redeem_count)}</td>
	<td>{formatPercent(vault.management_fee, 1)}</td>
	<td>{formatPercent(vault.performance_fee, 1)}</td>
	<td><Timestamp date={vault.first_deposit} withTime /> UTC</td>
	<td><Timestamp date={vault.last_deposit} withTime /> UTC</td>
	<td class="address-cell" title={vault.address}>{formatShortAddress(vault.address)}</td>
	<td class="id-cell" title={vault.id}>{vault.id}</td>
</tr>
