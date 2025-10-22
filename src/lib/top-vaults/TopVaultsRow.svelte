<script lang="ts">
	import type { VaultInfo } from './schemas';
	import { Timestamp } from '$lib/components';
	import { type ApiChain, getChain } from '$lib/helpers/chain';
	import { formatPercent, formatNumber, formatDollar, formatValue, formatAmount } from '$lib/helpers/formatters';

	interface Props {
		index: number;
		vault: VaultInfo;
		chain?: ApiChain | undefined;
	}

	const { index, vault, chain }: Props = $props();
</script>

<tr>
	<td>{index}</td>
	<td>
		<div class="multiline">
			<strong>{vault.name}</strong>
			{#if vault.protocol}
				<span class="protocol">{vault.protocol}</span>
			{/if}
		</div>
	</td>
	{#if !chain}
		{@const { name, slug } = getChain(vault.chain) ?? {}}
		<td>
			{#if slug}
				<a href={`/trading-view/${slug}`}>{name}</a>
			{:else}
				Chain {vault.chain}
			{/if}
		</td>
	{/if}
	<td align="right">{formatDollar(vault.current_tvl_usd, 2, 2)}</td>
	<td align="right">{formatPercent(vault['1m_return_ann'], 2)}</td>
	<td align="right">{formatPercent(vault['1m_return'], 2)}</td>
	<td align="right">{formatPercent(vault['3m_return_ann'], 2)}</td>
	<td align="right">{formatPercent(vault['3m_return'], 2)}</td>
	<td align="right">{formatNumber(vault['3m_sharpe'])}</td>
	<td align="right">{formatPercent(vault['3m_volatility'], 4)}</td>
	<td align="right">{formatPercent(vault.lifetime_return_ann, 2)}</td>
	<td align="right">{formatPercent(vault.lifetime_return, 2)}</td>
	<td align="right">{formatNumber(vault.age_years, 2, 4)}</td>
	<td align="center">{formatValue(vault.denomination)}</td>
	<td align="right">{formatDollar(vault.peak_tvl_usd, 2, 2)}</td>
	<td align="right">{formatAmount(vault.deposit_redeem_count)}</td>
	<td align="right">{formatPercent(vault.management_fee, 1)}</td>
	<td align="right">{formatPercent(vault.performance_fee, 1)}</td>
	<td class="multiline">
		<Timestamp date={vault.first_deposit} />
		<Timestamp date={vault.last_deposit} />
	</td>
	<td>{vault.address}</td>
</tr>

<style>
	.multiline {
		display: grid;
		gap: 0.125rem;
	}

	.protocol {
		color: var(--c-text-light);
		text-transform: uppercase;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
