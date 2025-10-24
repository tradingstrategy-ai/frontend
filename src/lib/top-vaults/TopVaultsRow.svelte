<script lang="ts">
	import type { VaultInfo } from './schemas';
	import { Timestamp } from '$lib/components';
	import { type ApiChain, getChain } from '$lib/helpers/chain';
	import { formatPercent, formatNumber, formatDollar, formatValue, formatAmount } from '$lib/helpers/formatters';
	import Tooltip from '$lib/components/Tooltip.svelte';

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
	<td align="right">{formatNumber(vault['3m_sharpe'], 1)}</td>
	<td align="right">{formatPercent(vault['3m_volatility'])}</td>
	<td align="right">{formatPercent(vault.lifetime_return_ann, 2)}</td>
	<td align="right">{formatPercent(vault.lifetime_return, 2)}</td>
	<td align="right">{formatNumber(vault.age_years, 2)}</td>
	<td align="right"><Timestamp date={vault.last_deposit} relative={{ strict: true }} /></td>
	<td align="center">{formatValue(vault.denomination)}</td>
	<td align="right">{formatDollar(vault.peak_tvl_usd, 2, 2)}</td>
	<td align="right">{formatAmount(vault.deposit_redeem_count)}</td>
	<td align="right">
		{#if !vault.management_fee && !vault.performance_fee}
			---
		{:else}
			<Tooltip>
				<div class="multiline" slot="trigger">
					{#if vault.management_fee}
						<div>{formatPercent(vault.management_fee, 1)}</div>
					{/if}
					{#if vault.performance_fee}
						<div>{formatPercent(vault.performance_fee, 1)}</div>
					{/if}
				</div>
				<div slot="popup" class="fees-popup">
					<div>{formatPercent(vault.management_fee, 1)} Management fee</div>
					<div>{formatPercent(vault.performance_fee, 1)} Performance fee</div>
				</div>
			</Tooltip>
		{/if}
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

	.fees-popup {
		text-align: right;
	}
</style>
