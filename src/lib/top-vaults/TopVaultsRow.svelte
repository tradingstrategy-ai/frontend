<script lang="ts">
	import { getChain } from '$lib/helpers/chain';
	import type { VaultInfo } from './schemas';
	import { Timestamp } from '$lib/components';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { formatPercent, formatNumber, formatDollar, formatValue, formatAmount } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';

	interface Props {
		index: number;
		vault: VaultInfo;
		showChain: boolean;
	}

	const { index, vault, showChain }: Props = $props();
	const chain = getChain(vault.chain);
</script>

<tr>
	<td align="center" class="index">{index}</td>
	<td>
		<div class="chain">
			{#if showChain}
				{#if chain}
					<Tooltip>
						<a slot="trigger" href="/trading-view/{chain.slug}">
							<img src={getLogoUrl('blockchain', chain.slug)} alt={chain.name} />
						</a>
						<svelte:fragment slot="popup">
							{chain.name}
						</svelte:fragment>
					</Tooltip>
				{:else}
					<Tooltip>
						<div slot="trigger" class="no-logo">?</div>
						<svelte:fragment slot="popup">
							Chain {vault.chain}
						</svelte:fragment>
					</Tooltip>
				{/if}
			{/if}
			<div class="multiline">
				<strong>{vault.name}</strong>
				{#if vault.protocol}
					<span class="protocol">{vault.protocol}</span>
				{/if}
			</div>
		</div>
	</td>
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
	.index {
		vertical-align: middle !important;
	}

	.chain {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.625rem;
		align-items: center;
		--logo-size: 1.25rem;

		img {
			width: var(--logo-size);
			height: var(--logo-size);
		}

		.no-logo {
			display: grid;
			place-content: center;
			width: var(--logo-size);
			height: var(--logo-size);
			border-radius: 50%;
			background: var(--c-text-ultra-light);
		}
	}

	.multiline {
		display: grid;
		gap: 0.125rem;
	}

	.protocol {
		color: var(--c-text-light);
		text-transform: uppercase;
	}

	.fees-popup {
		text-align: right;
	}
</style>
