<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import type { Chain } from '$lib/helpers/chain';
	import { getExplorerUrl } from '$lib/helpers/chain';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import { CopyWidget, HashAddress } from '$lib/components';
	import { formatAmount, notFilledMarker } from '$lib/helpers/formatters';

	interface Props {
		vault: VaultInfo;
		chain: Chain;
	}

	let { vault, chain }: Props = $props();

	let copyWidget = $state<CopyWidget>();

	const rows = $derived([
		{ label: 'Vault Address', value: vault.address, type: 'address' as const },
		{ label: 'Chain', value: chain, type: 'chain' as const },
		{ label: 'Share Token', value: vault.share_token },
		{ label: 'Vault ID', value: vault.id },
		{ label: 'Vault Slug', value: vault.vault_slug },
		{ label: 'Protocol', value: vault.protocol },
		{ label: 'Protocol Slug', value: vault.protocol_slug },
		{ label: 'Denomination', value: vault.denomination },
		{ label: 'Normalised Denomination', value: vault.normalised_denomination },
		{ label: 'Denomination Slug', value: vault.denomination_slug },
		{ label: 'Start Date', value: vault.start_date, type: 'date' as const },
		{ label: 'End Date', value: vault.end_date, type: 'date' as const },
		{ label: 'Last Updated', value: vault.last_updated_at, type: 'date' as const },
		{ label: 'Last Updated Block', value: vault.last_updated_block, type: 'number' as const },
		{ label: 'Fee Mode', value: vault.fee_mode },
		{ label: 'Fees Internalised', value: vault.fee_internalised, type: 'boolean' as const },
		{ label: 'Stablecoinish', value: vault.stablecoinish, type: 'boolean' as const },
		{ label: 'Features', value: vault.features, type: 'array' as const },
		{ label: 'Flags', value: vault.flags, type: 'array' as const },
		{ label: 'Event Count', value: vault.event_count, type: 'number' as const },
		{ label: 'Lifetime Samples', value: vault.lifetime_samples, type: 'number' as const },
		{ label: 'Lifetime Start', value: vault.lifetime_start, type: 'date' as const },
		{ label: 'Lifetime End', value: vault.lifetime_end, type: 'date' as const },
		{ label: '1 Month Samples', value: vault.one_month_samples, type: 'number' as const },
		{ label: '1 Month Start', value: vault.one_month_start, type: 'date' as const },
		{ label: '1 Month End', value: vault.one_month_end, type: 'date' as const },
		{ label: '3 Month Samples', value: vault.three_months_samples, type: 'number' as const },
		{ label: '3 Month Start', value: vault.three_months_start, type: 'date' as const },
		{ label: '3 Month End', value: vault.three_months_end, type: 'date' as const }
	]);

	function formatValue(value: unknown, type?: string): string {
		if (value === null || value === undefined) return notFilledMarker;

		switch (type) {
			case 'date':
				return String(value);
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
						<td class="label">{row.label}</td>
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
								<a href="/trading-view/{row.value.slug}">{row.value.name} ({row.value.id})</a>
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
</style>
