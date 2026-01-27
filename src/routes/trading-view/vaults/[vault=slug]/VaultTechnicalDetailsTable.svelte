<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import type { Chain } from '$lib/helpers/chain';
	import { getExplorerUrl } from '$lib/helpers/chain';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import { CopyWidget, HashAddress, Timestamp, Tooltip } from '$lib/components';
	import { formatAmount, notFilledMarker } from '$lib/helpers/formatters';
	import { parseDate } from '$lib/helpers/date';

	const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

	interface Props {
		vault: VaultInfo;
		chain: Chain;
	}

	let { vault, chain }: Props = $props();

	let copyWidget = $state<CopyWidget>();

	let lastUpdatedStale = $derived.by(() => {
		const lastUpdated = parseDate(vault.last_updated_at);
		if (!lastUpdated) return false;
		return Date.now() - lastUpdated.getTime() > THREE_DAYS_MS;
	});

	const rows = $derived([
		{ label: 'Vault name', value: vault.name },
		{ label: 'Vault address', value: vault.address, type: 'address' as const },
		{ label: 'Chain', value: chain, type: 'chain' as const },
		{
			label: 'Denomination',
			value: { name: vault.denomination, slug: vault.denomination_slug, address: vault.denomination_token_address },
			type: 'denomination' as const
		},
		{
			label: 'Share token',
			value: { name: vault.share_token, address: vault.share_token_address },
			type: 'token' as const
		},
		{
			label: 'Protocol',
			value: { name: vault.protocol, slug: vault.protocol_slug },
			type: 'protocol' as const
		},
		{
			label: 'Homepage',
			value: { url: vault.link, hasProtocol: !(vault.link || '').includes('routescan') },
			type: 'link' as const
		},
		{
			label: 'Current <a href="/glossary/total-value-locked-tvl">TVL</a>',
			value: { amount: vault.current_nav, symbol: vault.denomination },
			type: 'currency' as const
		},
		{
			label: 'Peak <a href="/glossary/total-value-locked-tvl">TVL</a>',
			value: { amount: vault.peak_nav, symbol: vault.denomination },
			type: 'currency' as const
		},
		{
			label: 'Last share price',
			value: { amount: vault.last_share_price, symbol: vault.denomination },
			type: 'currency' as const
		},
		{ label: 'Last updated', value: vault.last_updated_at, type: 'relativeDate' as const },
		{ label: 'Last updated block', value: vault.last_updated_block, type: 'number' as const },

		{ label: 'Data starts', value: vault.start_date, type: 'date' as const },
		{ label: 'Fee mode', value: vault.fee_mode },
		{ label: 'Fees internalised', value: vault.fee_internalised, type: 'boolean' as const },
		{ label: 'Features', value: vault.features, type: 'array' as const },
		{ label: 'Flags', value: vault.flags, type: 'array' as const },
		{ label: 'Deposit events', value: vault.event_count, type: 'number' as const }
	]);

	function formatValue(value: unknown, type?: string): string {
		if (value === null || value === undefined) return notFilledMarker;

		switch (type) {
			case 'date':
				return String(value).replace('T', ' ') + ' UTC';
			case 'number':
				return formatAmount(value as number);
			case 'boolean':
				return value ? 'Yes' : 'No';
			case 'array':
				return (value as string[]).length > 0 ? (value as string[]).join(', ') : notFilledMarker;
			default:
				return String(value);
		}
	}
</script>

<MetricsBox title="Technical Details">
	<div class="table-wrapper">
		<table class="details-table">
			<tbody>
				{#each rows as row}
					<tr>
						<td class="label">{@html row.label}</td>
						<td class="value">
							{#if row.type === 'address'}
								<span class="address-cell">
									<a href={getExplorerUrl(chain, row.value)} target="_blank" rel="noreferrer">
										<HashAddress address={row.value} endChars={7} />
									</a>
									<button title="Copy to clipboard" onclick={() => copyWidget?.copy(row.value)}>
										<CopyWidget bind:this={copyWidget} />
									</button>
								</span>
							{:else if row.type === 'chain'}
								<a href="/trading-view/vaults/chains/{row.value.slug}">{row.value.name} ({row.value.id})</a>
							{:else if row.type === 'denomination'}
								<a href="/trading-view/vaults/stablecoins/{row.value.slug}">{row.value.name}</a>
								{#if row.value.address}
									(<a href={getExplorerUrl(chain, row.value.address)} target="_blank" rel="noreferrer">
										<HashAddress address={row.value.address} endChars={4} />
									</a>)
								{/if}
							{:else if row.type === 'token'}
								{row.value.name}
								{#if row.value.address}
									(<a href={getExplorerUrl(chain, row.value.address)} target="_blank" rel="noreferrer">
										<HashAddress address={row.value.address} endChars={4} />
									</a>)
								{/if}
							{:else if row.type === 'protocol'}
								<a href="/trading-view/vaults/protocols/{row.value.slug}">{row.value.name}</a>
							{:else if row.type === 'currency'}
								{row.value.amount != null ? `${formatAmount(row.value.amount)} ${row.value.symbol}` : notFilledMarker}
							{:else if row.type === 'link'}
								{#if row.value.url}
									<a href={row.value.url} target="_blank" rel="noreferrer">
										{row.value.hasProtocol ? 'View vault on protocol website' : 'View vault on blockchain explorer'}
									</a>
								{:else}
									{notFilledMarker}
								{/if}
							{:else if row.type === 'relativeDate'}
								{#if row.value}
									{#if lastUpdatedStale}
										<Tooltip>
											<span slot="trigger" class="stale-date">
												<Timestamp date={row.value} withTime relative>
													{#snippet children({ dateStr, timeStr, relativeStr })}
														{dateStr} {timeStr} UTC ({relativeStr})
													{/snippet}
												</Timestamp>
											</span>
											<svelte:fragment slot="popup">
												Currently the vault is experiencing some issues causing the failed data reads.
											</svelte:fragment>
										</Tooltip>
									{:else}
										<Timestamp date={row.value} withTime relative>
											{#snippet children({ dateStr, timeStr, relativeStr })}
												{dateStr} {timeStr} UTC ({relativeStr})
											{/snippet}
										</Timestamp>
									{/if}
								{:else}
									{notFilledMarker}
								{/if}
							{:else}
								{formatValue(row.value, row.type)}
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</MetricsBox>

<style>
	.table-wrapper {
		overflow-x: auto;
	}

	.details-table {
		width: 100%;
		border-collapse: collapse;
		font: var(--f-ui-md-roman);

		@media (--viewport-sm-down) {
			font: var(--f-ui-sm-roman);
		}

		tr {
			border-bottom: 1px solid var(--c-text-extra-light);

			&:last-child {
				border-bottom: none;
			}
		}

		td {
			padding: 0.5rem 0;

			@media (--viewport-sm-down) {
				padding: 0.375rem 0;
			}
		}

		.label {
			font-weight: 500;
			color: var(--c-text-light);
			white-space: nowrap;
			width: 40%;
			padding-right: 1rem;

			:global(a) {
				text-decoration: underline;
				text-decoration-style: dashed;
			}
		}

		.value {
			word-break: break-word;

			a {
				text-decoration: underline;
				text-decoration-style: dashed;
			}
		}
	}

	.address-cell {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;

		button {
			border: none;
			padding: 0;
			background: none;
			cursor: pointer;
		}
	}

	.stale-date {
		color: var(--c-error);
		border-bottom: 1px dotted var(--c-error);
	}
</style>
